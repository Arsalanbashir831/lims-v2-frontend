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
    // Handle relative URLs by making them absolute
    let fullUrl = url
    if (url.startsWith('/')) {
      fullUrl = `${window.location.origin}${url}`
    }
    
    console.log('Attempting to load image:', fullUrl)
    
    // Try multiple approaches for loading images
    try {
      // Approach 1: Direct fetch with CORS
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(fullUrl, {
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
        headers: {
          'Accept': 'image/*',
          'Cache-Control': 'no-cache'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      
      // Validate that it's actually an image
      if (!blob.type.startsWith('image/')) {
        throw new Error('Response is not an image')
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Validate the data URI
          if (result && result.startsWith('data:image/')) {
            console.log('Image loaded successfully via CORS')
            resolve(result)
          } else {
            reject(new Error('Invalid image data'))
          }
        }
        reader.onerror = () => reject(new Error('Failed to read image data'))
        reader.readAsDataURL(blob)
      })
    } catch (corsError) {
      console.warn('CORS approach failed, trying no-cors:', corsError)
      
      // Approach 2: Try with no-cors mode
      try {
        const response = await fetch(fullUrl, {
          mode: 'no-cors',
          credentials: 'omit'
        })
        
        const blob = await response.blob()
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            if (result && result.startsWith('data:image/')) {
              console.log('Image loaded successfully via no-cors')
              resolve(result)
            } else {
              reject(new Error('Invalid image data'))
            }
          }
          reader.onerror = () => reject(new Error('Failed to read image data'))
          reader.readAsDataURL(blob)
        })
      } catch (noCorsError) {
        console.warn('No-cors approach also failed:', noCorsError)
        
        // Approach 3: Try with different headers
        try {
          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
              'Accept': '*/*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          
          const blob = await response.blob()
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              const result = reader.result as string
              if (result && result.startsWith('data:image/')) {
                console.log('Image loaded successfully via alternative headers')
                resolve(result)
              } else {
                reject(new Error('Invalid image data'))
              }
            }
            reader.onerror = () => reject(new Error('Failed to read image data'))
            reader.readAsDataURL(blob)
          })
        } catch (altError) {
          console.warn('Alternative headers approach also failed:', altError)
          throw new Error('All image loading approaches failed')
        }
      }
    }
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
    qrCodeBase64: string
  },
  options?: {
    headerHTML?: string
    footerHTML?: string
    extraStyles?: string
  }
): void => {
  console.log('Creating Word document with assets:', {
    hasGripcoLogo: assets?.gripcoLogoBase64 ? 'Yes' : 'No',
    hasQrCode: assets?.qrCodeBase64 ? 'Yes' : 'No',
    gripcoLength: assets?.gripcoLogoBase64?.length || 0,
    qrCodeLength: assets?.qrCodeBase64?.length || 0,
    gripcoStartsWith: assets?.gripcoLogoBase64?.startsWith('data:image/') || false,
    qrCodeStartsWith: assets?.qrCodeBase64?.startsWith('data:image/') || false
  })
  
  // Debug the actual header HTML being generated
  const headerHTML = `
    <table style="width: 100%; border: none; border-collapse: collapse;">
      <tr>
        <td style="width: 50%; vertical-align: middle; border: none; padding: 0; text-align: left;">
          ${assets?.gripcoLogoBase64 && assets.gripcoLogoBase64.startsWith('data:image/') ? `<img src="${assets.gripcoLogoBase64}" style="height: 40pt; width: auto; max-width: 150pt;" alt="Gripco Logo">` : '<div style="font-weight: bold; font-size: 14pt; color: #333;">GRIPCO</div>'}
        </td>
        <td style="width: 50%; vertical-align: middle; border: none; padding: 0; text-align: right;">
          ${assets?.qrCodeBase64 && assets.qrCodeBase64.startsWith('data:image/') ? `<img src="${assets.qrCodeBase64}" style="height: 30pt; width: 30pt;" alt="QR Code">` : '<div style="font-weight: bold; font-size: 12pt; color: #333;">QR Code</div>'}
        </td>
      </tr>
    </table>
  `
  console.log('Header HTML being generated:', headerHTML)
  
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
                      <td style="width: 50%; vertical-align: middle; border: none; padding: 5pt; text-align: left;">
                        ${assets?.gripcoLogoBase64 && assets.gripcoLogoBase64.startsWith('data:image/') ? `<img src="${assets.gripcoLogoBase64}" style="height: 50pt; width: auto; max-width: 180pt; opacity: 1; filter: contrast(1.1) brightness(1);" alt="Gripco Logo">` : '<div style="font-weight: bold; font-size: 14pt; color: #333;">GRIPCO</div>'}
                      </td>
                      <td style="width: 50%; vertical-align: middle; border: none; padding: 5pt; text-align: right;">
                        ${assets?.qrCodeBase64 && assets.qrCodeBase64.startsWith('data:image/') ? `<img src="${assets.qrCodeBase64}" style="height: 40pt; width: 40pt; opacity: 1; filter: contrast(1.2) brightness(0.9);" alt="QR Code">` : '<div style="font-weight: bold; font-size: 12pt; color: #333;">QR Code</div>'}
                      </td>
                    </tr>
                  </table>
                  `}
                </div>
              </td>
              <td>
                <div style='mso-element:footer' id='f1'>
                  <p class="MsoFooter" style="margin: 0;"></p>
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
