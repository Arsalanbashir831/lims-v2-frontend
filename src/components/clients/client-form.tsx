"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Client, CreateClientData } from "@/services/clients.service"

// Form data type that allows optional fields for form state
type ClientFormData = {
  client_name?: string
  phone?: string | null
  contact_person?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
}

interface ClientFormProps {
  initialData?: Client
  onSubmit: (data: CreateClientData) => void
  onCancel: () => void
  readOnly?: boolean
}

export function ClientForm({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false
}: ClientFormProps) {
  const createInitialFormData = (): ClientFormData => ({
    client_name: "",
    phone: "",
    contact_person: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    ...(initialData ? {
      client_name: initialData.client_name,
      phone: initialData.phone || "",
      contact_person: initialData.contact_person || "",
      email: initialData.email || "",
      address: initialData.address || "",
      city: initialData.city || "",
      state: initialData.state || "",
      postal_code: initialData.postal_code || "",
      country: initialData.country || "",
    } : {}),
  })

  const [formData, setFormData] = useState<ClientFormData>(createInitialFormData())
  const [originalFormData, setOriginalFormData] = useState<ClientFormData>(createInitialFormData())

  useEffect(() => {
    // Update both form data and original data when initialData changes
    const updatedData = createInitialFormData()
    setFormData(updatedData)
    setOriginalFormData(updatedData)
  }, [initialData])

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const revertToOriginal = () => {
    setFormData(JSON.parse(JSON.stringify(originalFormData)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Ensure client_name is not empty before submitting
    if (!formData.client_name?.trim()) {
      return
    }
    
    // Create a properly typed data object
    const submitData: CreateClientData = {
      client_name: formData.client_name.trim(),
      phone: formData.phone || null,
      contact_person: formData.contact_person || null,
      email: formData.email || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      postal_code: formData.postal_code || null,
      country: formData.country || null,
    }
    
    onSubmit(submitData)
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
            <Label htmlFor="client_name">Client Name *</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => handleInputChange('client_name', e.target.value)}
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
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleInputChange('address', e.target.value)}
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

