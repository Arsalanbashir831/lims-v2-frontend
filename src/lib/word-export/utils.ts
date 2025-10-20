/**
 * Utility functions for Word document generation
 */

// Helper function to safely get values
export const safeValue = (val: any): string => {
  return val != null && val !== '' ? String(val) : 'N/A'
}

// Helper function to format dates
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    })
  } catch {
    return 'N/A'
  }
}

// Helper function to fetch image as data URI
export const fetchAsDataURI = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error fetching image as data URI:', error)
    throw error
  }
}

// Helper function to generate QR code as data URI
export const generateQRCodeDataURI = async (text: string, options?: {
  width?: number
  margin?: number
}): Promise<string> => {
  try {
    // Dynamic import to avoid SSR issues
    const QRCode = await import('qrcode')
    return await QRCode.default.toDataURL(text, {
      width: options?.width || 90,
      margin: options?.margin || 1,
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

// Helper function to create Word document blob
export const createWordDocument = (
  htmlContent: string,
  filename: string,
  assets?: {
    gripcoLogoBase64: string
    iasLogoBase64: string
    qrCodeBase64: string
  },
  options?: {
    headerHTML?: string
    footerHTML?: string
    extraStyles?: string
  }
): void => {
  const wordHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
        <meta name="Generator" content="Microsoft Word 15">
        <title>Test Report - ${filename}</title>
        <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 8.5in 11.0in;
            margin: 1.0in 0.75in 1.0in 0.75in;
            mso-header-margin: 0.5in;
            mso-footer-margin: 0.5in;
            mso-header: h1;
            mso-footer: f1;
          }
          div.Section1 { page: Section1; }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 11pt; 
            margin: 0; 
            line-height: 1.15; 
          }
          table { border-collapse: collapse; width: 100%; margin: 0; }
          /* Ensure borders show up in Word */
          table, th, td { border: 1pt solid #cfcfcf; mso-border-alt: solid #cfcfcf 1pt; }
          thead tr { background-color: #f3f4f6; } /* Light gray header background */
          thead th { border-bottom: 1pt solid #cfcfcf; }
          tbody td { border-top: none; }
          /* Force borders for standalone tbody tables */
          .standalone-tbody { border: 1pt solid #cfcfcf !important; }
          .standalone-tbody tbody { border: 1pt solid #cfcfcf !important; }
          .standalone-tbody td { border: 1pt solid #cfcfcf !important; }
          td, th { vertical-align: top; }
          p { margin: 3pt 0; line-height: 1.2; }
          h1, h2, h3 { font-weight: bold; margin: 8pt 0 4pt 0; }
          img { max-width: 100%; height: auto; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
          table#hrdftrtbl { display: none !important; position: absolute; top: -1000px; left: -1000px; margin: 0 !important; width: 1px; height: 1px; overflow: hidden; visibility: hidden; }
          div.mso-element\\:header { mso-element: header; }
          p.MsoHeader { margin: 0in; margin-bottom: .0001pt; mso-pagination: widow-orphan; tab-stops: center 3.0in right 6.0in; font-size: 10.0pt; font-family: "Arial", sans-serif; }
          div.mso-element\\:footer { mso-element: footer; }
          p.MsoFooter { margin: 0in; margin-bottom: .0001pt; mso-pagination: widow-orphan; tab-stops: center 3.0in right 6.0in; font-size: 10.0pt; font-family: "Arial", sans-serif; }
          ${options?.extraStyles ?? ''}
        </style>
      </head>
      <body>
        <div class="Section1">
          ${htmlContent}
          
          <!-- Hidden table for header/footer definitions - MUST be invisible but present -->
          <table id='hrdftrtbl' border='0' cellspacing='0' cellpadding='0' style='position: absolute; top: -9999px; left: -9999px; width: 0; height: 0; opacity: 0; visibility: hidden; overflow: hidden; z-index: -9999; mso-displayed: none;'>
            <tr>
              <td>
                <div style='mso-element:header' id='h1'>
                  ${options?.headerHTML ?? `
                  <table style="width: 100%; border: none; border-collapse: collapse;">
                    <tr>
                      <td style="width: 40%; vertical-align: middle; border: none; padding: 0; text-align: left;">
                        ${assets?.gripcoLogoBase64 ? `<img src="${assets.gripcoLogoBase64}" style="height: 12pt; width: auto;" alt="Gripco Logo">` : '<span style="font-weight: bold; font-size: 12pt;">GRIPCO</span>'}
                      </td>
                      <td style="width: 20%; vertical-align: middle; border: none; padding: 0; text-align: center;"></td>
                      <td style="width: 40%; vertical-align: middle; border: none; padding: 0; text-align: right;">
                        ${assets?.iasLogoBase64 ? `<img src="${assets.iasLogoBase64}" style="height: 18pt; width: auto; margin-right: 10pt;" alt="IAS Logo">` : ''}
                        ${assets?.qrCodeBase64 ? `<img src="${assets.qrCodeBase64}" style="height: 18pt; width: auto;" alt="QR Code">` : ''}
                      </td>
                    </tr>
                  </table>
                  `}
                </div>
              </td>
              <td>
                <div style='mso-element:footer' id='f1'>
                  ${options?.footerHTML ?? `
                  <table style="width: 100%; border: none; border-collapse: collapse;">
                    <tr>
                      <td style="width: 100%; vertical-align: top; border: none; padding: 0;">
                        <p class="MsoFooter" style="text-align: left; font-size: 8pt; margin: 0; line-height: 1.1;">
                          <span style="font-weight: bold;">Commercial Registration No:</span> 2015253768<br/>
                          All Works and services carried out by GRIPCO Material Testing Saudia are subjected to and conducted with the standard terms and conditions of GRIPCO Material Testing, which are available on the GRIPCO Site or upon request.<br/>
                          These results relate only to the item(s) tested/sampling conducted by the organization indicated. No deviations were observed during the testing process.
                        </p>
                      </td>
                    </tr>
                  </table>
                  `}
                </div>
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `

  const blob = new Blob([wordHTML], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.doc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
