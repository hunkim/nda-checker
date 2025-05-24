"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ComparisonView } from "@/components/comparison-view"
import { RiskAnalysis } from "@/components/risk-analysis"
import { SummaryView } from "@/components/summary-view"
import { FileText, Brain, Shield, Github } from "lucide-react"

// Sample demo data
const demoAnalysisResult = {
  sections: [
    {
      title: "1. Definitions",
      match: 90,
      differences: "Minor wording differences in definition of 'Confidential Information'"
    },
    {
      title: "2. Confidential Information",
      match: 75,
      differences: "Customer NDA requires written authorization for any disclosure, while reference allows verbal consent in emergencies"
    },
    {
      title: "3. Term and Termination",
      match: 60,
      differences: "Extended term to 5 years with automatic renewal vs. standard 3-year term"
    },
    {
      title: "4. Return of Information",
      match: 85,
      differences: "Additional requirement for certified destruction of digital copies"
    },
    {
      title: "5. Remedies",
      match: 45,
      differences: "Includes liquidated damages clause of $100,000 minimum plus attorney fees"
    }
  ],
  risks: [
    {
      section: "Term and Termination",
      severity: "high" as const,
      title: "Extended 5-Year Term with Auto-Renewal",
      description: "The customer NDA extends the confidentiality period to 5 years with automatic renewal, significantly longer than the standard 3-year term.",
      recommendation: "Negotiate to reduce the term to 3 years and remove automatic renewal clause, or add specific termination conditions."
    },
    {
      section: "Remedies",
      severity: "high" as const,
      title: "Liquidated Damages Clause",
      description: "Customer NDA includes a minimum $100,000 liquidated damages clause plus attorney fees for any breach.",
      recommendation: "Request removal of liquidated damages or negotiate a more reasonable cap based on actual potential damages."
    },
    {
      section: "Confidential Information",
      severity: "medium" as const,
      title: "Written Authorization Requirement",
      description: "All disclosures must be in writing, which may hinder emergency communications or normal business operations.",
      recommendation: "Add exception for emergency situations or verbal authorizations confirmed in writing within 48 hours."
    },
    {
      section: "Return of Information",
      severity: "low" as const,
      title: "Certified Destruction Requirement",
      description: "Requires certified destruction of digital copies, which is stricter than standard return provisions.",
      recommendation: "This is acceptable as it provides additional security assurance."
    }
  ],
  summary: {
    overallRisk: "high" as const,
    keyIssues: [
      "Extended 5-year confidentiality term",
      "Automatic renewal clause",
      "High liquidated damages ($100K minimum)",
      "Restrictive written authorization requirement"
    ],
    recommendation: "Negotiate key terms before signing. The extended term and liquidated damages present significant business risks."
  }
}

const demoReferenceNda = {
  fileName: "Standard_Company_NDA_v2.1.pdf",
  parsedContent: {
    text: "NON-DISCLOSURE AGREEMENT This Non-Disclosure Agreement is entered into between Company and the receiving party. Definitions: Confidential Information means any proprietary information, trade secrets, technical data, business plans, customer lists, financial information, or other sensitive information disclosed by either party. Term: This agreement shall remain in effect for three (3) years from the date of execution. Obligations: The receiving party agrees to maintain the confidentiality of all Confidential Information and use it solely for the intended business purpose. Exceptions: This agreement does not apply to information that is publicly available, independently developed, or lawfully received from third parties. Return of Information: Upon termination, all Confidential Information must be returned or destroyed. Remedies: Breach of this agreement may result in irreparable harm, and the disclosing party may seek injunctive relief and monetary damages.",
    html: "<h1>NON-DISCLOSURE AGREEMENT</h1><p>This Non-Disclosure Agreement is entered into between Company and the receiving party.</p>"
  }
}

const demoCustomerNda = {
  fileName: "Customer_XYZ_NDA_Modified.pdf", 
  parsedContent: {
    text: "MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT This Mutual Non-Disclosure Agreement is entered into between XYZ Corporation and Company. Definitions: Confidential Information shall mean all proprietary information, trade secrets, technical specifications, business strategies, customer databases, financial records, and any other sensitive data disclosed by either party in any form. Term and Termination: This agreement shall remain in effect for five (5) years from the date of execution and shall automatically renew for successive one-year periods unless terminated by written notice. Confidentiality Obligations: Each party agrees to maintain strict confidentiality and shall not disclose any Confidential Information without prior written authorization from the disclosing party. Return and Destruction: Upon termination, all Confidential Information must be returned or destroyed with certified proof of destruction for digital copies. Remedies and Damages: Any breach of this agreement shall result in liquidated damages of not less than One Hundred Thousand Dollars ($100,000) plus reasonable attorney fees and costs. The parties acknowledge that monetary damages may be insufficient and agree that injunctive relief may be sought.",
    html: "<h1>MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT</h1><p>This Mutual Non-Disclosure Agreement is entered into between XYZ Corporation and Company.</p>"
  }
}

export default function DemoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="container px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Demo: NDA Comparison Results
              </h1>
              <p className="mt-4 text-muted-foreground md:text-lg">
                See how our AI analyzes and compares NDAs to identify risks and provide recommendations
              </p>
              <div className="mt-6">
                <Link href="/">
                  <Button variant="outline">Try Your Own NDAs</Button>
                </Link>
              </div>
            </div>

            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Demo Scenario</h3>
              <p className="text-blue-800 text-sm">
                This demo compares your <strong>Standard Company NDA v2.1</strong> with a modified NDA from <strong>Customer XYZ</strong>. 
                The customer has made several changes including extended terms, liquidated damages, and stricter authorization requirements.
              </p>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-semibold">Side-by-Side Comparison</h3>
              </div>
              <ComparisonView 
                analysisResult={demoAnalysisResult}
                referenceNda={demoReferenceNda}
                customerNda={demoCustomerNda}
              />
            </div>

            {/* Risk Analysis */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-red-600" />
                <h3 className="text-xl font-semibold">Risk Analysis</h3>
              </div>
              <RiskAnalysis 
                analysisResult={demoAnalysisResult}
              />
            </div>

            {/* Summary & Recommendations */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="h-5 w-5 text-green-600" />
                <h3 className="text-xl font-semibold">Summary & Recommendations</h3>
              </div>
              <SummaryView 
                analysisResult={demoAnalysisResult}
              />
            </div>

            <div className="text-center">
              <Link href="/">
                <Button size="lg">Analyze Your Own NDAs</Button>
              </Link>
            </div>
          </div>
        </section>
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
