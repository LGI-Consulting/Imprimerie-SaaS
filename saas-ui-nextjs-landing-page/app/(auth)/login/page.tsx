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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { BackgroundGradient } from '@/components/gradients/background-gradient'
import { PageTransition } from '@/components/motion/page-transition'
import { Section } from '@/components/section'
import authService from '../lib/api-login'
import { TenantApi } from '../../../lib/api/tenant.api'
import { Tenant } from '../../../lib/api/types'

const LoginPage = () => {
  // État pour la connexion employé
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoadingTenants, setIsLoadingTenants] = useState(true)
  const [tenantError, setTenantError] = useState('')
  
  // État pour la connexion admin
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [isAdminLoading, setIsAdminLoading] = useState(false)
  
  // Gestion des erreurs
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    tenant: '',
    adminEmail: '',
    adminPassword: ''
  })

  const toast = useToast()
  const router = useRouter()

  // Récupérer les entreprises au chargement
  useEffect(() => {
    const recupererEntreprises = async () => {
      setIsLoadingTenants(true)
      setTenantError('')
      
      try {
        const resultat = await TenantApi.getAll()
        
        // Vérifier la structure de la réponse et extraire les données correctement
        if (resultat && typeof resultat === 'object') {
          if ('success' in resultat && resultat.success && 'data' in resultat) {
            // Format de réponse API: { success: true, data: [...] }
            setTenants(resultat.data)
          } else if (Array.isArray(resultat)) {
            // Format de réponse direct: [...tenants]
            setTenants(resultat)
          } else {
            console.error('Format de données inattendu:', resultat)
            setTenantError('Échec du chargement des entreprises - format de données inattendu')
          }
        } else {
          console.error('Réponse API invalide:', resultat)
          setTenantError('Échec du chargement des entreprises - réponse invalide')
        }
      } catch (error) {
        console.error('Échec de la récupération des entreprises:', error)
        setTenantError('Échec du chargement des entreprises. Veuillez réessayer plus tard.')
      } finally {
        setIsLoadingTenants(false)
      }
    }

    recupererEntreprises()
  }, [])

  // Valider le formulaire employé
  const validerFormulaireEmploye = () => {
    const nouvellesErreurs = { ...errors, email: '', password: '', tenant: '' }
    let estValide = true

    if (!email) {
      nouvellesErreurs.email = 'L\'email est requis'
      estValide = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nouvellesErreurs.email = 'Format d\'email invalide'
      estValide = false
    }

    if (!password) {
      nouvellesErreurs.password = 'Le mot de passe est requis'
      estValide = false
    }

    if (!tenantId) {
      nouvellesErreurs.tenant = 'Veuillez sélectionner une entreprise'
      estValide = false
    }

    setErrors(nouvellesErreurs)
    return estValide
  }

  // Valider le formulaire admin
  const validerFormulaireAdmin = () => {
    const nouvellesErreurs = { ...errors, adminEmail: '', adminPassword: '' }
    let estValide = true

    if (!adminEmail) {
      nouvellesErreurs.adminEmail = 'L\'email est requis'
      estValide = false
    } else if (!/\S+@\S+\.\S+/.test(adminEmail)) {
      nouvellesErreurs.adminEmail = 'Format d\'email invalide'
      estValide = false
    }

    if (!adminPassword) {
      nouvellesErreurs.adminPassword = 'Le mot de passe est requis'
      estValide = false
    }

    setErrors(nouvellesErreurs)
    return estValide
  }

  // Gérer la connexion employé
  const gererConnexionEmploye = async () => {
    if (!validerFormulaireEmploye()) return
    
    setIsLoading(true)
    
    try {
      const reponse = await authService.login({
        email,
        password,
        tenant_id: parseInt(tenantId)
      })
      
      if (reponse.success) {
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue ${reponse.data?.prenom} ${reponse.data?.nom}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Redirection selon le rôle
        router.push('/dashboard')
      } else {
        toast({
          title: 'Échec de connexion',
          description: reponse.message || 'Identifiants invalides',
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

  // Gérer la connexion admin
  const gererConnexionAdmin = async () => {
    if (!validerFormulaireAdmin()) return
    
    setIsAdminLoading(true)
    
    try {
      const reponse = await authService.sadminLogin({
        email: adminEmail,
        password: adminPassword
      })
      
      if (reponse.success) {
        toast({
          title: 'Connexion admin réussie',
          description: `Bienvenue ${reponse.data?.prenom} ${reponse.data?.nom}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        router.push('/admin/dashboard')
      } else {
        toast({
          title: 'Échec de connexion admin',
          description: reponse.message || 'Identifiants admin invalides',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion admin',
        description: error.message || 'Une erreur est survenue lors de la connexion admin',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsAdminLoading(false)
    }
  }

  // Gérer l'appui sur la touche Entrée
  const gererToucheAppuyee = (e: React.KeyboardEvent, type: 'employee' | 'admin') => {
    if (e.key === 'Enter') {
      type === 'employee' ? gererConnexionEmploye() : gererConnexionAdmin()
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
              <Heading size="lg" textAlign="center">Système de Gestion d'Impression</Heading>
              
              <Tabs variant="soft-rounded" colorScheme="blue" isFitted>
                <TabList mb={4}>
                  <Tab>Employé</Tab>
                  <Tab>Administrateur</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Connexion Employé */}
                  <TabPanel p={0}>
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
                          onKeyDown={(e) => gererToucheAppuyee(e, 'employee')}
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
                          onKeyDown={(e) => gererToucheAppuyee(e, 'employee')}
                        />
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                      </FormControl>
                      
                      <Button
                        colorScheme="blue"
                        mt={4}
                        width="100%"
                        onClick={gererConnexionEmploye}
                        isLoading={isLoading}
                        loadingText="Connexion en cours..."
                        isDisabled={isLoadingTenants}
                      >
                        Connexion Employé
                      </Button>
                    </VStack>
                  </TabPanel>
                  
                  {/* Connexion Admin */}
                  <TabPanel p={0}>
                    <VStack spacing={4}>
                      <FormControl isInvalid={!!errors.adminEmail}>
                        <FormLabel>Email Admin</FormLabel>
                        <Input
                          type="email"
                          placeholder="admin@entreprise.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          onKeyDown={(e) => gererToucheAppuyee(e, 'admin')}
                        />
                        <FormErrorMessage>{errors.adminEmail}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl isInvalid={!!errors.adminPassword}>
                        <FormLabel>Mot de passe</FormLabel>
                        <Input
                          type="password"
                          placeholder="Mot de passe admin"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          onKeyDown={(e) => gererToucheAppuyee(e, 'admin')}
                        />
                        <FormErrorMessage>{errors.adminPassword}</FormErrorMessage>
                      </FormControl>
                      
                      <Button
                        colorScheme="purple"
                        mt={4}
                        width="100%"
                        onClick={gererConnexionAdmin}
                        isLoading={isAdminLoading}
                        loadingText="Connexion en cours..."
                      >
                        Connexion Admin
                      </Button>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </Box>
        </PageTransition>
      </Center>
    </Section>
  )
}

export default LoginPage