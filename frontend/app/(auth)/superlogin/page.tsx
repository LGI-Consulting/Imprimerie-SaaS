'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Center, 
  Button, 
  Input, 
  VStack, 
  useToast, 
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Text,
  Box,
  Link,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { BackgroundGradient } from '@/components/gradients/background-gradient'
import { PageTransition } from '@/components/motion/page-transition'
import { Section } from '@/components/section'
import authService from '../lib/api-login'

const AdminLoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  })

  const toast = useToast()
  const router = useRouter()

  // Valider le formulaire admin
  const validateForm = () => {
    const newErrors = { ...errors, email: '', password: '' }
    let isValid = true

    if (!email) {
      newErrors.email = 'L\'email est requis'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format d\'email invalide'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Gérer la connexion admin
  const handleLogin = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const response = await authService.sadminLogin({
        email,
        password
      })
      
      if (response.success) {
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue ${response.data?.prenom} ${response.data?.nom}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        router.push('/superadmin')
      } else {
        toast({
          title: 'Échec de connexion',
          description: response.message || 'Identifiants admin invalides',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Une erreur est survenue lors de la connexion admin',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer l'appui sur la touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <Section height="100vh" innerWidth="container.sm">
      <BackgroundGradient zIndex="-1" />
      <Center height="100%">
        <PageTransition width="100%">
          <Box 
            bg="whiteAlpha.900" 
            p={8} 
            borderRadius="lg" 
            boxShadow="xl" 
            width="100%"
            maxWidth="500px"
          >
            <VStack spacing={6} align="stretch">
              <Heading size="lg" textAlign="center">Connexion Administrateur</Heading>
              <Text textAlign="center" color="gray.600">
                Système de Gestion d'Impression
              </Text>
              
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email Admin</FormLabel>
                  <Input
                    type="email"
                    placeholder="admin@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Mot de passe</FormLabel>
                  <Input
                    type="password"
                    placeholder="Mot de passe admin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
                
                <Button
                  colorScheme="purple"
                  mt={4}
                  width="100%"
                  onClick={handleLogin}
                  isLoading={isLoading}
                  loadingText="Connexion en cours..."
                >
                  Se connecter
                </Button>
                
                <Text textAlign="center" mt={4}>
                  Vous êtes employé ? {' '}
                  <Link as={NextLink} href="/login" color="blue.500">
                    Connectez-vous ici
                  </Link>
                </Text>
              </VStack>
            </VStack>
          </Box>
        </PageTransition>
      </Center>
    </Section>
  )
}

export default AdminLoginPage