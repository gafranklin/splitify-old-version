"use client"

import { useState, useEffect } from "react"

/**
 * Breakpoint sizes in pixels
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
}

type Breakpoint = keyof typeof breakpoints

/**
 * Hook to detect mobile devices and responsive breakpoints
 * @returns Object with various mobile detection properties
 */
export function useMobile() {
  const [windowWidth, setWindowWidth] = useState<number>(0)
  const [isClient, setIsClient] = useState(false)

  // Initialize state on client-side only
  useEffect(() => {
    setIsClient(true)
    setWindowWidth(window.innerWidth)
  }, [])

  // Update width on resize
  useEffect(() => {
    if (!isClient) return

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isClient])

  // Detect if user agent is mobile (used as fallback)
  const isMobileUserAgent = isClient
    ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    : false

  // Detect touch support
  const isTouchDevice = isClient
    ? "ontouchstart" in window || navigator.maxTouchPoints > 0
    : false

  /**
   * Check if current width is below a specific breakpoint
   * @param breakpoint The breakpoint to check against
   * @returns boolean
   */
  const isBelowBreakpoint = (breakpoint: Breakpoint): boolean => {
    return isClient ? windowWidth < breakpoints[breakpoint] : false
  }

  /**
   * Check if current width is above a specific breakpoint
   * @param breakpoint The breakpoint to check against
   * @returns boolean
   */
  const isAboveBreakpoint = (breakpoint: Breakpoint): boolean => {
    return isClient ? windowWidth >= breakpoints[breakpoint] : false
  }

  // Common breakpoint checks
  const isMobile = isBelowBreakpoint("md")
  const isTablet = isAboveBreakpoint("md") && isBelowBreakpoint("lg")
  const isDesktop = isAboveBreakpoint("lg")

  // Orientation detection
  const isPortrait = isClient
    ? window.matchMedia("(orientation: portrait)").matches
    : false
  const isLandscape = isClient
    ? window.matchMedia("(orientation: landscape)").matches
    : false

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    isTouchDevice,
    isMobileUserAgent,
    isBelowBreakpoint,
    isAboveBreakpoint
  }
}

/**
 * Utility function to get a class name based on breakpoint
 * @param defaultClass Default class for all sizes
 * @param breakpointClasses Classes for specific breakpoints
 * @returns The appropriate class based on current breakpoint
 */
export function getResponsiveClass(
  defaultClass: string = "",
  breakpointClasses: Partial<Record<Breakpoint, string>> = {}
): string {
  // This is a client-side only helper
  if (typeof window === "undefined") {
    return defaultClass
  }

  const windowWidth = window.innerWidth

  // Find the largest breakpoint that's smaller than the window width
  const activeBreakpoint = Object.entries(breakpoints)
    .sort(
      (a, b) =>
        breakpoints[b[0] as Breakpoint] - breakpoints[a[0] as Breakpoint]
    )
    .find(([_, value]) => windowWidth >= value)?.[0] as Breakpoint | undefined

  // Return the class for the active breakpoint, or default if none
  return activeBreakpoint && breakpointClasses[activeBreakpoint]
    ? breakpointClasses[activeBreakpoint]
    : defaultClass
}
