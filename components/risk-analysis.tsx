"use client"

import { AlertTriangle, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface RiskAnalysisProps {
  analysisResult: {
    risks: Array<{
      section: string
      severity: "low" | "medium" | "high"
      title: string
      description: string
      recommendation: string
    }>
    summary: {
      overallRisk: "low" | "medium" | "high"
      keyIssues: string[]
      recommendation: string
    }
  }
}

export function RiskAnalysis({ analysisResult }: RiskAnalysisProps) {
  const [expandedRisks, setExpandedRisks] = useState<number[]>([])

  const toggleRisk = (id: number) => {
    if (expandedRisks.includes(id)) {
      setExpandedRisks(expandedRisks.filter((riskId) => riskId !== id))
    } else {
      setExpandedRisks([...expandedRisks, id])
    }
  }

  // Use analysis result risks or fallback to mock data
  const risks = analysisResult?.risks || [
    {
      section: "5. Term and Termination",
      severity: "high" as const,
      title: "Extended Term Duration",
      description: "The customer NDA extends the term to 5 years with automatic renewal",
      recommendation: "Negotiate to reduce term to 3 years and remove automatic renewal",
    }
  ]

  const summary = analysisResult?.summary || {
    overallRisk: "high" as const,
    keyIssues: ["Extended term", "Indemnification clause"],
    recommendation: "Negotiate key terms before signing"
  }

  const riskCounts = {
    high: risks.filter((r) => r.severity === "high").length,
    medium: risks.filter((r) => r.severity === "medium").length,
    low: risks.filter((r) => r.severity === "low").length,
  }

  const totalRisks = risks.length

  const getRiskProgress = (overallRisk: string) => {
    switch (overallRisk) {
      case "low": return 25
      case "medium": return 60
      case "high": return 85
      default: return 50
    }
  }

  const getRiskColor = (overallRisk: string) => {
    switch (overallRisk) {
      case "low": return "text-green-600"
      case "medium": return "text-yellow-600"
      case "high": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getProgressColor = (overallRisk: string) => {
    switch (overallRisk) {
      case "low": return { bg: "bg-green-100", indicator: "bg-green-600" }
      case "medium": return { bg: "bg-yellow-100", indicator: "bg-yellow-600" }
      case "high": return { bg: "bg-red-100", indicator: "bg-red-600" }
      default: return { bg: "bg-gray-100", indicator: "bg-gray-600" }
    }
  }

  const progressColors = getProgressColor(summary.overallRisk)

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 p-6 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold">Risk Summary</h3>
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Risk Assessment</span>
            <span className={`text-sm font-medium ${getRiskColor(summary.overallRisk)} capitalize`}>
              {summary.overallRisk} Risk
            </span>
          </div>
          <Progress 
            value={getRiskProgress(summary.overallRisk)} 
            className={`h-2 ${progressColors.bg}`}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="flex flex-col items-center p-3 border rounded-md bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600 mb-1" />
            <span className="text-xl font-bold text-red-600">{riskCounts.high}</span>
            <span className="text-xs text-muted-foreground">High Risk</span>
          </div>
          <div className="flex flex-col items-center p-3 border rounded-md bg-yellow-50">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mb-1" />
            <span className="text-xl font-bold text-yellow-600">{riskCounts.medium}</span>
            <span className="text-xs text-muted-foreground">Medium Risk</span>
          </div>
          <div className="flex flex-col items-center p-3 border rounded-md bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
            <span className="text-xl font-bold text-green-600">{riskCounts.low}</span>
            <span className="text-xs text-muted-foreground">Low Risk</span>
          </div>
        </div>
        
        {summary.keyIssues && summary.keyIssues.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Key Issues</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {summary.keyIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 p-4 font-medium">Identified Risks ({totalRisks})</div>
        <div className="divide-y">
          {risks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No specific risks identified in the analysis.</p>
              <p className="text-sm">This could indicate the documents are very similar or the analysis needs refinement.</p>
            </div>
          ) : (
            risks.map((risk, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleRisk(index)}>
                  <div className="flex items-center gap-3">
                    {risk.severity === "high" && <AlertCircle className="h-5 w-5 text-red-600" />}
                    {risk.severity === "medium" && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                    {risk.severity === "low" && <CheckCircle className="h-5 w-5 text-green-600" />}
                    <div>
                      <div className="font-medium">{risk.title}</div>
                      <div className="text-sm text-muted-foreground">{risk.section}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    {expandedRisks.includes(index) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {expandedRisks.includes(index) && (
                  <div className="mt-4 grid gap-3 pl-8">
                    <div>
                      <div className="text-sm font-medium">Issue</div>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Recommendation</div>
                      <p className="text-sm text-muted-foreground">{risk.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
