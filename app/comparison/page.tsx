"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComparisonView } from "@/components/comparison-view"
import { RiskAnalysis } from "@/components/risk-analysis"
import { SummaryView } from "@/components/summary-view"
import { Loader2 } from "lucide-react"

interface AnalysisData {
  analysisResult: any
  referenceNda: any
  customerNda: any
}

export default function ComparisonPage() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const analysisResult = sessionStorage.getItem('analysisResult')
      const referenceNda = sessionStorage.getItem('referenceNda')
      const customerNda = sessionStorage.getItem('customerNda')

      if (!analysisResult || !referenceNda || !customerNda) {
        // Redirect to home if no data found
        router.push('/')
        return
      }

      setData({
        analysisResult: JSON.parse(analysisResult),
        referenceNda: JSON.parse(referenceNda),
        customerNda: JSON.parse(customerNda)
      })
    } catch (error) {
      console.error('Error loading analysis data:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleNewComparison = () => {
    // Clear session storage and redirect to home
    sessionStorage.removeItem('analysisResult')
    sessionStorage.removeItem('referenceNda')
    sessionStorage.removeItem('customerNda')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold">NDA Checker</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading analysis results...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!data) {
    return null // This shouldn't happen as we redirect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold">NDA Checker</h1>
          <nav className="ml-auto flex gap-4">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="#" className="text-sm font-medium">
              About
            </Link>
            <Link href="#" className="text-sm font-medium">
              Help
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">NDA Comparison Results</h1>
              <p className="text-muted-foreground">
                Comparing {data.referenceNda.fileName} with {data.customerNda.fileName}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Download Report</Button>
              <Button variant="outline">Share</Button>
              <Button onClick={handleNewComparison}>New Comparison</Button>
            </div>
          </div>

          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>
              <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
              <TabsTrigger value="summary">Summary & Recommendations</TabsTrigger>
            </TabsList>
            <TabsContent value="comparison" className="mt-6">
              <ComparisonView 
                analysisResult={data.analysisResult}
                referenceNda={data.referenceNda}
                customerNda={data.customerNda}
              />
            </TabsContent>
            <TabsContent value="risks" className="mt-6">
              <RiskAnalysis 
                analysisResult={data.analysisResult}
              />
            </TabsContent>
            <TabsContent value="summary" className="mt-6">
              <SummaryView 
                analysisResult={data.analysisResult}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 NDA Checker. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
