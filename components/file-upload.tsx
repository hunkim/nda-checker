"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Check, AlertCircle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface FileUploadProps {
  label: string
  description: string
  accept: string
  endpoint: string
  onUploadComplete?: (result: any) => void
}

interface UploadResult {
  success: boolean
  message: string
  fileName: string
  fileSize: number
  documentType: string
  parsedContent?: {
    text: string
    html: string
    elements: any[]
    pages: number
  }
  error?: string
  details?: string
}

export function FileUpload({ label, description, accept, endpoint, onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error" | "cancelled">("idle")
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      handleUpload(selectedFile)
    }
  }

  const handleUpload = async (selectedFile: File) => {
    setUploading(true)
    setUploadStatus("idle")
    setUploadResult(null)

    // Create a new AbortController for this upload
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", endpoint)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: abortController.signal, // Add abort signal
      })

      // Check if the request was aborted
      if (abortController.signal.aborted) {
        return
      }

      const result: UploadResult = await response.json()

      if (result.success) {
        setUploadStatus("success")
        setUploadResult(result)
        
        // Notify parent component of successful upload
        if (onUploadComplete) {
          onUploadComplete(result)
        }
      } else {
        setUploadStatus("error")
        setUploadResult(result)
      }
    } catch (error) {
      // Check if the error is due to abortion
      if (error instanceof Error && error.name === 'AbortError') {
        setUploadStatus("cancelled")
        setUploadResult({
          success: false,
          message: "Upload cancelled",
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          documentType: endpoint,
          error: "Upload was cancelled by user"
        })
        return
      }

      console.error("Upload failed:", error)
      setUploadStatus("error")
      setUploadResult({
        success: false,
        message: "Upload failed",
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        documentType: endpoint,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setUploading(false)
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const resetUpload = () => {
    // Cancel any ongoing upload first
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    setFile(null)
    setUploadStatus("idle")
    setUploadResult(null)
    setUploading(false)
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={endpoint}>{label}</Label>
      <div className="relative">
        <div className="rounded-md border border-dashed p-6 flex flex-col items-center justify-center gap-2 bg-muted/50">
          {!file ? (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">{description}</p>
              <Button variant="secondary" size="sm" className="mt-2" disabled={uploading}>
                Select Document
              </Button>
            </>
          ) : (
            <>
              {uploading && <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />}
              {uploadStatus === "success" && <Check className="h-8 w-8 text-green-500" />}
              {uploadStatus === "error" && <AlertCircle className="h-8 w-8 text-red-500" />}
              {uploadStatus === "cancelled" && <X className="h-8 w-8 text-orange-500" />}
              
              <p className="text-sm font-medium truncate max-w-full">{file.name}</p>
              
              {uploading && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Uploading and parsing document...
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancel}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
              
              {uploadStatus === "success" && uploadResult && (
                <div className="text-xs text-green-600 text-center">
                  <p>✓ Upload complete</p>
                  {uploadResult.parsedContent && (
                    <p>✓ Parsed {uploadResult.parsedContent.pages} page(s)</p>
                  )}
                </div>
              )}
              
              {uploadStatus === "error" && uploadResult && (
                <div className="text-xs text-red-600 text-center">
                  <p>✗ {uploadResult.error || "Upload failed"}</p>
                  {uploadResult.details && (
                    <p className="mt-1 max-w-full break-words">{uploadResult.details}</p>
                  )}
                </div>
              )}

              {uploadStatus === "cancelled" && uploadResult && (
                <div className="text-xs text-orange-600 text-center">
                  <p>⚠ Upload cancelled</p>
                </div>
              )}
              
              {!uploading && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={resetUpload}
                >
                  {uploadStatus === "success" ? "Change File" : "Try Again"}
                </Button>
              )}
            </>
          )}
          <input 
            id={endpoint} 
            type="file" 
            accept={accept} 
            onChange={handleFileChange} 
            className="sr-only" 
            disabled={uploading}
          />
        </div>
        <label htmlFor={endpoint} className="absolute inset-0 cursor-pointer">
          {!file && <span className="sr-only">Select file</span>}
        </label>
      </div>
    </div>
  )
}
