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
      console.log('Starting Word document generation...')
      
      // Pre-load required assets
      const assets = await this.loadAssets()
      console.log('Assets loaded:', {
        gripcoLogo: assets.gripcoLogoBase64 ? 'Yes' : 'No',
        qrCode: assets.qrCodeBase64 ? 'Yes' : 'No',
        gripcoLength: assets.gripcoLogoBase64?.length || 0,
        qrCodeLength: assets.qrCodeBase64?.length || 0
      })
      
      // Generate document content
      const documentHTML = await this.generateDocumentHTML(assets)
      
      // Create and download Word document
      const filename = `Test-Report-${this.certificateData.certificate_id}`
      console.log('Creating Word document with filename:', filename)
      createWordDocument(documentHTML, filename, assets)
    } catch (error) {
      console.error('Error generating Word document:', error)
      throw error
    }
  }

  private async loadAssets(): Promise<{
    gripcoLogoBase64: string
    qrCodeBase64: string
  }> {
    const assets = {
      gripcoLogoBase64: '',
      qrCodeBase64: ''
    }

    try {
      // Load logos with retry mechanism
      try {
        // Load Gripco logo PNG directly (Word compatible format)
        try {
          const logoData = await fetchAsDataURI('/gripco-logo.png')
          if (logoData && logoData.startsWith('data:image/')) {
            assets.gripcoLogoBase64 = logoData
            console.log('Gripco logo loaded successfully from PNG')
            console.log(`Gripco logo data length: ${logoData.length}`)
          } else {
            console.warn('Invalid logo data')
          }
        } catch (e) {
          console.warn('Failed to load Gripco logo:', e)
        }
      } catch (e) {
        console.warn('Gripco logo loading failed:', e)
      }

      try {
        // Generate QR code for the certificate
        const qrCodeText = `Certificate ID: ${this.certificateData.certificate_id}\nJob ID: ${this.certificateData.job_id}\nDate: ${this.certificateData.issue_date}`
        assets.qrCodeBase64 = await generateQRCodeDataURI(qrCodeText, {
          width: 100,
          margin: 2
        })
        console.log('QR code generated successfully')
      } catch (e) {
        console.warn('Failed to generate QR code:', e)
      }

      // QR code removed - only using logos in header
    } catch (error) {
      console.error('Error loading assets:', error)
    }

    return assets
  }

  private async generateDocumentHTML(assets: {
    gripcoLogoBase64: string
    qrCodeBase64: string
  }): Promise<string> {
    let documentHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #333; max-width: 100%; margin: 0; padding: 0;">
    `

    // Add header
    documentHTML += this.generateHeader()
    
    // Add certificate information
    documentHTML += this.generateCertificateInfo()
    
    // Add test results for each item
    documentHTML += await this.generateTestResults(assets)
    
    // Add signatures
    documentHTML += this.generateSignatures()
    
    // Add footer
    documentHTML += this.generateFooter(assets)

    documentHTML += `</div>`
    return documentHTML
  }

  private generateHeader(): string {
    return `
      <div style="text-align: center; margin: 12pt 0;">
        <h1 style="font-weight: bold; margin: 0; text-transform: uppercase; font-size: 18pt; color: #333;">
          TEST CERTIFICATE
        </h1>
      </div>
    `
  }

  private generateCertificateInfo(): string {
    return `
      <table style="width: 100%; border: none; margin: 12pt 0;">
        <tr>
          <td style="width: 60%; vertical-align: top; border: none; padding: 4pt;">
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Client Name:</b> ${safeValue(this.certificateData.client_name)}</p>
            <p style="margin: 3pt 0; font-size: 11pt;"><b>PO #:</b> ${safeValue(this.certificateData.customer_po)}</p>
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Customer Name:</b> ${safeValue(this.certificateData.customers_name_no)}</p>
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Attn:</b> ${safeValue(this.certificateData.atten)}</p>
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Project Name:</b> ${safeValue(this.certificateData.project_name)}</p>
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Name of Laboratory:</b> GLOBAL RESOURCE INSPECTION CONTRACTING COMPANY-DAMMAM</p>
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Address:</b> P.O. Box 100, Dammam 31411, Kingdom of Saudi Arabia</p>
          </td>
          <td style="width: 40%; vertical-align: top; border: none; padding: 4pt;">
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Date of Sampling:</b> ${formatDate(this.certificateData.date_of_sampling)}</p>
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Date of Testing:</b> ${formatDate(this.certificateData.date_of_testing)}</p>
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Issue Date:</b> ${formatDate(this.certificateData.issue_date)}</p>
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Gripco Ref No:</b> ${safeValue(this.certificateData.job_id)}</p>
            <p style="margin: 3pt 0; font-size: 11pt;"><b>Revision #:</b> ${safeValue(this.certificateData.revision_no)}</p>
          </td>
        </tr>
      </table>
    `
  }

  private async generateTestResults(assets: {
    gripcoLogoBase64: string
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
          <div style="margin: 8pt 0;">
            <table style="width: 100%; border: none; border-collapse: collapse; margin: 0;">
              <tr>
                <td style="width: 50%; vertical-align: top; border: none !important; padding: 0 8pt 0 0;">
                  <p style="margin: 2pt 0; font-size: 11pt;"><b>Test Equipment:</b> ${safeValue(item.equipment_name)}</p>
                  <p style="margin: 2pt 0; font-size: 11pt;"><b>Test Method:</b> ${safeValue(testMethodInfo?.test_name)}</p>
                  <p style="margin: 2pt 0; font-size: 11pt;"><b>Sample Prep Method:</b> ${safeValue(item.sample_preparation_method)}</p>
                  <p style="margin: 2pt 0; font-size: 11pt;"><b>Sample Description:</b> N/A</p>
                </td>
                <td style="width: 50%; vertical-align: top; border: none !important; padding: 0 0 0 8pt;">
                  <p style="margin: 2pt 0; font-size: 11pt;"><b>Material Grade:</b> ${safeValue(item.material_grade)}</p>
                  <p style="margin: 2pt 0; font-size: 11pt;"><b>Heat No.:</b> ${safeValue(item.heat_no)}</p>
                  <p style="margin: 2pt 0; font-size: 11pt;"><b>Temperature:</b> ${safeValue(item.temperature)}</p>
                  <p style="margin: 2pt 0; font-size: 11pt;"><b>Humidity:</b> ${safeValue(item.humidity)}</p>
                </td>
              </tr>
            </table>
          </div>
        `

        // Add test results table
        testResultsHTML += this.generateTestResultsTable(specimenInfo)

        // Collect images for rendering at the end
        if (specimenInfo.images_list && specimenInfo.images_list.length > 0) {
          for (const image of specimenInfo.images_list) {
            if (image.image_url && image.image_url.trim() !== '') {
              // Convert relative URLs to full URLs
              let fullImageUrl = image.image_url
              if (!fullImageUrl.startsWith('http') && !fullImageUrl.startsWith('blob:')) {
                // Try to use a proxy approach first
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(fullImageUrl)}`
                fullImageUrl = proxyUrl
              }
              console.log('Processing image URL:', fullImageUrl)
              
              imagesForEnd.push({
                imageUrl: fullImageUrl,
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
        testResultsHTML += '<div class="page-break" style="page-break-before: always; clear: both;"></div>'
        for (const img of imagesForEnd) {
        try {
          console.log('Loading image:', img.imageUrl)
          
          // Try multiple approaches to load the image
          let base64 = null
          let imageLoaded = false
          
          // Approach 1: Direct fetch
          try {
            base64 = await fetchAsDataURI(img.imageUrl)
            if (base64 && base64.startsWith('data:image/')) {
              imageLoaded = true
              console.log('Image loaded successfully via direct fetch')
            }
          } catch (e) {
            console.warn('Direct fetch failed:', e)
          }
          
          // Approach 2: Try with different URL formats
          if (!imageLoaded) {
            try {
              // Try with different backend URLs
              const possibleUrls = [
                img.imageUrl,
                img.imageUrl.replace('/api/proxy-image?url=', ''),
                img.imageUrl.replace('http://192.168.1.2:8000', 'http://localhost:8000'),
                img.imageUrl.replace('http://localhost:8000', 'http://192.168.1.2:8000'),
                img.imageUrl.replace(/^https?:\/\/[^\/]+/, window.location.origin)
              ]
              
              for (const url of possibleUrls) {
                if (url !== img.imageUrl) {
                  console.log('Trying alternative URL:', url)
                  try {
                    base64 = await fetchAsDataURI(url)
                    if (base64 && base64.startsWith('data:image/')) {
                      imageLoaded = true
                      console.log('Image loaded successfully via alternative URL')
                      break
                    }
                  } catch (e) {
                    console.warn('Alternative URL failed:', e)
                  }
                }
              }
            } catch (e) {
              console.warn('Alternative URL approach failed:', e)
            }
          }
          
          if (imageLoaded && base64) {
            testResultsHTML += `
              <div style="text-align: center; margin: 12pt 0; page-break-inside: avoid;" class="avoid-break">
                <p style="margin-bottom: 6pt; font-weight: bold; text-align: left;">${img.reference}</p>
                   <img src="${base64}" style="width: 40pt; height: 40pt; object-fit: contain; display: block; margin: 0 auto;" alt="${img.reference}">
                ${img.note && String(img.note).trim() !== '' ? `<p style="font-style: italic; color:#6a7282; margin: 4pt 0;">${img.note}</p>` : ''}
              </div>
            `
          } else {
            console.warn('All image loading approaches failed, using fallback')
            // Create a simple placeholder image using SVG
            const placeholderSvg = `data:image/svg+xml;base64,${btoa(`
              <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="200" fill="#f0f0f0" stroke="#ccc" stroke-width="1"/>
                <text x="150" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">
                  Image Not Available
                </text>
                <text x="150" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#999">
                  ${img.imageUrl.split('/').pop() || 'Image'}
                </text>
              </svg>
            `)}`
            
            testResultsHTML += `
              <div style="text-align: center; margin: 12pt 0; page-break-inside: avoid;" class="avoid-break">
                <p style="margin-bottom: 6pt; font-weight: bold; text-align: left;">${img.reference}</p>
                 <img src="${placeholderSvg}" style="width: 40pt; height: 40pt; object-fit: contain; display: block; margin: 0 auto;" alt="${img.reference}">
                ${img.note && String(img.note).trim() !== '' ? `<p style="font-style: italic; color:#6a7282; margin: 4pt 0;">${img.note}</p>` : ''}
              </div>
            `
          }
        } catch (e) {
          console.error('Error adding image to Word document:', e)
          // Create a simple placeholder image using SVG
          const placeholderSvg = `data:image/svg+xml;base64,${btoa(`
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
              <rect width="300" height="200" fill="#f0f0f0" stroke="#ccc" stroke-width="1"/>
              <text x="150" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">
                Image Not Available
              </text>
              <text x="150" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#999">
                ${img.imageUrl.split('/').pop() || 'Image'}
              </text>
            </svg>
          `)}`
          
          testResultsHTML += `
            <div style="text-align: center; margin: 12pt 0;" class="avoid-break">
              <p style="margin-bottom: 6pt; font-weight: bold; text-align: left;">${img.reference}</p>
                 <img src="${placeholderSvg}" style="width: 80pt; height: 60pt; object-fit: contain; display: block; margin: 0 auto;" alt="${img.reference}">
              ${img.note && String(img.note).trim() !== '' ? `<p style="font-style: italic; color:#6a7282; margin: 4pt 0;">${img.note}</p>` : ''}
            </div>
          `
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
      <div style="margin: 20pt 0;">
        <div style="display: table; width: 100%; margin: 16pt 0;">
          <div style="display: table-cell; width: 50%; vertical-align: top; padding: 8pt;">
            <p style="margin: 2pt 0; font-size: 11pt;"><b>Tested By:</b> ${safeValue(this.certificateData.tested_by)}</p>
          </div>
          <div style="display: table-cell; width: 50%; vertical-align: top; padding: 8pt;">
            <p style="margin: 2pt 0; font-size: 11pt;"><b>Reviewed By:</b> ${safeValue(this.certificateData.reviewed_by)}</p>
          </div>
        </div>
      </div>
    `
  }

  private generateFooter(assets: {
    gripcoLogoBase64: string
    qrCodeBase64: string
  }): string {
    const currentDate = new Date().toLocaleDateString('en-GB')
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    
    return `
      <div style="margin: 24pt 0;">
        <div style="margin: 16pt 0; font-size: 9pt; color: #666; line-height: 1.4;">
          <p style="margin: 2pt 0;"><b>Commercial Registration No:</b> 2015253768</p>
          <p style="margin: 2pt 0;">The results shown in this certificate relate only to the sample(s) tested. This certificate shall not be reproduced except in full, without the written approval of GRIPCO Material Testing Saudia. The results shown in this certificate are based on the information provided by the client and are subject to GRIPCO Material Testing Saudia's terms and conditions.</p>
          <p style="margin: 2pt 0;">For more information, please visit: <a href="https://gripco.com.sa" style="color: #0066cc;">https://gripco.com.sa</a></p>
        </div>
        
        <div style="margin: 16pt 0; font-size: 9pt; color: #666; text-align: center;">
          <p style="margin: 2pt 0;">${currentDate}, ${currentTime}</p>
          <p style="margin: 2pt 0; font-weight: bold;">GRIPCO LIMS</p>
          <p style="margin: 2pt 0;">These results relate only to the item(s) tested/sampling conducted by the organization indicated. No deviations were observed during the testing process.</p>
          <p style="margin: 2pt 0; font-weight: bold;">1/2</p>
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
