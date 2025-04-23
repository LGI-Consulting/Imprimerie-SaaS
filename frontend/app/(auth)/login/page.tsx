'use client'

import { useState, useEffect } from 'react'
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
  Select,
  Box,
  Spinner,
  Alert,
  AlertIcon,
  Link,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { BackgroundGradient } from '@/components/gradients/background-gradient'
import { PageTransition } from '@/components/motion/page-transition'
import { Section } from '@/components/section'
import authService from '../lib/api-login'
import { TenantApi } from '../../../lib/api/tenant.api'
import { Tenant } from '../../../lib/api/types'

const EmployeeLoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoadingTenants, setIsLoadingTenants] = useState(true)
  const [tenantError, setTenantError] = useState('')
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    tenant: ''
  })

  const toast = useToast()
  const router = useRouter()

  // Récupérer les entreprises au chargement
  useEffect(() => {
    const fetchTenants = async () => {
      setIsLoadingTenants(true)
      setTenantError('')
      
      try {
        const response = await TenantApi.getAll()
        
        // Traitement plus robuste des réponses
        if (response) {
          if (Array.isArray(response)) {
            // Cas où l'API retourne directement un tableau
            setTenants(response)
          } else if (response.data && Array.isArray(response.data)) {
            // Cas où l'API retourne { data: [...] }
            setTenants(response.data)
          } else if (response.success && Array.isArray(response.data)) {
            // Cas où l'API retourne { success: true, data: [...] }
            setTenants(response.data)
          } else {
            console.error('Format de données inattendu:', response)
            setTenantError('Format de données inattendu lors du chargement des entreprises')
          }
        } else {
          setTenantError('Aucune donnée reçue du serveur')
        }
      } catch (error) {
        console.error('Échec de la récupération des entreprises:', error)
        setTenantError('Impossible de charger la liste des entreprises. Veuillez réessayer.')
      } finally {
        setIsLoadingTenants(false)
      }
    }

    fetchTenants()
  }, [])

  // Valider le formulaire employé
  const validateForm = () => {
    const newErrors = { ...errors, email: '', password: '', tenant: '' }
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

    if (!tenantId) {
      newErrors.tenant = 'Veuillez sélectionner une entreprise'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Rediriger l'utilisateur en fonction de son rôle
  const redirectBasedOnRole = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        router.push('/dashboard')
        break
      case 'reception':
        router.push('/dashboard/reception')
        break
      case 'cashier':
        router.push('/dashboard/cashier')
        break
      case 'designer':
        router.push('/dashboard/designer')
        break
      default:
        router.push('/dashboard')
    }
  }

  // Gérer la connexion employé
  const handleLogin = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const response = await authService.login({
        email,
        password,
        tenant_id: parseInt(tenantId)
      })
      
      if (response.success && response.data) {
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue ${response.data.prenom} ${response.data.nom}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Rediriger en fonction du rôle
        if (response.data.role) {
          redirectBasedOnRole(response.data.role)
        } else {
          // Si pas de rôle spécifié, utiliser le dashboard par défaut
          router.push('/dashboard')
        }
      } else {
        toast({
          title: 'Échec de connexion',
          description: response.message || 'Identifiants invalides',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Une erreur est survenue lors de la connexion',
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
              <Heading size="lg" textAlign="center">Connexion Employé</Heading>
              <Text textAlign="center" color="gray.600">
                Système de Gestion d'Impression
              </Text>
              
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.tenant}>
                  <FormLabel>Entreprise</FormLabel>
                  {isLoadingTenants ? (
                    <Center py={2}>
                      <Spinner size="sm" mr={2} />
                      <Text fontSize="sm">Chargement des entreprises...</Text>
                    </Center>
                  ) : tenantError ? (
                    <Alert status="error" size="sm" borderRadius="md">
                      <AlertIcon />
                      {tenantError}
                    </Alert>
                  ) : (
                    <Select
                      placeholder="Sélectionnez votre entreprise"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      isDisabled={isLoadingTenants}
                    >
                      {tenants.map((tenant) => (
                        <option key={tenant.tenant_id} value={tenant.tenant_id}>
                          {tenant.nom}
                        </option>
                      ))}
                    </Select>
                  )}
                  <FormErrorMessage>{errors.tenant}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
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
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
                
                <Button
                  colorScheme="blue"
                  mt={4}
                  width="100%"
                  onClick={handleLogin}
                  isLoading={isLoading}
                  loadingText="Connexion en cours..."
                  isDisabled={isLoadingTenants}
                >
                  Se connecter
                </Button>
                
              </VStack>
            </VStack>
          </Box>
        </PageTransition>
      </Center>
    </Section>
  )
}

export default EmployeeLoginPage