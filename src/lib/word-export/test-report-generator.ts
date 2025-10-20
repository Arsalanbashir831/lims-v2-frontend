import { safeValue, formatDate, fetchAsDataURI, generateQRCodeDataURI, createWordDocument } from './utils'

interface TestReportData {
  id: string
  certificate_id: string
  client_name: string
  job_id: string
  project_name: string
  date_of_sampling: string
  date_of_testing: string
  issue_date: string
  revision_no: string
  customers_name_no: string
  atten: string
  customer_po: string
  tested_by: string
  reviewed_by: string
  request_info?: {
    request_id: string
    request_no: string
    sample_lots: Array<{
      item_description: string
      test_method: {
        test_method_oid: string
        test_name: string
        test_description?: string
        test_columns?: string[]
        hasImage?: boolean
      }
      specimens: Array<{
        specimen_oid: string
        specimen_id: string
      }>
    }>
  }
}

interface TestReportItem {
  _id: string
  certificate_id: string
  sample_preparation_method: string
  material_grade: string
  temperature: string
  humidity: string
  heat_no: string
  comments: string
  equipment_name: string
  equipment_calibration: string
  specimen_sections: Array<{
    specimen_id: string
    specimen_name?: string
    test_results: string
    images_list: Array<{
      image_url: string
      caption: string
    }>
  }>
}

export class TestReportWordGenerator {
  private certificateData: TestReportData
  private certificateItems: TestReportItem[]

  constructor(certificateData: TestReportData, certificateItems: TestReportItem[]) {
    this.certificateData = certificateData
    this.certificateItems = certificateItems
  }

  async generateWordDocument(): Promise<void> {
    try {
      // Pre-load required assets
      const assets = await this.loadAssets()
      
      // Generate document content
      const documentHTML = await this.generateDocumentHTML(assets)
      
      // Create and download Word document
      const filename = `Test-Report-${this.certificateData.certificate_id}`
      createWordDocument(documentHTML, filename, assets)
    } catch (error) {
      console.error('Error generating Word document:', error)
      throw error
    }
  }

  private async loadAssets(): Promise<{
    gripcoLogoBase64: string
    iasLogoBase64: string
    qrCodeBase64: string
  }> {
    const assets = {
      gripcoLogoBase64: '',
      iasLogoBase64: '',
      qrCodeBase64: ''
    }

    try {
      // Load logos
      try {
        assets.gripcoLogoBase64 = await fetchAsDataURI('/gripco-logo.webp')
      } catch (e) {
        console.warn('Failed to load Gripco logo:', e)
      }

      try {
        assets.iasLogoBase64 = await fetchAsDataURI('/ias-logo.webp')
      } catch (e) {
        console.warn('Failed to load IAS logo:', e)
      }

      // Generate QR code
      try {
        const livePreviewUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/public/test-report/${this.certificateData.id}`
        assets.qrCodeBase64 = await generateQRCodeDataURI(livePreviewUrl, { width: 90, margin: 1 })
      } catch (e) {
        console.warn('Failed to generate QR code:', e)
      }
    } catch (error) {
      console.error('Error loading assets:', error)
    }

    return assets
  }

  private async generateDocumentHTML(assets: {
    gripcoLogoBase64: string
    iasLogoBase64: string
    qrCodeBase64: string
  }): Promise<string> {
    let documentHTML = ''

    // Add header
    documentHTML += this.generateHeader()
    
    // Add certificate information
    documentHTML += this.generateCertificateInfo()
    
    // Add test results for each item
    documentHTML += await this.generateTestResults(assets)
    
    // Add signatures
    documentHTML += this.generateSignatures()

    return documentHTML
  }

  private generateHeader(): string {
    return `
      <h1 style="text-align: center; font-weight: bold; margin: 12pt 0; text-transform: uppercase; font-size: 16pt;">
        Test Certificate
      </h1>
    `
  }

  private generateCertificateInfo(): string {
    return `
      <table style="width: 100%; border: none; margin: 12pt 0;">
        <tr>
          <td style="width: 50%; vertical-align: top; border: none; padding: 4pt;">
            <p style="margin: 3pt 0; font-size: 10pt;"><b>Client Name:</b> ${safeValue(this.certificateData.client_name)}</p>
            <p style="margin: 3pt 0; font-size: 10pt;"><b>PO #:</b> ${safeValue(this.certificateData.customer_po)}</p>
            <p style="margin: 3pt 0; font-size: 10pt;"><b>Customer Name:</b> ${safeValue(this.certificateData.customers_name_no)}</p>
            <p style="margin: 3pt 0; font-size: 10pt;"><b>Attn:</b> ${safeValue(this.certificateData.atten)}</p>
            <p style="margin: 3pt 0; font-size: 10pt;"><b>Project Name:</b> ${safeValue(this.certificateData.project_name)}</p>
            <p style="margin: 3pt 0; font-size: 10pt;"><b>Job ID:</b> ${safeValue(this.certificateData.job_id)}</p>
          </td>
          <td style="width: 50%; vertical-align: top; border: none; padding: 4pt; text-align: right;">
            <p style="margin: 3pt 0; font-size: 10pt;"><b>Date of Sampling:</b> ${formatDate(this.certificateData.date_of_sampling)}</p>
            <p style="margin: 3pt 0; font-size: 10pt;"><b>Date of Testing:</b> ${formatDate(this.certificateData.date_of_testing)}</p>
            <p style="margin: 3pt 0; font-size: 10pt;"><b>Issue Date:</b> ${formatDate(this.certificateData.issue_date)}</p>
            <p style="margin: 3pt 0; font-size: 10pt;"><b>Certificate ID:</b> ${safeValue(this.certificateData.certificate_id)}</p>
            <p style="margin: 3pt 0; font-size: 10pt;"><b>Revision #:</b> ${safeValue(this.certificateData.revision_no)}</p>
          </td>
        </tr>
      </table>
    `
  }

  private async generateTestResults(assets: {
    gripcoLogoBase64: string
    iasLogoBase64: string
    qrCodeBase64: string
  }): Promise<string> {
    let testResultsHTML = ''
    const imagesForEnd: Array<{
      imageUrl: string
      note: string
      reference: string
    }> = []

    for (const [itemIndex, item] of this.certificateItems.entries()) {
      // Add page break for new items (except the first one)
      if (itemIndex > 0) {
        testResultsHTML += '<div class="page-break"></div>'
      }

      // Get test method info from request_info
      const testMethodInfo = this.getTestMethodInfo(item)
      const specimenInfo = item.specimen_sections?.[0]

      if (specimenInfo) {
        // Add specimen header
        testResultsHTML += `
          <h3 style="font-weight: bold; margin: 16pt 0 8pt 0; text-transform: uppercase; background: #f2f2f2; padding: 6pt; text-align: center;">
            ${safeValue(testMethodInfo?.test_name)} - Specimen ID (${safeValue(specimenInfo.specimen_name || specimenInfo.specimen_id)})
          </h3>
        `

        // Add specimen details
        testResultsHTML += `
          <table style="width: 100%; border: none; margin: 8pt 0;">
            <tr>
              <td style="width: 60%; vertical-align: top; border: none; padding: 4pt;">
                <p style="margin: 3pt 0; font-size: 10pt;"><b>Test Equipment:</b> ${safeValue(item.equipment_name)}</p>
                <p style="margin: 3pt 0; font-size: 10pt;"><b>Test Method:</b> ${safeValue(testMethodInfo?.test_name)}</p>
                <p style="margin: 3pt 0; font-size: 10pt;"><b>Sample Prep Method:</b> ${safeValue(item.sample_preparation_method)}</p>
                <p style="margin: 3pt 0; font-size: 10pt;"><b>Equipment Calibration:</b> ${safeValue(item.equipment_calibration)}</p>
              </td>
              <td style="width: 40%; vertical-align: top; border: none; padding: 4pt;">
                <p style="margin: 3pt 0; font-size: 10pt;"><b>Material Grade:</b> ${safeValue(item.material_grade)}</p>
                <p style="margin: 3pt 0; font-size: 10pt;"><b>Temperature:</b> ${safeValue(item.temperature)}</p>
                <p style="margin: 3pt 0; font-size: 10pt;"><b>Humidity:</b> ${safeValue(item.humidity)}</p>
                <p style="margin: 3pt 0; font-size: 10pt;"><b>Heat No:</b> ${safeValue(item.heat_no)}</p>
              </td>
            </tr>
          </table>
        `

        // Add test results table
        testResultsHTML += this.generateTestResultsTable(specimenInfo)

        // Collect images for rendering at the end
        if (specimenInfo.images_list && specimenInfo.images_list.length > 0) {
          for (const image of specimenInfo.images_list) {
            if (image.image_url && image.image_url.trim() !== '') {
              imagesForEnd.push({
                imageUrl: image.image_url,
                note: image.caption || '',
                reference: `${safeValue(testMethodInfo?.test_name)} - Specimen ID (${safeValue(specimenInfo.specimen_name || specimenInfo.specimen_id)})`
              })
            }
          }
        }
      }
    }

    // Render all collected images at the end
    if (imagesForEnd.length > 0) {
      testResultsHTML += '<div class="page-break"></div>'
      for (const img of imagesForEnd) {
        try {
          const base64 = await fetchAsDataURI(img.imageUrl)
          if (base64) {
            testResultsHTML += `
              <div style="text-align: center; margin: 12pt 0;" class="avoid-break">
                <p style="margin-bottom: 6pt; font-weight: bold; text-align: left;">${img.reference}</p>
                <img src="${base64}" style="max-width: 100%; height: auto;" alt="${img.reference}">
                ${img.note && String(img.note).trim() !== '' ? `<p style="font-style: italic; color:#6a7282; margin: 4pt 0;">${img.note}</p>` : ''}
              </div>
            `
          }
        } catch (e) {
          console.error('Error adding image to Word document:', e)
        }
      }
    }

    // Add certificate comments section
    const commentsWithData = this.certificateItems.filter(item => item.comments && item.comments.trim() !== '')
    if (commentsWithData.length > 0) {
      const commentsText = commentsWithData.map(item => {
        const specimenSection = item.specimen_sections?.[0]
        const specimenName = specimenSection?.specimen_name || specimenSection?.specimen_id || 'Unknown Specimen'
        const testMethodInfo = this.getTestMethodInfo(item)
        const testMethodName = testMethodInfo?.test_name || 'Unknown Test Method'
        return `${safeValue(testMethodName)} - Specimen ID (${safeValue(specimenName)}): ${safeValue(item.comments)}`
      }).join('\n')

      testResultsHTML += `
        <div style="margin: 24pt 0;">
          <h3 style="font-weight: bold; margin: 0 0 12pt 0; font-size: 14pt; text-align: left;">Certificate Comments</h3>
          <div style="max-width: 500pt; margin: 0 auto; text-align: left;">
            <pre style="font-family: 'monospace'; font-size: 10pt; text-align: left; color: #6a7282; margin: 0; white-space: pre-wrap;">${commentsText}</pre>
          </div>
          <div style="width: 100%; margin: 0 auto; text-align: center; font-family: 'monospace'; color: #6a7282;">
            <div>-------------------------End of Text-------------------------</div>
          </div>
        </div>
      `
    }

    return testResultsHTML
  }

  private generateTestResultsTable(specimenInfo: any): string {
    try {
      const testResults = JSON.parse(specimenInfo.test_results || '{}')
      const columns = testResults.columns || []
      const data = testResults.data || []

      if (columns.length === 0 || data.length === 0) {
        return ''
      }

      let tableHTML = '<div style="height:8pt;"></div>'
      tableHTML += '<table style="width:100%; border-collapse:collapse; table-layout:fixed; margin:6pt 0;">'
      
      // Header
      tableHTML += '<thead><tr>'
      columns.forEach((col: string) => {
        tableHTML += `<th style="padding:4pt; font-weight:bold; font-size:9pt; text-align:center; background:#f2f2f2; border:1pt solid #cfcfcf; white-space:normal; word-break:break-word; overflow-wrap:anywhere;">${col}</th>`
      })
      tableHTML += '</tr></thead>'
      
      // Body
      tableHTML += '<tbody>'
      data.forEach((row: any[]) => {
        tableHTML += '<tr>'
        row.forEach((cell: any) => {
          tableHTML += `<td style="padding:4pt; font-size:9pt; text-align:center; border:1pt solid #cfcfcf; white-space:normal; word-break:break-word; overflow-wrap:anywhere;">${safeValue(cell)}</td>`
        })
        tableHTML += '</tr>'
      })
      tableHTML += '</tbody></table>'
      tableHTML += '<div style="height:8pt;"></div>'

      return tableHTML
    } catch (error) {
      console.error('Error generating test results table:', error)
      return ''
    }
  }

  private generateSignatures(): string {
    return `
      <table style="width: 100%; border: none; margin: 42pt 0;">
        <tr>
          <td style="width: 50%; text-align: center; border: none; padding: 12pt; vertical-align: top;">
            <p style="border-top: 1pt solid black; padding-top: 6pt; margin: 0; font-size: 10pt;">
              <b>Tested By:</b> ${safeValue(this.certificateData.tested_by)}
            </p>
          </td>
          <td style="width: 50%; text-align: center; border: none; padding: 12pt; vertical-align: top;">
            <p style="border-top: 1pt solid black; padding-top: 6pt; margin: 0; font-size: 10pt;">
              <b>Reviewed By:</b> ${safeValue(this.certificateData.reviewed_by)}
            </p>
          </td>
        </tr>
      </table>
    `
  }

  private generateFooter(assets: {
    gripcoLogoBase64: string
    iasLogoBase64: string
    qrCodeBase64: string
  }): string {
    return `
      <div style="margin: 24pt 0;">
        <div style="width: 100%; margin: 0 auto; text-align: center; font-family: 'Arial', sans-serif; color: #6a7282; font-size: 10pt;">
          <div style="margin-bottom: 8pt; font-weight: bold;">Commercial Registration No: 2015253768</div>
          <div style="margin-bottom: 8pt;">All Works and services carried out by GRIPCO Material Testing Saudia are subjected to and conducted with the standard terms and conditions of GRIPCO Material Testing, which are available on the GRIPCO Site or upon request.</div>
          <div>These results relate only to the item(s) tested/sampling conducted by the organization indicated. No deviations were observed during the testing process.</div>
        </div>
      </div>
    `
  }

  private getTestMethodInfo(item: TestReportItem): any {
    if (!this.certificateData.request_info?.sample_lots) {
      return null
    }

    // Find the test method info based on specimen
    for (const sampleLot of this.certificateData.request_info.sample_lots) {
      const specimen = sampleLot.specimens?.find((spec: any) => 
        spec.specimen_id === item.specimen_sections?.[0]?.specimen_name ||
        spec.specimen_oid === item.specimen_sections?.[0]?.specimen_id
      )
      if (specimen) {
        return sampleLot.test_method
      }
    }

    return null
  }
}
