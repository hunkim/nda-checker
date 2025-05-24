import { NextResponse } from "next/server"

interface SolarLLMMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface SolarLLMResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

async function analyzeWithSolarLLM(referenceText: string, customerText: string): Promise<any> {
  const apiKey = process.env.UPSTAGE_API_KEY
  
  if (!apiKey) {
    throw new Error("UPSTAGE_API_KEY environment variable is required")
  }

  const jsonSchema = {
    type: "object",
    properties: {
      sections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            match: { type: "number", minimum: 0, maximum: 100 },
            differences: { type: "string" }
          },
          required: ["title", "match", "differences"]
        }
      },
      risks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            section: { type: "string" },
            severity: { type: "string", enum: ["low", "medium", "high"] },
            title: { type: "string" },
            description: { type: "string" },
            recommendation: { type: "string" }
          },
          required: ["section", "severity", "title", "description", "recommendation"]
        }
      },
      summary: {
        type: "object",
        properties: {
          overallRisk: { type: "string", enum: ["low", "medium", "high"] },
          keyIssues: {
            type: "array",
            items: { type: "string" }
          },
          recommendation: { type: "string" }
        },
        required: ["overallRisk", "keyIssues", "recommendation"]
      }
    },
    required: ["sections", "risks", "summary"]
  }

  const messages: SolarLLMMessage[] = [
    {
      role: "system",
      content: "You are an expert legal assistant specializing in NDA (Non-Disclosure Agreement) analysis. You help identify risks, differences, and provide recommendations for contract negotiations. You must respond with valid JSON following the specified schema."
    },
    {
      role: "user",
      content: `I have two NDAs to compare: a reference NDA and a customer NDA.
      
Reference NDA:
${referenceText}

Customer NDA:
${customerText}

Please analyze these NDAs and provide a detailed comparison. Focus on:
1. A section-by-section comparison highlighting differences with match percentages
2. Identification of potential risks in the customer NDA compared to the reference NDA
3. Recommendations on whether to accept, negotiate, or reject specific terms
4. An overall risk assessment (low, medium, high)

Provide your response as a JSON object with the following structure:
- sections: Array of section comparisons with title, match percentage (0-100), and differences
- risks: Array of identified risks with section, severity (low/medium/high), title, description, and recommendation
- summary: Object with overallRisk (low/medium/high), keyIssues array, and overall recommendation

Focus on practical legal analysis and actionable recommendations.`
    }
  ]

  const response = await fetch('https://api.upstage.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "solar-pro2-preview",
      messages: messages,
      reasoning_effort: "high",
      stream: false,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "nda_analysis",
          schema: jsonSchema,
          strict: true
        }
      }
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Upstage SolarLLM API error: ${response.status} - ${errorText}`)
  }

  const result: SolarLLMResponse = await response.json()
  
  if (!result.choices || result.choices.length === 0) {
    throw new Error("No response from SolarLLM")
  }

  const content = result.choices[0].message.content
  
  try {
    return JSON.parse(content)
  } catch (parseError) {
    console.error("Failed to parse SolarLLM response as JSON:", content)
    throw new Error("LLM response was not valid JSON")
  }
}

export async function POST(req: Request) {
  try {
    const { referenceText, customerText } = await req.json()

    if (!referenceText || !customerText) {
      return NextResponse.json({ error: "Both reference and customer NDA texts are required" }, { status: 400 })
    }

    try {
      // Use Upstage SolarLLM for analysis
      const analysis = await analyzeWithSolarLLM(referenceText, customerText)
      
      return NextResponse.json(analysis)
      
    } catch (analysisError) {
      console.error("Error analyzing with SolarLLM:", analysisError)
      
      // Fallback to mock data if SolarLLM fails
      const mockAnalysis = {
        sections: [
          {
            title: "1. Definitions",
            match: 90,
            differences: "Minor wording differences, but substantially the same meaning",
          },
          {
            title: "2. Confidential Information",
            match: 75,
            differences: "Customer NDA requires written authorization for any use",
          },
          {
            title: "3. Term and Termination",
            match: 60,
            differences: "Customer NDA extends term to 5 years with automatic renewal",
          },
        ],
        risks: [
          {
            section: "5. Term and Termination",
            severity: "high",
            title: "Extended Term Duration",
            description: "The customer NDA extends the term to 5 years with automatic renewal",
            recommendation: "Negotiate to reduce term to 3 years and remove automatic renewal",
          },
          {
            section: "4. Indemnification",
            severity: "medium",
            title: "Broad Indemnification Clause",
            description: "Customer NDA includes broader indemnification requirements",
            recommendation: "Consider mutual indemnification or limit scope",
          },
        ],
        summary: {
          overallRisk: "high",
          keyIssues: ["Extended term", "Indemnification clause", "Jurisdiction requirements"],
          recommendation: "Negotiate key terms before signing. Pay special attention to term duration and indemnification clauses.",
        },
        error: "Analysis performed with fallback system due to AI service unavailability"
      }

      return NextResponse.json(mockAnalysis)
    }

  } catch (error) {
    console.error("Error analyzing NDAs:", error)
    return NextResponse.json({ error: "Failed to analyze NDAs" }, { status: 500 })
  }
}
