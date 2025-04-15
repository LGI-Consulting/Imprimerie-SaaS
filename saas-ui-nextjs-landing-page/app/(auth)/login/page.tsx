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
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  Flex
} from '@chakra-ui/react'
import { BackgroundGradient } from 'components/gradients/background-gradient'
import { PageTransition } from 'components/motion/page-transition'
import { Section } from 'components/section'
import { NextPage } from 'next'
import authService from '../lib/api-login' // Import the auth service

interface Tenant {
  tenant_id: number;
  nom: string;
}

const Login: NextPage = () => {
  // Employee login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    tenant?: string;
    adminEmail?: string;
    adminPassword?: string;
  }>({})
  
  // Super admin login state
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [isAdminLoading, setIsAdminLoading] = useState(false)
  
  const toast = useToast()
  const router = useRouter()

  // This would typically come from an API call to fetch available tenants
  useEffect(() => {
    // In a real implementation, you would fetch tenants from an API
    // For example: const fetchTenants = async () => { const result = await api.getTenants(); setTenants(result.data); };
    
    // Mock data for demonstration
    setTenants([
      { tenant_id: 1, nom: 'Entreprise A' },
      { tenant_id: 2, nom: 'Entreprise B' },
      { tenant_id: 3, nom: 'Entreprise C' },
    ])
    
    // Check if we have a previously selected tenant
    const savedTenantId = localStorage.getItem('lastTenantId')
    if (savedTenantId) {
      setTenantId(savedTenantId)
    }
  }, [])

  const validateEmployeeForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      tenant?: string;
    } = {}
    let isValid = true

    if (!email) {
      newErrors.email = 'Email requis'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Mot de passe requis'
      isValid = false
    }

    if (!tenantId) {
      newErrors.tenant = 'Veuillez sélectionner une entreprise'
      isValid = false
    }

    setErrors(prev => ({ ...prev, ...newErrors }))
    return isValid
  }

  const validateAdminForm = () => {
    const newErrors: {
      adminEmail?: string;
      adminPassword?: string;
    } = {}
    let isValid = true

    if (!adminEmail) {
      newErrors.adminEmail = 'Email requis'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(adminEmail)) {
      newErrors.adminEmail = 'Email invalide'
      isValid = false
    }

    if (!adminPassword) {
      newErrors.adminPassword = 'Mot de passe requis'
      isValid = false
    }

    setErrors(prev => ({ ...prev, ...newErrors }))
    return isValid
  }

  const handleEmployeeLogin = async () => {
    if (!validateEmployeeForm()) return
    
    setIsLoading(true)
    
    try {
      const response = await authService.login({
        email,
        password,
        tenant_id: parseInt(tenantId)
      })
      
      if (response.success) {
        // Save last used tenant ID for convenience
        localStorage.setItem('lastTenantId', tenantId)
        
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue ${response.data?.nom} ${response.data?.prenom}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        toast({
          title: 'Échec de la connexion',
          description: response.message,
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

  const handleAdminLogin = async () => {
    if (!validateAdminForm()) return
    
    setIsAdminLoading(true)
    
    try {
      const response = await authService.sadminLogin({
        email: adminEmail,
        password: adminPassword
      })
      
      if (response.success) {
        toast({
          title: 'Connexion Super Admin réussie',
          description: `Bienvenue ${response.data?.nom} ${response.data?.prenom}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard')
      } else {
        toast({
          title: 'Échec de la connexion',
          description: response.message,
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
      setIsAdminLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, loginType: 'employee' | 'admin') => {
    if (e.key === 'Enter') {
      if (loginType === 'employee') {
        handleEmployeeLogin()
      } else {
        handleAdminLogin()
      }
    }
  }

  return (
    <Section height="calc(100vh - 200px)" innerWidth="container.sm">
      <BackgroundGradient zIndex="-1" />
      <Center height="100%" pt="20">
        <PageTransition width="100%">
          <Box bg="whiteAlpha.100" p={8} borderRadius="lg" backdropFilter="blur(10px)" boxShadow="xl" width="100%">
            <VStack spacing={6} width="100%" align="start">
              <Heading size="lg">Connexion</Heading>
              
              <Tabs width="100%" variant="soft-rounded" colorScheme="blue" isFitted>
                <TabList mb="1em">
                  <Tab>Employé</Tab>
                  <Tab>Super Admin</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Employé Login Panel */}
                  <TabPanel p={0}>
                    <VStack spacing={5} align="stretch">
                      <Text>Connectez-vous à votre espace entreprise</Text>
                      <Divider />
                      
                      <FormControl isInvalid={!!errors.tenant}>
                        <FormLabel>Entreprise</FormLabel>
                        <Select 
                          placeholder="Sélectionnez votre entreprise" 
                          value={tenantId} 
                          onChange={(e) => setTenantId(e.target.value)}
                        >
                          {tenants.map((tenant) => (
                            <option key={tenant.tenant_id} value={tenant.tenant_id}>
                              {tenant.nom}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.tenant}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl isInvalid={!!errors.email}>
                        <FormLabel>Email</FormLabel>
                        <Input
                          placeholder="votre@email.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'employee')}
                        />
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl isInvalid={!!errors.password}>
                        <FormLabel>Mot de passe</FormLabel>
                        <Input
                          placeholder="Mot de passe"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'employee')}
                        />
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                      </FormControl>
                      
                      <Button 
                        colorScheme="blue" 
                        width="100%" 
                        onClick={handleEmployeeLogin}
                        isLoading={isLoading}
                        loadingText="Connexion..."
                        mt={2}
                      >
                        Se connecter
                      </Button>
                    </VStack>
                  </TabPanel>
                  
                  {/* Super Admin Login Panel */}
                  <TabPanel p={0}>
                    <VStack spacing={5} align="stretch">
                      <Text>Espace réservé aux administrateurs système</Text>
                      <Divider />
                      
                      <FormControl isInvalid={!!errors.adminEmail}>
                        <FormLabel>Email Admin</FormLabel>
                        <Input
                          placeholder="admin@example.com"
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'admin')}
                        />
                        <FormErrorMessage>{errors.adminEmail}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl isInvalid={!!errors.adminPassword}>
                        <FormLabel>Mot de passe</FormLabel>
                        <Input
                          placeholder="Mot de passe"
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'admin')}
                        />
                        <FormErrorMessage>{errors.adminPassword}</FormErrorMessage>
                      </FormControl>
                      
                      <Button 
                        colorScheme="purple" 
                        width="100%" 
                        onClick={handleAdminLogin}
                        isLoading={isAdminLoading}
                        loadingText="Connexion..."
                        mt={2}
                      >
                        Connexion Super Admin
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

export default Login