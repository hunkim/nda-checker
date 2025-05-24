"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ComparisonViewProps {
  analysisResult: {
    sections: Array<{
      title: string
      match: number
      differences: string
    }>
  }
  referenceNda: {
    fileName: string
    parsedContent: {
      text: string
      html: string
    }
  }
  customerNda: {
    fileName: string
    parsedContent: {
      text: string
      html: string
    }
  }
}

export function ComparisonView({ analysisResult, referenceNda, customerNda }: ComparisonViewProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Use analysis result sections or fallback to mock data
  const sections = analysisResult?.sections || [
    { title: "1. Definitions", match: 90, differences: "Minor wording differences" },
    { title: "2. Confidential Information", match: 75, differences: "Customer NDA requires written authorization" },
    { title: "3. Term and Termination", match: 60, differences: "Extended term to 5 years with automatic renewal" }
  ]

  // Improved text extraction for display
  const getSectionContent = (text: string, sectionTitle: string, documentType: 'reference' | 'customer') => {
    if (!text) return "Content not available"
    
    // Clean up the text
    const cleanText = text.replace(/\s+/g, ' ').trim()
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    if (sentences.length === 0) return "Content not available"
    
    // Try to find section-specific content based on keywords
    const sectionKeywords = {
      'Confidential': ['confidential', 'information', 'proprietary', 'secret', '비밀', '정보'],
      'Definition': ['means', 'defined', 'include', 'definition', '의미', '정의'],
      'Non-Disclosure': ['disclose', 'disclosure', 'share', 'reveal', '공개', '누설'],
      'Obligation': ['obligation', 'duty', 'responsibility', 'shall', '의무', '책임'],
      'Exception': ['exception', 'exclude', 'public', 'known', '예외', '제외'],
      'Term': ['term', 'period', 'duration', 'expire', '기간', '만료'],
      'Return': ['return', 'destroy', 'destruction', '반환', '파기'],
      'Intellectual': ['intellectual', 'property', 'patent', 'trademark', '지적', '재산'],
      'Remedy': ['remedy', 'damages', 'injunction', 'relief', '구제', '손해'],
      'Termination': ['termination', 'terminate', 'end', '종료', '해지'],
      'Governing': ['governing', 'law', 'jurisdiction', 'court', '준거법', '관할']
    }
    
    // Find relevant keywords for this section
    const relevantKeywords = Object.entries(sectionKeywords).find(([key]) => 
      sectionTitle.toLowerCase().includes(key.toLowerCase())
    )?.[1] || []
    
    // Look for sentences containing relevant keywords
    const relevantSentences = sentences.filter(sentence => 
      relevantKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    )
    
    // Use relevant sentences if found, otherwise use different parts of the document
    let contentToShow: string[]
    
    if (relevantSentences.length > 0) {
      contentToShow = relevantSentences.slice(0, 2)
    } else {
      // Show different parts of the document for different sections
      const sectionIndex = sections.findIndex(s => s.title === sectionTitle)
      const startIndex = Math.max(0, sectionIndex * 2)
      contentToShow = sentences.slice(startIndex, startIndex + 2)
    }
    
    const result = contentToShow.join('. ').trim()
    
    // Limit length for display
    if (result.length > 300) {
      return result.substring(0, 300) + '...'
    }
    
    return result || `Section content from ${documentType} NDA...`
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search in documents..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            <SelectItem value="different">Different Sections</SelectItem>
            <SelectItem value="similar">Similar Sections</SelectItem>
            <SelectItem value="risky">Risky Sections</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 border-b bg-muted/50">
          <div className="p-4 font-medium border-r">
            Reference NDA ({referenceNda.fileName})
          </div>
          <div className="p-4 font-medium">
            Customer NDA ({customerNda.fileName})
          </div>
        </div>

        {sections.map((section, index) => (
          <div key={index} className="border-b last:border-b-0">
            <div className="bg-muted/30 px-4 py-2 font-medium flex justify-between items-center">
              <span>{section.title}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  section.match >= 80
                    ? "bg-green-100 text-green-800"
                    : section.match >= 50
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {section.match}% Match
              </span>
            </div>
            {section.differences && (
              <div className="px-4 py-2 bg-blue-50 text-blue-800 text-sm border-b">
                <strong>Key Differences:</strong> {section.differences}
              </div>
            )}
            <div className="grid grid-cols-2">
              <div className="p-4 border-r">
                <p className="text-sm text-muted-foreground">
                  {getSectionContent(referenceNda.parsedContent.text || referenceNda.parsedContent.html, section.title, 'reference')}
                </p>
              </div>
              <div className="p-4">
                <p className={`text-sm ${section.match < 50 ? "bg-red-50 p-2 rounded" : section.match < 80 ? "bg-yellow-50 p-2 rounded" : ""}`}>
                  {getSectionContent(customerNda.parsedContent.text || customerNda.parsedContent.html, section.title, 'customer')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {(!analysisResult?.sections || analysisResult.sections.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No section comparison data available.</p>
          <p className="text-sm">The analysis may still be processing or encountered an error.</p>
        </div>
      )}
    </div>
  )
}
