import QRCode from 'qrcode'
import { fetchAsDataURI, createWordDocument } from './utils'
import { ROUTES } from '@/constants/routes'
import { getSectionDataByAccessor } from '@/lib/pqr-utils'

type Column = { header: string; accessorKey: string }

export class PqrWordGenerator {
    private pqrId: string
    private pqrData: Record<string, any>

    constructor(pqrId: string, pqrDataToView: Record<string, any>) {
        this.pqrId = pqrId
        this.pqrData = pqrDataToView
    }

    private safe(v: unknown): string {
        if (v === null || v === undefined) return ''
        return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    }

    private containerOpen = '<div style="margin:10pt 0;">'
    private containerClose = '</div>'
    private tableOpen = '<table style="width:100%; border-collapse:collapse;">'
    private tableClose = '</table>'
    private th = 'style="padding:4pt; font-weight:bold; text-align:left;"'
    private thCenter = 'style="padding:4pt; font-weight:bold; text-align:center;"'
    private td = 'style="padding:4pt; vertical-align:top;"'

    private renderLabelValueRows(title: string, rows: Array<{ label?: string; parameter?: string; description?: string; value?: unknown; value1?: unknown }> = []): string {
        let html = `${this.containerOpen}${this.tableOpen}<thead><tr><th ${this.th} colspan="2">${this.safe(title)}</th></tr></thead><tbody>`
        if (!rows || rows.length === 0) {
            html += `<tr><td ${this.td} colspan="2">No data.</td></tr>`
        } else {
            rows.forEach(item => {
                const label = item.label ?? item.parameter ?? item.description
                const value = item.value ?? item.value1
                html += `<tr><td ${this.td} style="${this.td.slice(7, -1)} width:35%; font-weight:bold;">${this.safe(label)}</td><td ${this.td}>${this.safe(value)}</td></tr>`
            })
        }
        html += `</tbody>${this.tableClose}${this.containerClose}`
        return html
    }

    private renderColumnTable(title: string, columns: Column[], data: Array<Record<string, unknown>> = [], opts?: { centerHeader?: boolean }): string {
        const centerHeader = opts?.centerHeader ?? false
        let html = `${this.containerOpen}${this.tableOpen}<thead>`
        html += `<tr><th ${centerHeader ? this.thCenter : this.th} colspan="${columns.length}">${this.safe(title)}</th></tr>`
        if (columns.length > 0) {
            html += '<tr>'
            columns.forEach(c => { html += `<th ${this.th}>${this.safe(c.header)}</th>` })
            html += '</tr>'
        }
        html += `</thead><tbody>`
        if (!data || data.length === 0) {
            html += `<tr><td ${this.td} colspan="${columns.length}">No data.</td></tr>`
        } else {
            data.forEach(row => {
                html += '<tr>'
                columns.forEach(c => {
                    const val = getSectionDataByAccessor(row, c.accessorKey)
                    html += `<td ${this.td}>${this.safe(val)}</td>`
                })
                html += '</tr>'
            })
        }
        html += `</tbody>${this.tableClose}${this.containerClose}`
        return html
    }

    private renderTwoUp(leftHtml: string, rightHtml: string): string {
        let html = `${this.containerOpen}${this.tableOpen}<tbody><tr>`
        html += `<td ${this.td} style="border:none; width:50%; vertical-align:top; padding:0 6pt 0 0;">${leftHtml}</td>`
        html += `<td ${this.td} style="border:none; width:50%; vertical-align:top; padding:0 0 0 6pt;">${rightHtml}</td>`
        html += `</tr></tbody>${this.tableClose}${this.containerClose}`
        return html
    }

    public async generate(): Promise<void> {
        const publicUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}${ROUTES.PUBLIC?.PQR_PREVIEW(this.pqrId)}`
        const qrCodeBase64 = await QRCode.toDataURL(publicUrl, { width: 90, margin: 1 })
        const gripcoLogoBase64 = await fetchAsDataURI('/gripco-logo.png')
        const isAsme = true

        let bodyHtml = ''

        // Header Info
        if (this.pqrData.headerInfo) {
            const hi = this.pqrData.headerInfo
            const cols = (hi.columns || []) as Column[]
            const rows = (hi.data || []) as Array<Record<string, unknown>>
            if (cols.length > 0) bodyHtml += this.renderColumnTable('WELDING PROCEDURE QUALIFICATION RECORD (PQR)', cols, rows, { centerHeader: true })
            else bodyHtml += this.renderLabelValueRows('WELDING PROCEDURE QUALIFICATION RECORD (PQR)', (hi.data as any) || [])
        }

        // Joints + Image
        {
            const joints = this.pqrData.joints || {} as any
            let left = ''
            const jCols = (joints.columns || []) as Column[]
            const jData = (joints.data || []) as Array<Record<string, unknown>>
            if (jCols.length > 0) left = this.renderColumnTable(`JOINTS ${isAsme ? '(QW-402)' : ''}`, jCols, jData)
            else left = this.renderLabelValueRows(`JOINTS ${isAsme ? '(QW-402)' : ''}`, jData as any)
            let right = ''
            if (joints.designPhotoUrl) {
                try {
                    console.log('Fetching joint design image from:', joints.designPhotoUrl)
                    const img64 = await fetchAsDataURI(joints.designPhotoUrl)
                    if (img64 && img64.startsWith('data:image/')) {
                        right = `${this.containerOpen}<div style="text-align:center;"><img src="${img64}" style="max-width:100%; height:auto; max-height:180pt; object-fit:contain; border:1pt solid #cfcfcf;" alt="Joint Design"/></div>${this.containerClose}`
                        console.log('Joint design image loaded successfully')
                    } else if (img64 && img64.startsWith('data:image/svg+xml')) {
                        // This is a placeholder image from fetchAsDataURI fallback
                        right = `${this.containerOpen}<div style="text-align:center;"><img src="${img64}" style="max-width:100%; height:auto; max-height:180pt; object-fit:contain; border:1pt solid #cfcfcf;" alt="Joint Design Placeholder"/></div>${this.containerClose}`
                        console.log('Joint design image placeholder loaded (CORS issue)')
                    } else {
                        console.warn('Invalid image data received:', img64?.substring(0, 50))
                        right = `${this.containerOpen}<div style="text-align:center; padding:20pt; border:1pt solid #cfcfcf; color:#666;">Joint Design Image<br/>(Invalid data)</div>${this.containerClose}`
                    }
                } catch (error) {
                    console.error('Failed to fetch joint design image:', error)
                    // Add a placeholder if image fails to load
                    right = `${this.containerOpen}<div style="text-align:center; padding:20pt; border:1pt solid #cfcfcf; color:#666;">Joint Design Image<br/>(Failed to load: ${error instanceof Error ? error.message : 'Unknown error'})</div>${this.containerClose}`
                }
            }
            bodyHtml += right ? this.renderTwoUp(left, right) : left
        }

        const sectionList: Array<{ key: string; title: string; twoUpWith?: string; centerHeader?: boolean }> = [
            { key: 'baseMetals', title: `BASE METALS ${isAsme ? '(QW-403)' : ''}` },
            { key: 'fillerMetals', title: `FILLER METALS ${isAsme ? '(QW-404)' : ''}` },
        ]

        sectionList.forEach(s => {
            const sect = this.pqrData[s.key]
            if (!sect) return
            const cols = (sect.columns || []) as Column[]
            const rows = (sect.data || []) as Array<Record<string, unknown>>
            if (cols.length > 0) bodyHtml += this.renderColumnTable(s.title, cols, rows, { centerHeader: !!s.centerHeader })
            else bodyHtml += this.renderLabelValueRows(s.title, rows as any)
        })

        // Positions + Preheat
        {
            const pos = this.pqrData.positions
            const pre = this.pqrData.preheat
            const left = pos?.columns?.length ? this.renderColumnTable(`POSITIONS ${isAsme ? '(QW-405)' : ''}`, pos.columns, pos.data) : this.renderLabelValueRows(`POSITIONS ${isAsme ? '(QW-405)' : ''}`, pos?.data)
            const right = pre?.columns?.length ? this.renderColumnTable(`PREHEAT ${isAsme ? '(QW-406)' : ''}`, pre.columns, pre.data) : this.renderLabelValueRows(`PREHEAT ${isAsme ? '(QW-406)' : ''}`, pre?.data)
            bodyHtml += this.renderTwoUp(left, right)
        }

        // PWHT + Gas
        {
            const pwht = this.pqrData.pwht
            const gas = this.pqrData.gas
            const left = pwht?.columns?.length ? this.renderColumnTable(`POST WELD HEAT TREATMENT ${isAsme ? '(QW-407)' : ''}`, pwht.columns, pwht.data) : this.renderLabelValueRows(`POST WELD HEAT TREATMENT ${isAsme ? '(QW-407)' : ''}`, pwht?.data)
            const right = this.renderColumnTable(`GAS ${isAsme ? '(QW-408)' : ''}`, (gas?.columns || []), (gas?.data || []))
            bodyHtml += this.renderTwoUp(left, right)
        }

        // Electrical + Techniques
        if (this.pqrData.electrical) {
            const s = this.pqrData.electrical
            const cols = (s.columns || []) as Column[]
            const rows = (s.data || []) as Array<Record<string, unknown>>
            if (cols.length > 0) bodyHtml += this.renderColumnTable(`ELECTRICAL CHARACTERISTICS ${isAsme ? '(QW-409)' : ''}`, cols, rows)
            else bodyHtml += this.renderLabelValueRows(`ELECTRICAL CHARACTERISTICS ${isAsme ? '(QW-409)' : ''}`, rows as any)
        }
        if (this.pqrData.techniques) {
            const s = this.pqrData.techniques
            const cols = (s.columns || []) as Column[]
            const rows = (s.data || []) as Array<Record<string, unknown>>
            if (cols.length > 0) bodyHtml += this.renderColumnTable(`TECHNIQUES ${isAsme ? '(QW-410)' : ''}`, cols, rows)
            else bodyHtml += this.renderLabelValueRows(`TECHNIQUES ${isAsme ? '(QW-410)' : ''}`, rows as any)
        }

        // Welding parameters
        if (this.pqrData.weldingParameters) {
            const s = this.pqrData.weldingParameters
            bodyHtml += this.renderColumnTable('WELDING PARAMETERS', (s.columns || []), (s.data || []))
        }

        // Test tables sequence
        const tests: Array<{ key: string; title: string }> = [
            { key: 'tensileTest', title: `Tensile Test ${isAsme ? '(QW-150)' : ''}` },
            { key: 'guidedBendTest', title: `Guided Bend Test ${isAsme ? '(QW-160)' : ''}` },
            { key: 'toughnessTest', title: `Toughness Test ${isAsme ? '(QW-170)' : ''}` },
            { key: 'filletWeldTest', title: `Fillet Weld Test ${isAsme ? '(QW-180)' : ''}` },
            { key: 'otherTests', title: 'Other Tests' },
        ]
        tests.forEach(t => {
            const s = this.pqrData[t.key]
            if (!s) return
            const cols = (s.columns || []) as Column[]
            const rows = (s.data || []) as Array<Record<string, unknown>>
            bodyHtml += this.renderColumnTable(t.title, cols, rows)
        })

         // Welder Testing Info - Show without heading row
         if (this.pqrData.welderTestingInfo) {
             const s = this.pqrData.welderTestingInfo
             const rows = (s.data || []) as Array<Record<string, unknown>>
             
             // Render without title header - just the label-value pairs
             let html = `${this.containerOpen}<table class="standalone-tbody" style="width:100%; border-collapse:collapse;"><tbody>`
             if (!rows || rows.length === 0) {
                 html += `<tr><td ${this.td} colspan="2">No data.</td></tr>`
             } else {
                 rows.forEach(item => {
                     const label = item.label ?? item.parameter ?? item.description
                     const value = item.value ?? item.value1
                     html += `<tr><td ${this.td} style="${this.td.slice(7, -1)} width:35%; font-weight:bold;">${this.safe(label)}</td><td ${this.td}>${this.safe(value)}</td></tr>`
                 })
             }
             html += `</tbody></table>${this.containerClose}`
             bodyHtml += html
         }

        // Certification - Show as single bordered statement
        if (this.pqrData.certification) {
            const s = this.pqrData.certification
            const rows = (s.data || []) as Array<Record<string, unknown>>

             // Extract the certification statement text
             let certificationText = 'We certify that the statements in this record are correct and that the test welds were prepared, welded and tested in accordance with the requirements of: '
             if (rows && rows.length > 0) {
                 // Look for common certification text fields
                 const firstRow = rows[0]
                 const reference = (firstRow.reference as string) ||
                     Object.values(firstRow).find(val => typeof val === 'string' && val.length > 50) ||
                     'N/A'
                 certificationText += `<strong><em>${reference}</em></strong>`
             }

             // Render as single bordered cell (don't escape HTML since we have formatting)
             bodyHtml += `${this.containerOpen}<table class="standalone-tbody" style="width:100%; border-collapse:collapse;"><tbody><tr><td ${this.td}>${certificationText}</td></tr></tbody></table>${this.containerClose}`
        }

        // Signatures
        if (this.pqrData.signatures) {
            const s = this.pqrData.signatures
            const cols = (s.columns || []) as Column[]
            const rows = (s.data || []) as Array<Record<string, unknown>>
            if (cols.length > 0) bodyHtml += this.renderColumnTable('SIGNATURES', cols, rows)
            else bodyHtml += this.renderLabelValueRows('SIGNATURES', rows as any)
        }

        const footerHTML = `
      <table style="width:100%; border:none; border-collapse:collapse;">
        <tr>
          <td style="width:50%; text-align:left; border:none; padding:0;"></td>
          <td style="width:50%; text-align:right; border:none; padding:0;">
            <p class="MsoFooter" style="text-align:right; font-size:10pt; margin:0;">
              <span style="mso-no-proof:yes">Page </span>
              <span style="mso-field-code:'PAGE \\* MERGEFORMAT'"></span>
              <span style="mso-no-proof:yes"> of </span>
              <span style="mso-field-code:'NUMPAGES \\* MERGEFORMAT'"></span>
            </p>
          </td>
        </tr>
      </table>`

        const filename = `PQR_${this.pqrId}`
        await createWordDocument(bodyHtml, filename, {
            gripcoLogoBase64,
            iasLogoBase64: gripcoLogoBase64, // Use gripco logo as fallback
            qrCodeBase64
        }, {
            headerHTML: `
        <table style="width: 100%; border: none; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: middle; border: none; padding: 5pt; text-align: left;">
              ${gripcoLogoBase64 ? `<img src="${gripcoLogoBase64}" style="height: 50pt; width: auto; max-width: 180pt; opacity: 1; filter: contrast(1.1) brightness(1);" alt="Gripco Logo"/>` : '<div style="font-weight: bold; font-size: 14pt; color: #333;">GRIPCO</div>'}
            </td>
            <td style="width: 50%; vertical-align: middle; border: none; padding: 5pt; text-align: right;">
              ${qrCodeBase64 ? `<img src="${qrCodeBase64}" style="height: 40pt; width: 40pt; opacity: 1; filter: contrast(1.2) brightness(0.9);" alt="QR Code"/>` : '<div style="font-weight: bold; font-size: 12pt; color: #333;">QR Code</div>'}
            </td>
          </tr>
        </table>`,
            footerHTML: footerHTML,
            extraStyles: `
        /* Light gray header background */
        thead tr { background-color: #f3f4f6; }
        /* Section spacing wrapper if needed */
        .pqr-section { margin: 10pt 0; }
      `
        })
    }
}

export default PqrWordGenerator


