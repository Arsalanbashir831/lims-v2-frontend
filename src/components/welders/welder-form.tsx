/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, QrCode } from "lucide-react"
import Image from "next/image"
import { ROUTES } from "@/constants/routes"
import QRCode from "qrcode"
import { Welder } from "@/lib/schemas/welder"
import { toast } from "sonner"

// Frontend form interface for backward compatibility
interface WelderFormData {
  id?: string
  operatorName: string
  operatorId: string
  iqamaPassport: string
  operatorImage: File | string | null
}

interface WelderFormProps {
  initialData?: Welder
  onSubmit: (data: {
    operator_name: string
    operator_id: string
    iqama: string
    profile_image?: File
  }) => void
  onCancel: () => void
  readOnly?: boolean
}

export function WelderForm({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false
}: WelderFormProps) {
  const createInitialFormData = (): WelderFormData => ({
    operatorName: initialData?.operator_name || "",
    operatorId: initialData?.operator_id || "",
    iqamaPassport: initialData?.iqama || "",
    operatorImage: initialData?.profile_image_url || null,
    id: initialData?.id,
  })

  const [formData, setFormData] = useState<WelderFormData>(createInitialFormData())
  const [originalFormData, setOriginalFormData] = useState<WelderFormData>(createInitialFormData())
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    // Update both form data and original data when initialData changes
    const updatedData = createInitialFormData()
    setFormData(updatedData)
    setOriginalFormData(updatedData)
  }, [initialData])

  useEffect(() => {
    // Generate QR code for existing forms (when we have an ID)
    if (formData.id && !readOnly) {
      const generateQR = async () => {
        try {
          const frontendBase = typeof window !== "undefined" ? window.location.origin : ""
          const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_PREVIEW(formData.id!)}`
          const dataUrl = await QRCode.toDataURL(publicUrl, { margin: 1, width: 120 })
          setQrSrc(dataUrl)
        } catch (error) {
          console.error("Failed to generate QR code:", error)
          setQrSrc(null)
        }
      }
      generateQR()
    }
  }, [formData.id, readOnly])

  const handleInputChange = (field: keyof WelderFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (PNG, JPG, JPEG, or WebP)')
        return
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert('Image file size must be less than 5MB')
        return
      }
      
      // Clean up previous object URL
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
      
      // Create new object URL for preview
      const newPreviewUrl = URL.createObjectURL(file)
      setImagePreviewUrl(newPreviewUrl)
      
      // Store the File object directly for FormData submission
      handleInputChange('operatorImage', file)
    }
  }

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const revertToOriginal = () => {
    setFormData(JSON.parse(JSON.stringify(originalFormData)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Map frontend form data to API structure
    const apiData = {
      operator_name: formData.operatorName,
      operator_id: formData.operatorId,
      iqama: formData.iqamaPassport,
      profile_image: formData.operatorImage instanceof File ? formData.operatorImage : undefined,
    }
    
    onSubmit(apiData)
  }

  const handleCancel = () => {
    revertToOriginal()
    onCancel()
  }

  return (
    <form className="grid gap-6 max-w-xl mx-auto" onSubmit={handleSubmit}>
      <Card className="gap-0">
        <CardContent className="p-6 grid grid-cols-2 gap-4">
        <div className="grid gap-2">
           <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-48 h-48 border-2 overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-lg">
                {formData.operatorImage ? (
                  <Image
                    src={typeof formData.operatorImage === 'string' ? process.env.NEXT_PUBLIC_BACKEND_URL + formData.operatorImage : (imagePreviewUrl || URL.createObjectURL(formData.operatorImage))}
                    alt="Welder"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Photo</span>
                  </div>
                )}
              </div>
              {!readOnly && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="imageUpload" className="cursor-pointer text-blue-600 hover:text-blue-500 text-sm">
                    <Upload className="inline w-4 h-4 mr-1" />
                    Upload Photo
                  </Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </div>
          </div>          
          <div className="grid gap-2">
          <div className="grid gap-2">
            <Label htmlFor="operatorName">Operator Name</Label>
            <Input 
              id="operatorName" 
              value={formData.operatorName} 
              onChange={(e) => handleInputChange('operatorName', e.target.value)} 
              required 
              disabled={readOnly} 
            />
          </div>
            <div className="grid gap-2">
              <Label htmlFor="operatorId">Operator ID / Symbol</Label>
              <Input 
                id="operatorId" 
                value={formData.operatorId} 
                onChange={(e) => handleInputChange('operatorId', e.target.value)} 
                disabled={readOnly} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="iqamaPassport">Iqama / Passport</Label>
              <Input 
                id="iqamaPassport" 
                value={formData.iqamaPassport} 
                onChange={(e) => handleInputChange('iqamaPassport', e.target.value)} 
                disabled={readOnly} 
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="">
        {!readOnly && (
        <div className="sticky bottom-0 bg-background/80 dark:bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 w-full">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="px-6">
              {initialData ? 'Update Welder' : 'Save Welder'}
            </Button>
          </div>
        </div>
      )}
        </CardFooter>
      </Card>
      
      
    </form>
  )
}

// Export Welder type for backward compatibility
export type { Welder } from "@/lib/schemas/welder"
