"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Client {
  id?: string
  name: string
  phone?: string
  contact_person?: string
  email?: string
  address_line_1?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

interface ClientFormProps {
  initialData?: Client
  onSubmit: (data: Client) => void
  onCancel: () => void
  readOnly?: boolean
}

export function ClientForm({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false
}: ClientFormProps) {
  const createInitialFormData = (): Client => ({
    name: "",
    phone: "",
    contact_person: "",
    email: "",
    address_line_1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    ...initialData
  })

  const [formData, setFormData] = useState<Client>(createInitialFormData())
  const [originalFormData, setOriginalFormData] = useState<Client>(createInitialFormData())

  useEffect(() => {
    // Update both form data and original data when initialData changes
    const updatedData = createInitialFormData()
    setFormData(updatedData)
    setOriginalFormData(updatedData)
  }, [initialData])

  const handleInputChange = (field: keyof Client, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const revertToOriginal = () => {
    setFormData(JSON.parse(JSON.stringify(originalFormData)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleCancel = () => {
    revertToOriginal()
    onCancel()
  }

  return (
    <form className="grid gap-6 max-w-4xl mx-auto" onSubmit={handleSubmit}>
      <Card className="gap-0">
        <CardContent className="p-6 grid gap-4">
          {/* Basic Information */}
          <div className="grid gap-2">
            <Label htmlFor="name">Client Name *</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => handleInputChange('name', e.target.value)} 
              required 
              disabled={readOnly} 
            />
          </div>
          
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone || ""} 
                onChange={(e) => handleInputChange('phone', e.target.value)} 
                disabled={readOnly} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input 
                id="contact_person" 
                value={formData.contact_person || ""} 
                onChange={(e) => handleInputChange('contact_person', e.target.value)} 
                disabled={readOnly} 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={formData.email || ""} 
              onChange={(e) => handleInputChange('email', e.target.value)} 
              disabled={readOnly} 
            />
          </div>

          {/* Address Information */}
          <div className="grid gap-2">
            <Label htmlFor="address_line_1">Address Line 1</Label>
            <Textarea 
              id="address_line_1" 
              value={formData.address_line_1 || ""} 
              onChange={(e) => handleInputChange('address_line_1', e.target.value)} 
              rows={2}
              disabled={readOnly} 
            />
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={formData.city || ""} 
                onChange={(e) => handleInputChange('city', e.target.value)} 
                disabled={readOnly} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State/Province</Label>
              <Input 
                id="state" 
                value={formData.state || ""} 
                onChange={(e) => handleInputChange('state', e.target.value)} 
                disabled={readOnly} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input 
                id="postal_code" 
                value={formData.postal_code || ""} 
                onChange={(e) => handleInputChange('postal_code', e.target.value)} 
                disabled={readOnly} 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input 
              id="country" 
              value={formData.country || ""} 
              onChange={(e) => handleInputChange('country', e.target.value)} 
              disabled={readOnly} 
            />
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
                  {initialData ? 'Update Client' : 'Save Client'}
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}

export type { Client }
