'use client'

import * as React from 'react'
import { useColorMode } from '@chakra-ui/react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorMode } = useColorMode()

  React.useEffect(() => {
    const root = document.documentElement
    if (colorMode === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [colorMode])

  return <>{children}</>
}
