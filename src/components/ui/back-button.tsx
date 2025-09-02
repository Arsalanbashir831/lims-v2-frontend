"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VariantProps } from "class-variance-authority"

interface BackButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label?: string | null
  href?: string
  showIcon?: boolean
  onBack?: () => void
  variant?: VariantProps<typeof buttonVariants>["variant"]
  size?: VariantProps<typeof buttonVariants>["size"]
}

export function BackButton({
  label = "Back",
  href,
  showIcon = true,
  className,
  variant = "outline",
  size,
  disabled,
  onBack,
  ...rest
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (disabled) return
    if (onBack) {
      onBack()
      return
    }
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={cn(className)}
      {...rest}
    >
      {showIcon && <ArrowLeft className="h-4 w-4" />}
      {label}
    </Button>
  )
}
