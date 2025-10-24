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
      
      // Generate footer content
      const footerHTML = this.generateDocumentFooter()
      
      // Create and download Word document
      const filename = `Test-Report-${this.certificateData.certificate_id}`
      
      createWordDocument(documentHTML, filename, assets, {
        footerHTML: footerHTML
      })
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

    // Load Gripco logo with multiple fallback attempts
    try {
      const gripcoPaths = ['/gripco-logo.png', '/gripco-logo.webp', './gripco-logo.png', './gripco-logo.webp']
      
      for (const path of gripcoPaths) {
        try {
          const logoData = await fetchAsDataURI(path)
          if (logoData && logoData.startsWith('data:image/')) {
            assets.gripcoLogoBase64 = logoData
            break
          }
        } catch (e) {
          // Continue to next path
        }
      }
    } catch (e) {
      // Continue with other assets
    }

    // Load IAS logo with multiple fallback attempts
    try {
      const iasPaths = ['/ias-logo-vertical.png', '/ias-logo-vertical.webp', '/iaslogo.png', './ias-logo-vertical.png', './ias-logo-vertical.webp', './iaslogo.png']
      
      for (const path of iasPaths) {
        try {
          const iasLogoData = await fetchAsDataURI(path)
          if (iasLogoData && iasLogoData.startsWith('data:image/')) {
            assets.iasLogoBase64 = iasLogoData
            break
          }
        } catch (e) {
          // Continue to next path
        }
      }
    } catch (e) {
      // Continue with other assets
    }

    // Generate QR code
    try {
      const qrCodeText = `Certificate ID: ${this.certificateData.certificate_id}\nJob ID: ${this.certificateData.job_id}\nDate: ${this.certificateData.issue_date}`
      assets.qrCodeBase64 = await generateQRCodeDataURI(qrCodeText, {
        width: 100,
        margin: 2
      })
    } catch (e) {
      // Continue without QR code
    }

    return assets
  }

  private async generateDocumentHTML(assets: {
    gripcoLogoBase64: string
    iasLogoBase64: string
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
          // Try multiple approaches to load the image
          let base64 = null
          let imageLoaded = false
          
          // Approach 1: Direct fetch
          try {
            base64 = await fetchAsDataURI(img.imageUrl)
            if (base64 && base64.startsWith('data:image/')) {
              imageLoaded = true
            }
          } catch (e) {
            // Continue to alternative approaches
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
                  try {
                    base64 = await fetchAsDataURI(url)
                    if (base64 && base64.startsWith('data:image/')) {
                      imageLoaded = true
                      break
                    }
                  } catch (e) {
                    // Continue to next URL
                  }
                }
              }
            } catch (e) {
              // Continue without image
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
      return ''
    }
  }

  private generateSignatures(): string {
    return `
      <div style="margin: 24pt 0 16pt 0;">
        <table style="width: 100%; border: none; border-collapse: collapse; margin: 0;">
          <tr>
            <td style="width: 50%; vertical-align: top; border: none; padding: 8pt 16pt 8pt 0; text-align: left;">
              <p style="margin: 0 0 8pt 0; font-size: 11pt; font-weight: bold;">Tested By: <span style="font-weight: normal;">${safeValue(this.certificateData.tested_by)}</span></p>
            </td>
            <td style="width: 50%; vertical-align: top; border: none; padding: 8pt 0 8pt 16pt; text-align: right;">
              <p style="margin: 0 0 8pt 0; font-size: 11pt; font-weight: bold;">Reviewed By: <span style="font-weight: normal;">${safeValue(this.certificateData.reviewed_by)}</span></p>
            </td>
          </tr>
        </table>
      </div>
    `
  }

  private generateDocumentFooter(): string {
    return `
      <p class="MsoFooter" style="font-size:9pt;line-height:1.25;margin:0;">
        All Works and services carried out by GRIPCO Material Testing Saudia are subjected to and conducted with the standard terms and conditions of GRIPCO Material Testing, which are available on the GRIPCO Site or upon request.
      </p>
      <p class="MsoFooter" style="font-size:9pt;line-height:1.25;margin:0;">
        The results shown in this certificate relate only to the sample(s) tested. This certificate shall not be reproduced except in full, without the written approval of GRIPCO Material Testing Saudia. The results shown in this certificate are based on the information provided by the client and are subject to GRIPCO Material Testing Saudia's terms and conditions.
      </p>
      <p class="MsoFooter" style="font-size:9pt;line-height:1.25;margin:0;">
        For more information, please visit: <a href="https://gripco.com.sa">https://gripco.com.sa</a>
      </p>
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
