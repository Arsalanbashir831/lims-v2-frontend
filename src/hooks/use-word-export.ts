import { useState } from 'react'
import { toast } from 'sonner'
import { TestReportWordGenerator } from '@/lib/word-export/test-report-generator'

interface UseWordExportProps {
  certificateData: any
  certificateItems: any[]
}

export const useWordExport = ({ certificateData, certificateItems }: UseWordExportProps) => {
  const [isExporting, setIsExporting] = useState(false)

  const exportToWord = async () => {
    if (!certificateData) {
      toast.error('Certificate data is not loaded yet.')
      return
    }

    if (!certificateItems || certificateItems.length === 0) {
      toast.error('No test results available to export.')
      return
    }

    setIsExporting(true)
    toast.info('Generating Word document, please wait...')

    try {
      const generator = new TestReportWordGenerator(certificateData, certificateItems)
      await generator.generateWordDocument()
      toast.success('Word document downloaded successfully!')
    } catch (error) {
      console.error('Error exporting to Word:', error)
      toast.error(`Failed to generate Word document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportToWord,
    isExporting
  }
}
