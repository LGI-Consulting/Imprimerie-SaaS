import { extendTheme } from '@chakra-ui/react'
import '@fontsource-variable/inter'
import { theme as baseTheme } from '@saas-ui/react'

import components from './components'
import { fontSizes } from './foundations/typography'

export const theme = extendTheme(
  {
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: false,
    },
    styles: {
      global: (props: any) => ({
        body: {
          color: props.colorMode === 'light' ? 'gray.800' : 'white',
          bg: props.colorMode === 'light' ? 'white' : 'gray.900',
          fontSize: 'lg',
        },
        '.chakra-ui-light &': {
          '.text-muted-foreground': {
            color: 'gray.600',
          },
          '.bg-background': {
            backgroundColor: 'white',
          },
          '.border-b': {
            borderColor: 'gray.200',
          },
          '.card': {
            backgroundColor: 'gray.50',
            boxShadow: 'md',
          },
          '.active-tab': {
            backgroundColor: 'gray.200',
            fontWeight: 'bold',
          },
          '.bg-primary\\/10': {
            backgroundColor: 'rgba(59, 130, 246, 0.1)', // Tailwind blue-500 10% opacity
          },
          '.text-primary': {
            color: 'rgb(59 130 246)', // Tailwind blue-500
          },
          '.text-foreground': {
            color: 'gray.800',
          },
        },
        '.chakra-ui-dark &': {
          '.text-muted-foreground': {
            color: 'gray.400',
          },
          '.bg-background': {
            backgroundColor: 'gray.900',
          },
          '.border-b': {
            borderColor: 'gray.700',
          },
          '.card': {
            backgroundColor: 'gray.800',
            boxShadow: 'lg',
          },
          '.active-tab': {
            backgroundColor: 'gray.700',
            fontWeight: 'bold',
          },
          '.bg-primary\\/10': {
            backgroundColor: 'rgba(59, 130, 246, 0.3)', // brighter blue with more opacity
          },
          '.text-primary': {
            color: 'rgb(147 197 253)', // Tailwind blue-300
          },
          '.text-foreground': {
            color: 'gray.100',
          },
        },
      }),
    },
    fonts: {
      heading: 'Inter Variable, Inter, sans-serif',
      body: 'Inter Variable, Inter, sans-serif',
    },
    fontSizes,
    components,
  },
  baseTheme,
)
