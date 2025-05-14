"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  close: () => void
  state: "expanded" | "collapsed"
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
  state: "collapsed"
})

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  // Carregar estado do cookie ao inicializar
  useEffect(() => {
    const cookies = document.cookie.split(';')
    const sidebarCookie = cookies.find(cookie => cookie.trim().startsWith(`${SIDEBAR_COOKIE_NAME}=`))
    
    if (sidebarCookie) {
      const value = sidebarCookie.split('=')[1]
      setIsOpen(value === 'true')
    }
  }, [])

  const toggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    
    // Salvar estado no cookie
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }
  
  const close = () => {
    setIsOpen(false)
    document.cookie = `${SIDEBAR_COOKIE_NAME}=false; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }

  const state = isOpen ? "expanded" : "collapsed"

  return <SidebarContext.Provider value={{ isOpen, toggle, close, state }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)
