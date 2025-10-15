declare module "qrcode" {
  interface QRCodeOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    type?: 'image/png' | 'image/jpeg' | 'image/webp'
    quality?: number
    margin?: number
    scale?: number
    width?: number
    color?: {
      dark?: string
      light?: string
    }
  }

  interface QRCode {
    toCanvas(
      canvas: HTMLCanvasElement,
      text: string,
      options?: QRCodeOptions,
      callback?: (error: Error | null) => void
    ): Promise<void>
    
    toDataURL(
      text: string,
      options?: QRCodeOptions,
      callback?: (error: Error | null, url: string) => void
    ): Promise<string>
    
    toString(
      text: string,
      options?: QRCodeOptions,
      callback?: (error: Error | null, string: string) => void
    ): Promise<string>
  }

  const QRCode: QRCode
  export default QRCode
}
