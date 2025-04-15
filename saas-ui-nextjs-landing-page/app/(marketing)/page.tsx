'use client'

import {
  Box,
  ButtonGroup,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Stack,
  Tag,
  Text,
  VStack,
  Wrap,
  useClipboard,
} from '@chakra-ui/react'
import { Br, Link } from '@saas-ui/react'
import type { Metadata, NextPage } from 'next'
import Image from 'next/image'
import {
  FiArrowRight,
  FiBarChart2,
  FiBox,
  FiCheck,
  FiCopy,
  FiCreditCard,
  FiDatabase,
  FiFlag,
  FiGlobe,
  FiGrid,
  FiLayers,
  FiLock,
  FiMessageSquare,
  FiPercent,
  FiPrinter,
  FiSearch,
  FiShoppingCart,
  FiSliders,
  FiSmile,
  FiTerminal,
  FiThumbsUp,
  FiToggleLeft,
  FiTrendingUp,
  FiUserPlus,
} from 'react-icons/fi'

import * as React from 'react'

import { ButtonLink } from '#components/button-link/button-link'
import { Features } from '#components/features'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { Hero } from '#components/hero'
import { Highlights, HighlightsItem } from '#components/highlights'
import { FallInPlace } from '#components/motion/fall-in-place'
import { Em } from '#components/typography'

export const meta: Metadata = {
  title: 'LGI Printing Management System',
  description: 'Complete printing order management solution for businesses',
}

const Home: NextPage = () => {
  return (
    <Box>
      <HeroSection />

      <HighlightsSection />

      <FeaturesSection />
    </Box>
  )
}

const HeroSection: React.FC = () => {
  return (
    <Box position="relative" overflow="hidden">
      <BackgroundGradient height="100%" zIndex="-1" />
      <Container maxW="container.xl" pt={{ base: 20, lg: 32 }} pb="40">
        <Stack direction={{ base: 'column', lg: 'row' }} alignItems="center">
          <Hero
            id="home"
            justifyContent="flex-start"
            px="0"
            title={
              <FallInPlace>
                Gestion des impressions <Br /> simplifiée
              </FallInPlace>
            }
            description={
              <FallInPlace delay={0.4} fontWeight="medium">
                LGI Consulting propose une <Em>solution complète</Em>
                <Br /> pour gérer votre activité d'impression depuis <Br /> la
                commande jusqu'à la livraison avec paiements intégrés.
              </FallInPlace>
            }
          >
            <FallInPlace delay={0.8}>
              <HStack pt="4" pb="12" spacing="8">
                <Image
                  src="/static/logo/LGI-logo.ico"
                  width={64}
                  height={64}
                  alt="LGI Consulting Logo"
                />
              </HStack>

              <ButtonGroup spacing={4} alignItems="center">
                <ButtonLink colorScheme="primary" size="lg" href="/login">
                  Démarrer
                </ButtonLink>
              </ButtonGroup>
            </FallInPlace>
          </Hero>
          <Box
            height="600px"
            position="absolute"
            display={{ base: 'none', lg: 'block' }}
            left={{ lg: '60%', xl: '55%' }}
            width="80vw"
            maxW="1100px"
            margin="0 auto"
          >
            <FallInPlace delay={1}>
              <Box overflow="hidden" height="100%">
                <Image
                  src="/static/screenshots/dashboard.png"
                  width={1200}
                  height={762}
                  alt="Screenshot of the LGI Printing Management Dashboard"
                  quality="75"
                  priority
                />
              </Box>
            </FallInPlace>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

const HighlightsSection = () => {
  return (
    <Box width="100%" display="flex" justifyContent="center" py={10}>
      <Highlights maxW="container.lg" mx="auto">
        <HighlightsItem
          colSpan={[1, null, 3]} // Make it take full width
          title="Gestion complète des commandes"
        >
          <Text color="muted" fontSize="xl" textAlign="center">
            Du premier contact client jusqu'à la livraison, notre solution gère{' '}
            <Em>tout le cycle de vie</Em> des commandes d'impression. Suivez
            chaque étape, de l'enregistrement initial au paiement, en passant
            par la production et la finition.
          </Text>
        </HighlightsItem>

        <HighlightsItem
          colSpan={[1, null, 3]} // Make it take full width
          title="Modules spécialisés pour votre entreprise d'impression"
        >
          <Text color="muted" fontSize="lg" textAlign="center">
            Notre solution inclut tous les modules essentiels pour gérer
            efficacement une entreprise d'impression moderne.
          </Text>

          <Wrap mt="8" justify="center" spacing="3">
            {[
              'commandes',
              'paiements',
              'impression',
              'clients',
              'matériaux',
              'promotions',
              'statistiques',
              'factures',
              'rôles utilisateurs',
              'bâches',
              'autocollants',
              'stocks',
              'rapports',
              'sauvegardes',
            ].map((value) => (
              <Tag
                key={value}
                variant="subtle"
                colorScheme="primary"
                rounded="full"
                px="3"
                py="1"
              >
                {value}
              </Tag>
            ))}
          </Wrap>
        </HighlightsItem>

        <HighlightsItem
          colSpan={[1, null, 3]} // Make it take full width
          title="Gestion avancée des stocks"
        >
          <Text color="muted" fontSize="xl" textAlign="center">
            Notre solution offre un <Em>suivi précis</Em> des matériaux et
            consommables. Recevez des alertes automatiques pour les stocks bas
            et gérez efficacement vos approvisionnements pour éviter les
            ruptures.
          </Text>
        </HighlightsItem>
      </Highlights>
    </Box>
  )
}

const FeaturesSection = () => {
  return (
    <Features
      id="features"
      title={
        <Heading
          lineHeight="short"
          fontSize={['2xl', null, '4xl']}
          textAlign="center"
          as="p"
        >
          Bien plus qu'un simple
          <Br /> logiciel d'impression.
        </Heading>
      }
      description={
        <>
          Notre système complet couvre tous les aspects de votre activité
          d'impression.
          <Br />
          De la prise de commande à la facturation, en passant par la production
          et l'analyse.
        </>
      }
      align="center"
      columns={[1, 2, 3]}
      iconSize={4}
      features={[
        {
          title: 'Interface Accueil',
          icon: FiShoppingCart,
          description:
            'Enregistrement intelligent des commandes avec calcul automatique des prix selon les dimensions, matériel et finitions.',
          variant: 'inline',
        },
        {
          title: 'Interface Caisse',
          icon: FiCreditCard,
          description:
            'Gestion des paiements multi-méthodes (espèces, Mixx, Flooz), fractionnements et génération automatique des factures.',
          variant: 'inline',
        },
        {
          title: 'Interface Graphistes',
          icon: FiPrinter,
          description:
            "File d'attente des travaux, accès aux fichiers clients et suivi de la consommation matérielle.",
          variant: 'inline',
        },
        {
          title: 'Promotions',
          icon: FiPercent,
          description:
            'Créez des promotions temporelles, quantitatives ou pour clients fidèles avec suivi automatique.',
          variant: 'inline',
        },
        {
          title: 'Tableau de bord',
          icon: FiBarChart2,
          description:
            "Visualisez vos données clés et statistiques avec une vue personnalisée selon votre rôle dans l'entreprise.",
          variant: 'inline',
        },
        {
          title: 'Gestion utilisateurs',
          icon: FiUserPlus,
          description:
            'Contrôle précis des rôles (Admin, Accueil, Caissier, Graphiste) et des permissions granulaires.',
          variant: 'inline',
        },
        {
          title: 'Gestion matériaux',
          icon: FiLayers,
          description:
            "Suivi complet du stock par type, largeur et fournisseur avec alertes de rupture et recommandation d'achat.",
          variant: 'inline',
        },
        {
          title: 'Notifications',
          icon: FiMessageSquare,
          description:
            'Alertes en temps réel par rôle utilisateur concernant les commandes, stocks et événements techniques.',
          variant: 'inline',
        },
        {
          title: 'Base de données',
          icon: FiDatabase,
          description: (
            <>
              Sauvegardes automatiques quotidiennes et toutes les 6 heures avec
              chiffrement et restauration rapide &lt; 4h.
            </>
          ),
          variant: 'inline',
        },
      ]}
    />
  )
}

export default Home
