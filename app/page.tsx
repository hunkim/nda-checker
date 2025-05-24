"use client"

import { useState } from "react"
import Link from "next/link"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { ComparisonView } from "@/components/comparison-view"
import { RiskAnalysis } from "@/components/risk-analysis"
import { SummaryView } from "@/components/summary-view"
import { Loader2, CheckCircle, FileText, Brain, Shield, Github } from "lucide-react"

interface UploadedDocument {
  fileName: string
  documentType: string
  parsedContent: {
    text: string
    html: string
    elements: any[]
    pages: number
  }
}

export default function Home() {
  const [referenceNda, setReferenceNda] = useState<UploadedDocument | null>(null)
  const [customerNda, setCustomerNda] = useState<UploadedDocument | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any | null>(null)
  const [analysisStep, setAnalysisStep] = useState<string>("")

  const handleUploadComplete = (result: any) => {
    if (result.success && result.parsedContent) {
      const uploadedDoc: UploadedDocument = {
        fileName: result.fileName,
        documentType: result.documentType,
        parsedContent: result.parsedContent
      }

      if (result.documentType === "referenceNda") {
        setReferenceNda(uploadedDoc)
      } else if (result.documentType === "customerNda") {
        setCustomerNda(uploadedDoc)
      }
    }
  }

  const canAnalyze = referenceNda && customerNda && !analyzing

  const handleCompareDocuments = async () => {
    if (!referenceNda || !customerNda) {
      return
    }

    setAnalyzing(true)
    setAnalysisError(null)
    setAnalysisResult(null)

    try {
      setAnalysisStep("Preparing documents for analysis...")
      await new Promise(resolve => setTimeout(resolve, 500))

      setAnalysisStep("Sending documents to SolarLLM for analysis...")
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceText: referenceNda.parsedContent.text || referenceNda.parsedContent.html,
          customerText: customerNda.parsedContent.text || customerNda.parsedContent.html,
        }),
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }

      setAnalysisStep("Processing analysis results...")
      const result = await response.json()
      
      setAnalysisResult(result)
      setAnalysisStep("Analysis complete!")

    } catch (error) {
      console.error("Analysis failed:", error)
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed")
    } finally {
      setAnalyzing(false)
      setAnalysisStep("")
    }
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setAnalysisError(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="container px-4 py-12 md:py-16 lg:py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              NDA Comparison & Risk Analysis
            </h1>
            <p className="mt-4 text-muted-foreground md:text-xl">
              Upload your reference NDA and a customer NDA to compare them and identify potential risks.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="grid gap-6">
                <div>
                  <h2 className="text-xl font-semibold">Upload Documents</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload both your reference NDA and the customer NDA in PDF, DOC, or DOCX format.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FileUpload
                    label="Reference NDA"
                    description="Your standard NDA template"
                    accept=".pdf,.doc,.docx"
                    endpoint="referenceNda"
                    onUploadComplete={handleUploadComplete}
                  />
                  <FileUpload
                    label="Customer NDA"
                    description="NDA provided by customer"
                    accept=".pdf,.doc,.docx"
                    endpoint="customerNda"
                    onUploadComplete={handleUploadComplete}
                  />
                </div>
                
                {analysisError && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                      Analysis failed: {analysisError}
                    </p>
                  </div>
                )}

                {analyzing && (
                  <div className="rounded-md bg-blue-50 p-4 border-l-4 border-blue-400">
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">
                          Analyzing Documents...
                        </h4>
                        <p className="text-sm text-blue-600 mt-1">
                          {analysisStep}
                        </p>
                        <div className="mt-2 text-xs text-blue-500">
                          <p>• Extracting document content and structure</p>
                          <p>• Comparing sections and clauses</p>
                          <p>• Identifying potential risks and differences</p>
                          <p>• Generating recommendations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button 
                  size="lg" 
                  className="w-full" 
                  disabled={!canAnalyze}
                  onClick={handleCompareDocuments}
                >
                  {analyzing ? "Analyzing Documents..." : "Compare Documents"}
                </Button>
                
                {!canAnalyze && !analyzing && (
                  <p className="text-center text-sm text-muted-foreground">
                    {!referenceNda && !customerNda 
                      ? "Please upload both documents to enable comparison"
                      : !referenceNda 
                        ? "Please upload the reference NDA"
                        : "Please upload the customer NDA"
                    }
                  </p>
                )}
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    Or view a{" "}
                    <Link href="/demo" className="underline">
                      demo comparison
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analysis Results Section */}
        {analysisResult && referenceNda && customerNda && (
          <section className="border-t bg-muted/30">
            <div className="container px-4 py-12 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">NDA Comparison Results</h2>
                    <p className="text-muted-foreground">
                      Comparing {referenceNda.fileName} with {customerNda.fileName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Download Report</Button>
                    <Button variant="outline">Share</Button>
                    <Button onClick={resetAnalysis}>New Comparison</Button>
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-semibold">Side-by-Side Comparison</h3>
                  </div>
                  <ComparisonView 
                    analysisResult={analysisResult}
                    referenceNda={referenceNda}
                    customerNda={customerNda}
                  />
                </div>

                {/* Risk Analysis */}
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="h-5 w-5 text-red-600" />
                    <h3 className="text-xl font-semibold">Risk Analysis</h3>
                  </div>
                  <RiskAnalysis 
                    analysisResult={analysisResult}
                  />
                </div>

                {/* Summary & Recommendations */}
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="h-5 w-5 text-green-600" />
                    <h3 className="text-xl font-semibold">Summary & Recommendations</h3>
                  </div>
                  <SummaryView 
                    analysisResult={analysisResult}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-2 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Powered by <a href="https://console.upstage.ai" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline text-foreground">Upstage Document Parse and Solar LLM</a>
            </span>
            <span>•</span>
            <a href="https://github.com/hunkim/nda-checker" target="_blank" rel="noopener noreferrer" className="hover:underline text-foreground flex items-center gap-1">
              <Github className="h-4 w-4" />
              Open Source on GitHub
            </a>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 NDA Checker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
