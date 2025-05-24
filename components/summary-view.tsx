import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryViewProps {
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

export function SummaryView({ analysisResult }: SummaryViewProps) {
  const summary = analysisResult?.summary || {
    overallRisk: "high" as const,
    keyIssues: ["Extended term", "Indemnification clause"],
    recommendation: "Negotiate key terms before signing"
  }

  const risks = analysisResult?.risks || []

  const getRiskIcon = (overallRisk: string) => {
    switch (overallRisk) {
      case "low": return <CheckCircle className="h-8 w-8 text-green-600" />
      case "medium": return <AlertTriangle className="h-8 w-8 text-yellow-600" />
      case "high": return <AlertCircle className="h-8 w-8 text-red-600" />
      default: return <AlertCircle className="h-8 w-8 text-gray-600" />
    }
  }

  const getRiskColor = (overallRisk: string) => {
    switch (overallRisk) {
      case "low": return { bg: "bg-green-50", text: "text-green-600" }
      case "medium": return { bg: "bg-yellow-50", text: "text-yellow-600" }
      case "high": return { bg: "bg-red-50", text: "text-red-600" }
      default: return { bg: "bg-gray-50", text: "text-gray-600" }
    }
  }

  const riskColors = getRiskColor(summary.overallRisk)

  const highRisks = risks.filter(r => r.severity === "high")
  const mediumRisks = risks.filter(r => r.severity === "medium")
  const lowRisks = risks.filter(r => r.severity === "low")

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>Overall assessment of the customer NDA compared to your reference NDA</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className={`flex items-center gap-4 p-4 border rounded-md ${riskColors.bg}`}>
            {getRiskIcon(summary.overallRisk)}
            <div>
              <h4 className={`font-semibold ${riskColors.text} capitalize`}>
                {summary.overallRisk} Risk Assessment
              </h4>
              <p className="text-sm text-muted-foreground">
                {summary.recommendation}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Key Concerns</h4>
              <ul className="text-sm space-y-2">
                {highRisks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>{risk.title}</span>
                  </li>
                ))}
                {mediumRisks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>{risk.title}</span>
                  </li>
                ))}
                {summary.keyIssues && summary.keyIssues.length > 0 && summary.keyIssues.map((issue, index) => (
                  <li key={`issue-${index}`} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Acceptable Terms</h4>
              <ul className="text-sm space-y-2">
                {lowRisks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{risk.title}</span>
                  </li>
                ))}
                {lowRisks.length === 0 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Standard confidentiality provisions</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Download Full Report
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>Suggested next steps based on our analysis</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-3">Negotiation Points</h4>
            <ol className="text-sm space-y-4 list-decimal pl-5">
              {risks.filter(r => r.severity === "high" || r.severity === "medium").map((risk, index) => (
                <li key={index}>
                  <div className="font-medium">{risk.title}</div>
                  <p className="text-muted-foreground">
                    {risk.recommendation}
                  </p>
                </li>
              ))}
              {risks.filter(r => r.severity === "high" || r.severity === "medium").length === 0 && (
                <li>
                  <div className="font-medium">General Review</div>
                  <p className="text-muted-foreground">
                    Review all terms to ensure they align with your business requirements.
                  </p>
                </li>
              )}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
