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
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { BackgroundGradient } from 'components/gradients/background-gradient'
import { PageTransition } from 'components/motion/page-transition'
import { Section } from 'components/section'
import authService from '../lib/api-login'
import { TenantApi } from '../../../lib/api/tenant.api'
import { Tenant } from '../../../lib/api/types'

// Define a response type for handling multiple possible formats
interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

const LoginPage = () => {
  // State for employee login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoadingTenants, setIsLoadingTenants] = useState(true)
  const [tenantError, setTenantError] = useState('')
  
  // State for admin login
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [isAdminLoading, setIsAdminLoading] = useState(false)
  
  // Error handling
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    tenant: '',
    adminEmail: '',
    adminPassword: ''
  })

  const toast = useToast()
  const router = useRouter()

  // Fetch tenants on mount
  useEffect(() => {
    const fetchTenants = async () => {
      setIsLoadingTenants(true)
      setTenantError('')
      
      try {
        // Cast the result to handle potential different response formats
        const result = await TenantApi.getAll() as Tenant[] | ApiResponse<Tenant[]>
        
        if (Array.isArray(result)) {
          // Direct array of tenants
          setTenants(result)
        } else if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
          // Object with data property that's an array
          setTenants(result.data)
        } else {
          console.error('Unexpected tenant data format:', result)
          setTenantError('Failed to load companies - unexpected data format')
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error)
        setTenantError('Failed to load companies. Please try again later.')
      } finally {
        setIsLoadingTenants(false)
      }
    }

    fetchTenants()
  }, [])

  // Validate employee form
  const validateEmployeeForm = () => {
    const newErrors = { ...errors, email: '', password: '', tenant: '' }
    let isValid = true

    if (!email) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Password is required'
      isValid = false
    }

    if (!tenantId) {
      newErrors.tenant = 'Please select a company'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Validate admin form
  const validateAdminForm = () => {
    const newErrors = { ...errors, adminEmail: '', adminPassword: '' }
    let isValid = true

    if (!adminEmail) {
      newErrors.adminEmail = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(adminEmail)) {
      newErrors.adminEmail = 'Invalid email format'
      isValid = false
    }

    if (!adminPassword) {
      newErrors.adminPassword = 'Password is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Handle employee login
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
        toast({
          title: 'Login successful',
          description: `Welcome ${response.data?.prenom} ${response.data?.nom}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        // Redirect based on role
        router.push('/dashboard')
      } else {
        toast({
          title: 'Login failed',
          description: response.message || 'Invalid credentials',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Login error',
        description: error.message || 'An error occurred during login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle admin login
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
          title: 'Admin login successful',
          description: `Welcome ${response.data?.prenom} ${response.data?.nom}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        
        router.push('/admin/dashboard')
      } else {
        toast({
          title: 'Admin login failed',
          description: response.message || 'Invalid admin credentials',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Admin login error',
        description: error.message || 'An error occurred during admin login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsAdminLoading(false)
    }
  }

  // Handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent, type: 'employee' | 'admin') => {
    if (e.key === 'Enter') {
      type === 'employee' ? handleEmployeeLogin() : handleAdminLogin()
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
              <Heading size="lg" textAlign="center">Print Management System</Heading>
              
              <Tabs variant="soft-rounded" colorScheme="blue" isFitted>
                <TabList mb={4}>
                  <Tab>Employee</Tab>
                  <Tab>Admin</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Employee Login */}
                  <TabPanel p={0}>
                    <VStack spacing={4}>
                      <FormControl isInvalid={!!errors.tenant}>
                        <FormLabel>Company</FormLabel>
                        {isLoadingTenants ? (
                          <Center py={2}>
                            <Spinner size="sm" mr={2} />
                            <Text fontSize="sm">Loading companies...</Text>
                          </Center>
                        ) : tenantError ? (
                          <Alert status="error" size="sm" borderRadius="md">
                            <AlertIcon />
                            {tenantError}
                          </Alert>
                        ) : (
                          <Select
                            placeholder="Select your company"
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
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'employee')}
                        />
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl isInvalid={!!errors.password}>
                        <FormLabel>Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'employee')}
                        />
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                      </FormControl>
                      
                      <Button
                        colorScheme="blue"
                        mt={4}
                        width="100%"
                        onClick={handleEmployeeLogin}
                        isLoading={isLoading}
                        loadingText="Signing in..."
                        isDisabled={isLoadingTenants}
                      >
                        Employee Login
                      </Button>
                    </VStack>
                  </TabPanel>
                  
                  {/* Admin Login */}
                  <TabPanel p={0}>
                    <VStack spacing={4}>
                      <FormControl isInvalid={!!errors.adminEmail}>
                        <FormLabel>Admin Email</FormLabel>
                        <Input
                          type="email"
                          placeholder="admin@company.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'admin')}
                        />
                        <FormErrorMessage>{errors.adminEmail}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl isInvalid={!!errors.adminPassword}>
                        <FormLabel>Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="Admin password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'admin')}
                        />
                        <FormErrorMessage>{errors.adminPassword}</FormErrorMessage>
                      </FormControl>
                      
                      <Button
                        colorScheme="purple"
                        mt={4}
                        width="100%"
                        onClick={handleAdminLogin}
                        isLoading={isAdminLoading}
                        loadingText="Signing in..."
                      >
                        Admin Login
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