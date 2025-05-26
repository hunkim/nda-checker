# NDA Checker

A Next.js application that uses Upstage APIs to parse and analyze Non-Disclosure Agreements (NDAs) for risk assessment.

## Features

- **Document Upload & Parsing**: Upload PDF, DOC, or DOCX documents and parse them using Upstage Document Parse API
- **AI-Powered Analysis**: Compare NDAs and identify risks using Upstage SolarLLM
- **Risk Assessment**: Get detailed risk analysis with recommendations
- **Modern UI**: Built with Next.js, TypeScript, and Tailwind CSS

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory and add your Upstage API key:

```bash
UPSTAGE_API_KEY=your_upstage_api_key_here
UPSTAGE_MODEL_NAME=solar-pro2-preview  # Optional: defaults to "solar-pro2-preview"
```

You can get your API key from [Upstage Console](https://console.upstage.ai/).

**Environment Variables:**
- `UPSTAGE_API_KEY` (required): Your Upstage API key for accessing Document Parse and SolarLLM APIs
- `UPSTAGE_MODEL_NAME` (optional): The SolarLLM model to use for analysis. Defaults to `solar-pro2-preview` if not specified

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Upload Documents**: Upload your reference NDA and customer NDA in PDF, DOC, or DOCX format
2. **Document Parsing**: Files are automatically parsed using Upstage Document Parse API
3. **Analysis**: Once both documents are uploaded, click "Compare Documents" to analyze
4. **Review Results**: View the detailed comparison and risk analysis

## API Integration

### Upstage Document Parse

The application integrates with Upstage Document Parse API to extract text content from uploaded documents:

- **Endpoint**: `https://api.upstage.ai/v1/document-digitization`
- **Supported Formats**: PDF, DOC, DOCX
- **Features Used**: HTML and text extraction, OCR, coordinate mapping
- **Output Formats**: HTML and plain text for analysis

### Upstage SolarLLM

The application uses Upstage SolarLLM for intelligent NDA comparison and risk analysis:

- **Model**: Configurable via `UPSTAGE_MODEL_NAME` (defaults to `solar-pro2-preview`)
- **Endpoint**: `https://api.upstage.ai/v1/chat/completions`
- **Features**: High reasoning effort for detailed legal analysis

## Project Structure

```
nda-checker/
├── app/
│   ├── api/
│   │   ├── upload/         # File upload and parsing
│   │   └── analyze/        # NDA analysis
│   ├── comparison/         # Results page
│   └── page.tsx           # Main upload page
├── components/
│   ├── file-upload.tsx    # File upload component
│   ├── comparison-view.tsx # Analysis results
│   └── ui/                # UI components
└── lib/                   # Utility functions
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI Integration**: Upstage APIs (Document Parse + SolarLLM)

## License

MIT 