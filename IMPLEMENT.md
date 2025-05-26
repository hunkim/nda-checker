# Implementation Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Algorithms](#core-algorithms)
4. [API Integration](#api-integration)
5. [Prompt Engineering](#prompt-engineering)
6. [Data Flow](#data-flow)
7. [Configuration](#configuration)
8. [Components Architecture](#components-architecture)
9. [Error Handling](#error-handling)
10. [Development Workflow](#development-workflow)
11. [Security Considerations](#security-considerations)
12. [Deployment & Infrastructure](#deployment--infrastructure)
13. [Troubleshooting Guide](#troubleshooting-guide)
14. [Testing Framework](#testing-framework)
15. [Contributing Guidelines](#contributing-guidelines)
16. [Future Enhancements](#future-enhancements)
17. [Appendix](#appendix)

## Architecture Overview

### Tech Stack
- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: Radix UI for accessible, unstyled primitives
- **File Handling**: Built-in Next.js API routes with multipart/form-data
- **AI Integration**: Upstage APIs (Document Parse + SolarLLM)

### Architecture Pattern
The application follows a **3-layer architecture**:
1. **Presentation Layer**: React components with Tailwind styling
2. **API Layer**: Next.js API routes handling business logic
3. **Integration Layer**: External API calls to Upstage services

### Design Principles
- **Type Safety**: Full TypeScript coverage with strict mode
- **Component Composition**: Reusable UI components using Radix primitives
- **Error Resilience**: Graceful fallbacks and comprehensive error handling
- **API-First**: Clean separation between frontend and backend logic

## Project Structure

```
03-nda-checker/
├── app/                          # Next.js App Router directory
│   ├── api/                      # API route handlers
│   │   ├── upload/
│   │   │   └── route.ts         # File upload & document parsing
│   │   └── analyze/
│   │       └── route.ts         # NDA comparison & risk analysis
│   ├── comparison/              # Results page
│   │   └── page.tsx            # Analysis results display
│   ├── globals.css             # Global styles & Tailwind imports
│   ├── layout.tsx              # Root layout component
│   └── page.tsx                # Main upload interface
├── components/                  # Reusable React components
│   ├── ui/                     # Base UI components (Radix-based)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── file-upload.tsx         # Document upload component
│   └── comparison-view.tsx     # Analysis results component
├── lib/                        # Utility functions & configurations
│   └── utils.ts               # Helper functions (cn, etc.)
├── types/                      # TypeScript type definitions
└── public/                     # Static assets
```

## Core Algorithms

### 1. Document Processing Pipeline

**Flow**: Upload → Parse → Store → Analyze

```typescript
// Pseudo-code for document processing
async function processDocument(file: File) {
  1. Validate file (type, size, format)
  2. Convert to FormData for multipart upload
  3. Send to Upstage Document Parse API
  4. Extract text content from response
  5. Store in component state for analysis
  6. Enable comparison when both documents ready
}
```

### 2. NDA Comparison Algorithm

**Approach**: Section-by-section semantic comparison using LLM

```typescript
// Analysis algorithm structure
async function analyzeNDAs(referenceText: string, customerText: string) {
  1. Construct structured prompt with both NDAs
  2. Define JSON schema for consistent output
  3. Send to SolarLLM with high reasoning effort
  4. Parse structured response
  5. Fallback to mock data on API failure
  6. Return normalized analysis object
}
```

**Output Structure**:
```typescript
interface AnalysisResult {
  sections: Array<{
    title: string
    match: number        // 0-100 percentage
    differences: string  // Human-readable explanation
  }>
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
```

### 3. Risk Assessment Logic

**Classification Criteria**:
- **High Risk**: Extended terms, broad indemnification, jurisdiction issues
- **Medium Risk**: Modified definitions, additional obligations
- **Low Risk**: Minor wording differences, formatting changes

**Scoring Algorithm**:
1. **Section Matching**: Semantic similarity (0-100%)
2. **Risk Identification**: Pattern matching for known risky clauses
3. **Severity Weighting**: Legal impact assessment
4. **Overall Risk**: Aggregate scoring with weighted factors

## API Integration

### Upstage Document Parse API

**Endpoint**: `https://api.upstage.ai/v1/document-digitization`

**Configuration**:
```typescript
const formData = new FormData()
formData.append('document', file)
formData.append('output_formats', '["html", "text"]')
formData.append('coordinates', 'false')
formData.append('base64_encoding', 'false')
```

**Response Handling**:
```typescript
interface ParseResponse {
  api: string
  content: Array<{
    output_format: "text" | "html"
    text: string
    coordinates?: any
  }>
}
```

### Upstage SolarLLM API

**Endpoint**: `https://api.upstage.ai/v1/chat/completions`

**Model Configuration**:
```typescript
{
  model: process.env.UPSTAGE_MODEL_NAME || "solar-pro2-preview",
  messages: SolarLLMMessage[],
  reasoning_effort: "high",          // Maximum reasoning capability
  stream: false,                     // Synchronous response
  response_format: {
    type: "json_schema",             // Structured output
    json_schema: { /* schema */ },
    strict: true                     // Enforce schema compliance
  }
}
```

## Prompt Engineering

### Overview

The NDA Checker's core intelligence comes from carefully engineered prompts that guide SolarLLM to perform structured legal analysis. The prompt design focuses on:

- **Structured Output**: JSON schema enforcement for consistent responses
- **Legal Expertise**: System prompting for legal assistant persona
- **Comparative Analysis**: Clear instructions for NDA comparison
- **Risk Assessment**: Specific criteria for identifying and categorizing risks

### System Prompt

**Role Definition**:
```typescript
{
  role: "system",
  content: "You are an expert legal assistant specializing in NDA (Non-Disclosure Agreement) analysis. You help identify risks, differences, and provide recommendations for contract negotiations. You must respond with valid JSON following the specified schema."
}
```

**Key Elements**:
- **Domain Expertise**: Establishes legal assistant persona
- **Specialization**: Focus on NDA analysis specifically
- **Output Format**: Enforces JSON response requirement
- **Functional Scope**: Risk identification and recommendations

### Main Analysis Prompt

**Complete Prompt Structure**:
```typescript
const analysisPrompt = `I have two NDAs to compare: a reference NDA and a customer NDA.

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
```

### Prompt Engineering Strategies

#### 1. Clear Task Definition

**Structure**:
- **Context Setting**: "I have two NDAs to compare"
- **Input Specification**: Clear labeling of reference vs customer NDA
- **Task Breakdown**: Numbered list of specific analysis requirements
- **Output Format**: Explicit JSON structure definition

**Benefits**:
- Reduces ambiguity in task understanding
- Ensures consistent analysis approach
- Provides clear success criteria

#### 2. Comparative Framework

**Approach**:
```
Reference NDA: [baseline document]
Customer NDA: [document to analyze]
```

**Analysis Dimensions**:
- **Section-by-section comparison**: Structural analysis
- **Risk identification**: Security-focused evaluation
- **Recommendation generation**: Actionable guidance
- **Overall assessment**: High-level risk categorization

#### 3. Structured Output Enforcement

**JSON Schema Integration**:
```typescript
response_format: {
  type: "json_schema",
  json_schema: {
    name: "nda_analysis",
    schema: {
      type: "object",
      properties: {
        sections: { /* detailed schema */ },
        risks: { /* detailed schema */ },
        summary: { /* detailed schema */ }
      },
      required: ["sections", "risks", "summary"]
    },
    strict: true
  }
}
```

**Schema Benefits**:
- **Consistency**: Guaranteed response structure
- **Validation**: Automatic format compliance
- **Type Safety**: Predictable data types
- **Error Reduction**: Eliminates parsing issues

### Response Schema Design

#### Sections Analysis

```typescript
sections: Array<{
  title: string           // Section name (e.g., "Definitions", "Term")
  match: number          // Similarity percentage (0-100)
  differences: string    // Human-readable explanation of differences
}>
```

**Matching Criteria**:
- **90-100%**: Substantially identical
- **70-89%**: Similar with minor differences
- **50-69%**: Moderate differences requiring attention
- **0-49%**: Significant differences requiring negotiation

#### Risk Assessment

```typescript
risks: Array<{
  section: string                           // Which section contains the risk
  severity: "low" | "medium" | "high"      // Risk level
  title: string                            // Brief risk description
  description: string                      // Detailed explanation
  recommendation: string                   // Suggested action
}>
```

**Severity Guidelines**:
- **High**: Deal-breakers, legal exposure, significant business impact
- **Medium**: Negotiable terms, moderate risk, standard modifications
- **Low**: Minor variations, acceptable differences, cosmetic changes

#### Summary Assessment

```typescript
summary: {
  overallRisk: "low" | "medium" | "high"   // Aggregate risk level
  keyIssues: string[]                      // Primary concerns list
  recommendation: string                   // Overall guidance
}
```

### Advanced Prompt Techniques

#### 1. Few-Shot Learning Examples

**Future Enhancement**:
```typescript
// Add example analysis to improve consistency
const exampleAnalysis = `
Example:
Reference: "Confidential information shall be protected for 3 years"
Customer: "Confidential information shall be protected for 5 years"
Analysis: {
  "title": "Term Duration",
  "match": 85,
  "differences": "Extended protection period increases obligations"
}
`
```

#### 2. Chain-of-Thought Prompting

**Implementation Strategy**:
```typescript
// Guide LLM through reasoning process
const reasoningPrompt = `
Step 1: Identify all major sections in both NDAs
Step 2: Compare each section for semantic similarity
Step 3: Identify clauses that increase legal risk
Step 4: Assess business impact of differences
Step 5: Generate actionable recommendations
`
```

#### 3. Context Window Management

**Strategy for Large Documents**:
- **Chunking**: Break large NDAs into sections
- **Summarization**: Pre-process for key clauses
- **Prioritization**: Focus on high-risk sections first
- **Iterative Analysis**: Multiple passes for comprehensive coverage

### Prompt Optimization Guidelines

#### 1. Clarity and Precision

**Best Practices**:
- Use specific legal terminology
- Provide clear examples of expected output
- Define ambiguous terms explicitly
- Structure requests with numbered lists

#### 2. Output Quality Control

**Validation Strategies**:
- JSON schema enforcement for structure
- Enum constraints for categorical values
- Range validation for numerical scores
- Required field specifications

#### 3. Error Handling in Prompts

**Defensive Prompting**:
```typescript
// Handle edge cases in prompt
const robustPrompt = `
If sections are unclear or missing, mark as "Section Not Found".
If unable to determine risk level, default to "medium".
If comparison is impossible, explain why in the differences field.
Always provide at least one recommendation.
`
```

### Prompt Testing and Iteration

#### 1. Test Cases

**Validation Scenarios**:
- **Identical NDAs**: Should show high match percentages
- **Significantly Different NDAs**: Should identify major risks
- **Malformed Documents**: Should handle gracefully
- **Edge Cases**: Empty sections, unusual formatting

#### 2. Performance Metrics

**Quality Indicators**:
- **Consistency**: Same inputs produce similar outputs
- **Accuracy**: Identified risks align with legal expertise
- **Completeness**: All required fields populated
- **Actionability**: Recommendations are practical

#### 3. Continuous Improvement

**Optimization Process**:
1. **Collect Feedback**: User validation of analysis quality
2. **Identify Patterns**: Common failure modes or edge cases
3. **Refine Prompts**: Adjust language and structure
4. **Test Changes**: Validate improvements with test cases
5. **Deploy Updates**: Roll out improved prompts

### Model-Specific Considerations

#### SolarLLM Optimization

**Reasoning Effort**:
```typescript
reasoning_effort: "high"  // Maximum analytical capability
```

**Model Characteristics**:
- **Strengths**: Strong reasoning, legal knowledge, structured output
- **Considerations**: Context window limits, processing time
- **Optimization**: Prompt length vs. detail balance

#### Future Model Support

**Extensibility Design**:
- Model-agnostic prompt structure
- Configuration-driven prompt templates
- A/B testing framework for prompt variants
- Performance monitoring across models

## Data Flow

### 1. File Upload Flow
```
User Action → File Selection → Validation → Upload API → 
Document Parse API → Text Extraction → State Update → UI Refresh
```

### 2. Analysis Flow
```
Both Files Ready → Analysis API → SolarLLM Request → 
JSON Response → Parse & Validate → Results Page → Risk Display
```

### 3. Error Flow
```
API Failure → Error Detection → Fallback Logic → 
Mock Data Generation → User Notification → Graceful Degradation
```

## Configuration

### Environment Variables

**Required**:
```bash
UPSTAGE_API_KEY=your_api_key_here
```

**Optional**:
```bash
UPSTAGE_MODEL_NAME=solar-pro2-preview  # Default model
```

### API Configuration

**File Upload Limits**:
- Max file size: Handled by Upstage API limits
- Supported formats: PDF, DOC, DOCX
- Concurrent uploads: 2 files maximum

**Analysis Configuration**:
- Reasoning effort: "high" for complex legal analysis
- Response format: Structured JSON schema
- Timeout: Default fetch timeout
- Fallback: Mock data for development/demo

### UI Configuration

**Tailwind Classes**:
- Primary color: Blue variants
- Risk indicators: Red (high), Yellow (medium), Green (low)
- Layout: Responsive grid system
- Typography: System font stack

## Components Architecture

### File Upload Component (`file-upload.tsx`)

**Responsibilities**:
- File selection and validation
- Upload progress indication
- Document parsing integration
- State management for upload status

**Key Features**:
- Drag & drop interface
- File type validation
- Real-time parsing feedback
- Error state handling

### Comparison View Component (`comparison-view.tsx`)

**Responsibilities**:
- Analysis results display
- Risk visualization
- Section-by-section comparison
- Recommendation presentation

**Structure**:
```typescript
interface ComparisonViewProps {
  analysis: AnalysisResult
  referenceFileName: string
  customerFileName: string
}
```

### UI Components (`components/ui/`)

**Base Components**:
- `Button`: Styled button with variants
- `Card`: Container component for content sections
- `Badge`: Status and severity indicators
- `Alert`: Error and warning messages

**Design System**:
- Consistent spacing using Tailwind spacing scale
- Accessible color contrast ratios
- Responsive breakpoints (sm, md, lg, xl)
- Dark mode support (future enhancement)

## Error Handling

### API Error Handling

**Strategy**: Graceful degradation with fallbacks

```typescript
try {
  // Primary API call
  const result = await apiCall()
  return result
} catch (error) {
  console.error("API error:", error)
  // Return mock data for development
  return fallbackData
}
```

**Error Types**:
1. **Network errors**: Timeout, connection issues
2. **API errors**: Rate limits, authentication failures
3. **Parse errors**: Invalid JSON, schema violations
4. **File errors**: Unsupported format, corruption

### User Error Handling

**Error Display**:
- Toast notifications for temporary errors
- Inline validation for form inputs
- Error boundaries for component failures
- Fallback UI for critical errors

## Development Workflow

### Setup Process

1. **Clone repository**
2. **Install dependencies**: `npm install`
3. **Configure environment**: Copy `.env.example` to `.env.local`
4. **Start development server**: `npm run dev`
5. **Open browser**: `http://localhost:3000`

### Code Organization

**File Naming Conventions**:
- Components: `kebab-case.tsx`
- API routes: `route.ts`
- Types: `PascalCase` interfaces
- Utilities: `camelCase` functions

**Import Organization**:
```typescript
// 1. React/Next.js imports
import { NextResponse } from "next/server"

// 2. Third-party imports
import { clsx } from "clsx"

// 3. Internal imports
import { Button } from "@/components/ui/button"

// 4. Type imports
import type { AnalysisResult } from "@/types"
```

### Testing Strategy

**Recommended Testing Approach**:
1. **Unit Tests**: Component logic and utilities
2. **Integration Tests**: API route functionality
3. **E2E Tests**: Complete user workflows
4. **Type Checking**: TypeScript strict mode

## Security Considerations

### API Security

**Environment Variables**:
- Store sensitive keys in `.env.local` (never commit)
- Use different API keys for development/production
- Rotate API keys regularly
- Monitor API usage for unusual patterns

**Request Validation**:
```typescript
// Input sanitization example
function validateFileInput(file: File): boolean {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize
}
```

**Data Privacy**:
- No persistent storage of uploaded documents
- Memory cleanup after processing
- Secure transmission (HTTPS only)
- Minimal data logging for debugging

### Client-Side Security

**File Upload Protection**:
- Client-side file type validation
- File size limits enforcement
- Malware scanning considerations
- User consent for data processing

**XSS Prevention**:
- React's built-in XSS protection
- Sanitize any dynamic content
- Content Security Policy (CSP) headers
- Secure cookie settings

## Deployment & Infrastructure

### Environment Setup

**Development Environment**:
```bash
# Required Node.js version
node --version  # >= 18.0.0

# Package manager
npm --version   # >= 8.0.0

# Environment setup
cp .env.example .env.local
npm install
npm run dev
```

**Production Deployment**:

**Vercel (Recommended)**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables in Vercel dashboard:
# UPSTAGE_API_KEY=your_production_key
# UPSTAGE_MODEL_NAME=solar-pro2-preview
```

**Docker Deployment**:
```dockerfile
# Dockerfile example
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Performance Optimization

**Build Optimization**:
```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  compress: true
}
```

**Bundle Analysis**:
```bash
# Analyze bundle size
npm run build && npm run analyze
```

## Troubleshooting Guide

### Common Issues

**1. API Connection Errors**

*Problem*: `UPSTAGE_API_KEY environment variable is required`
*Solution*:
```bash
# Check environment file
cat .env.local

# Verify API key format
echo $UPSTAGE_API_KEY | wc -c  # Should be reasonable length
```

**2. File Upload Failures**

*Problem*: Documents not parsing correctly
*Debugging Steps*:
```typescript
// Debug document parsing
console.log('File type:', file.type)
console.log('File size:', file.size)
console.log('Parse response:', response.status)
```

**3. Analysis Timeouts**

*Problem*: SolarLLM requests timing out
*Solutions*:
- Check document size (reduce if > 100KB text)
- Verify API rate limits
- Implement retry logic with exponential backoff

**4. JSON Schema Validation Errors**

*Problem*: LLM returning invalid JSON
*Debugging*:
```typescript
// Add JSON validation
try {
  const parsed = JSON.parse(content)
  // Validate against schema
  validateSchema(parsed)
} catch (error) {
  console.error('Invalid JSON:', content)
  // Use fallback data
}
```

### Development Tips

**Hot Reloading Issues**:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**TypeScript Errors**:
```bash
# Type checking
npm run type-check

# Reset TypeScript server in VS Code
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

## Testing Framework

### Unit Testing Setup

**Jest Configuration**:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}
```

**Component Testing Example**:
```typescript
// __tests__/file-upload.test.tsx
import { render, screen } from '@testing-library/react'
import FileUpload from '@/components/file-upload'

describe('FileUpload', () => {
  test('renders upload interface', () => {
    render(<FileUpload onUpload={jest.fn()} />)
    expect(screen.getByText('Upload Document')).toBeInTheDocument()
  })
})
```

### API Testing

**Route Testing**:
```typescript
// __tests__/api/analyze.test.ts
import { POST } from '@/app/api/analyze/route'

describe('/api/analyze', () => {
  test('returns analysis for valid input', async () => {
    const request = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        referenceText: 'test reference',
        customerText: 'test customer'
      })
    })
    
    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
```

### E2E Testing

**Playwright Setup**:
```typescript
// e2e/nda-analysis.spec.ts
import { test, expect } from '@playwright/test'

test('complete NDA analysis workflow', async ({ page }) => {
  await page.goto('/')
  
  // Upload reference document
  await page.setInputFiles('[data-testid="reference-upload"]', 'test-files/reference.pdf')
  
  // Upload customer document
  await page.setInputFiles('[data-testid="customer-upload"]', 'test-files/customer.pdf')
  
  // Start analysis
  await page.click('[data-testid="analyze-button"]')
  
  // Verify results
  await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible()
})
```

## Contributing Guidelines

### Code Standards

**TypeScript**:
- Strict mode enabled
- Explicit return types for functions
- Interface definitions for all data structures
- No `any` types except for external APIs

**React**:
- Functional components with hooks
- Props interfaces for all components
- Error boundaries for critical sections
- Accessible HTML semantics

**Styling**:
- Tailwind utility classes
- Consistent spacing scale
- Responsive design principles
- Semantic color usage

### Pull Request Process

1. **Fork repository**
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Implement changes** with tests
4. **Update documentation** if needed
5. **Submit pull request** with clear description

### Feature Development

**New API Integration**:
1. Add environment variables
2. Update configuration documentation
3. Implement error handling
4. Add fallback mechanisms
5. Update README and IMPLEMENT guides

**New UI Components**:
1. Follow existing component patterns
2. Use Radix primitives where applicable
3. Implement responsive design
4. Add proper TypeScript types
5. Include accessibility features

### Performance Considerations

**Optimization Strategies**:
- Code splitting with dynamic imports
- Image optimization with Next.js Image
- API response caching where appropriate
- Bundle size monitoring
- Core Web Vitals optimization

**Monitoring**:
- Error tracking (recommended: Sentry)
- Performance monitoring
- API usage analytics
- User interaction tracking

## Future Enhancements

### Planned Features

**1. Advanced Analysis**:
- Multi-language NDA support
- Clause-level risk scoring
- Industry-specific risk profiles
- Historical analysis tracking

**2. User Experience**:
- Bulk document processing
- Analysis history dashboard
- Export capabilities (PDF reports)
- Real-time collaboration features

**3. Integration Capabilities**:
- Slack/Teams notifications
- DocuSign integration
- CRM system connections
- API for third-party integrations

### Technical Improvements

**1. Architecture Enhancements**:
- Microservices architecture
- Caching layer implementation
- Database integration for history
- Real-time WebSocket updates

**2. AI/ML Improvements**:
- Custom fine-tuned models
- Confidence scoring
- Active learning from user feedback
- Multi-model ensemble approach

**3. Security & Compliance**:
- SOC 2 compliance
- GDPR compliance features
- Audit logging
- Enterprise SSO integration

### Contribution Opportunities

**Good First Issues**:
- UI/UX improvements
- Additional file format support
- Error message enhancements
- Documentation updates

**Advanced Contributions**:
- Performance optimizations
- New AI model integrations
- Security enhancements
- Accessibility improvements

---

## Appendix

### API Rate Limits

**Upstage API Limits**:
- Document Parse: Varies by plan
- SolarLLM: Varies by plan
- Monitoring: Check response headers

### Browser Compatibility

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### File Size Limitations

**Recommended Limits**:
- PDF: < 50MB
- DOC/DOCX: < 25MB
- Text extraction: < 500KB final text

### Legal Disclaimer

This tool is designed to assist with NDA analysis but should not replace professional legal advice. Users should consult with qualified legal professionals for important contract decisions. 