import { useEffect, useState } from 'react'

/**
 * Hook to ensure a component only renders on the client side
 * This helps prevent hydration mismatches
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to generate stable IDs that work on both server and client
 */
export function useStableId(prefix: string = 'id') {
  const [id, setId] = useState<string>('')
  const isClient = useClientOnly()

  useEffect(() => {
    if (isClient) {
      setId(`${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    }
  }, [isClient, prefix])

  return id
}

/**
 * Hook to get current date in a format that's consistent between server and client
 */
export function useCurrentDate() {
  const [currentDate, setCurrentDate] = useState<string>('')
  const isClient = useClientOnly()

  useEffect(() => {
    if (isClient) {
      setCurrentDate(new Date().toISOString().split('T')[0])
    }
  }, [isClient])

  return currentDate
}
