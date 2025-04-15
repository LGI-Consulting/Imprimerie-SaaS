'use client'

import { Box, SkipNavContent, SkipNavLink } from '@chakra-ui/react'

import { ReactNode } from 'react'

import {
  AnnouncementBanner,
  AnnouncementBannerProps,
} from '../announcement-banner'

interface LayoutProps {
  children: ReactNode
  announcementProps?: AnnouncementBannerProps
}

export const MarketingLayout: React.FC<LayoutProps> = (props) => {
  const { children, announcementProps } = props
  return (
    <Box>
      <SkipNavLink>Skip to content</SkipNavLink>
      {announcementProps ? <AnnouncementBanner {...announcementProps} /> : null}
      <Box as="main">
        <SkipNavContent />
        {children}
      </Box>
    </Box>
  )
}
