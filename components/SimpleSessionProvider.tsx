"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SimpleUser {
  id: string
  email: string
  name: string
  username: string
  role: string
  reputationScore: number
}

interface SimpleSessionContextType {
  user: SimpleUser | null
  loading: boolean
  error: string | null
  refreshSession: () => Promise<void>
}

const SimpleSessionContext = createContext<SimpleSessionContextType>({
  user: null,
  loading: true,
  error: null,
  refreshSession: async () => {}
})

export function SimpleSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshSession = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/auth/session")
      const data = await response.json()
      
      if (response.ok) {
        setUser(data.user)
      } else {
        setUser(null)
        if (data.error) {
          setError(data.error)
        }
      }
    } catch (err) {
      setUser(null)
      setError("获取session失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSession()
  }, [])

  return (
    <SimpleSessionContext.Provider value={{ user, loading, error, refreshSession }}>
      {children}
    </SimpleSessionContext.Provider>
  )
}

export function useSimpleSession() {
  const context = useContext(SimpleSessionContext)
  return context
}