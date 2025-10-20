# Word Export Functionality

This directory contains utilities for generating Word documents from test reports and other data.

## Structure

```
src/lib/word-export/
├── utils.ts                    # Core utility functions
├── test-report-generator.ts    # Test report specific generator
└── README.md                  # This file
```

## Usage

### Basic Usage

```typescript
import { TestReportWordGenerator } from '@/lib/word-export/test-report-generator'

const generator = new TestReportWordGenerator(certificateData, certificateItems)
await generator.generateWordDocument()
```

### Using the Hook

```typescript
import { useWordExport } from '@/hooks/use-word-export'

const { exportToWord, isExporting } = useWordExport({
  certificateData: certificate?.data,
  certificateItems: certificateItems?.data || []
})

// In your component
<Button onClick={exportToWord} disabled={isExporting}>
  {isExporting ? 'Exporting...' : 'Export Word'}
</Button>
```

## Features

- ✅ **Clean HTML Generation**: Generates Word-compatible HTML
- ✅ **Image Support**: Handles image loading and embedding
- ✅ **QR Code Generation**: Creates QR codes for public links
- ✅ **Table Support**: Renders test results in proper tables
- ✅ **Error Handling**: Graceful error handling with user feedback
- ✅ **Loading States**: Shows export progress to users
- ✅ **TypeScript Support**: Full type safety

## Customization

### Adding New Document Types

1. Create a new generator class in `src/lib/word-export/`
2. Extend the base utilities from `utils.ts`
3. Implement the document-specific HTML generation
4. Create a custom hook if needed

### Styling

The Word documents use inline CSS for maximum compatibility. Key styles:

- `@page` rules for page setup
- `page-break-before: always` for page breaks
- `page-break-inside: avoid` for keeping content together
- Inline styles for all elements

## Dependencies

- `qrcode`: For QR code generation
- `sonner`: For toast notifications (in hooks)

## Environment Variables

- `NEXT_PUBLIC_FRONTEND_URL`: For generating public URLs in QR codes
- `NEXT_PUBLIC_BACKEND_URL`: For loading images from backend
