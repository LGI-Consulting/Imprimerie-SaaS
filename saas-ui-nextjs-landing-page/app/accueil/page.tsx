'use client'

import { 
  Box, 
  Flex, 
  Grid, 
  GridItem, 
  Heading, 
  Text, 
  FormControl, 
  FormLabel, 
  Input, 
  Select, 
  Button, 
  Tag, 
  TagLabel, 
  TagCloseButton,
  Stack,
  HStack,
  VStack,
  Checkbox,
  RadioGroup,
  Radio,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  IconButton,
  useToast,
  Badge,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { FiUpload, FiSearch, FiX, FiCheck, FiPrinter, FiPlus, FiEdit, FiTrash2, FiInfo } from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

// Schéma de validation
const commandeSchema = z.object({
  typeMateriel: z.string().min(1, "Requis"),
  largeurDisponible: z.string().min(1, "Requis"),
  longueur: z.number().min(0.1, "Minimum 0.1m").max(50, "Maximum 50m"),
  largeurDemandee: z.number().min(0.1, "Minimum 0.1m").max(5, "Maximum 5m"),
  client: z.object({
    id: z.string().optional(),
    nom: z.string().min(1, "Requis"),
    telephone: z.string().min(1, "Requis"),
    email: z.string().email("Email invalide").optional(),
  }),
  finitions: z.object({
    perforation: z.boolean(),
    oillets: z.number().min(0).max(20),
    decoupeContour: z.boolean(),
    plastification: z.boolean(),
  }),
  livraison: z.object({
    necessaire: z.boolean(),
    adresse: z.string().optional(),
    distance: z.number().min(0).optional(),
  }),
  fichiers: z.array(z.instanceof(File)).min(1, "Au moins un fichier requis"),
})

type CommandeFormData = z.infer<typeof commandeSchema>

// Données mockées
const materiaux = [
  { id: '1', nom: 'Bâche 650g', largeurs: [1.5, 2, 2.5, 3, 4], prixM2: 4500, stock: 85 },
  { id: '2', nom: 'Autocollant adhésif', largeurs: [1.2, 1.5], prixM2: 6000, stock: 42 },
  { id: '3', nom: 'One Way Vision', largeurs: [1.5, 2, 3], prixM2: 5500, stock: 67 },
]

const clients = [
  { id: '1', nom: 'Client 1', telephone: '771234567', email: 'client1@example.com' },
  { id: '2', nom: 'Client 2', telephone: '772345678', email: 'client2@example.com' },
]

export default function AccueilPage() {
  const toast = useToast()
  const [numCommande, setNumCommande] = useState(`CMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
  const [surface, setSurface] = useState(0)
  const [prixTotal, setPrixTotal] = useState(0)
  const [fraisLivraison, setFraisLivraison] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [filteredClients, setFilteredClients] = useState(clients)
  const [selectedMateriau, setSelectedMateriau] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CommandeFormData>({
    resolver: zodResolver(commandeSchema),
    defaultValues: {
      typeMateriel: '',
      largeurDisponible: '',
      longueur: 1,
      largeurDemandee: 1,
      client: {
        id: '',
        nom: '',
        telephone: '',
        email: '',
      },
      finitions: {
        perforation: false,
        oillets: 0,
        decoupeContour: false,
        plastification: false,
      },
      livraison: {
        necessaire: false,
        adresse: '',
        distance: 0,
      },
      fichiers: [],
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles])
    setValue('fichiers', [...selectedFiles, ...acceptedFiles])
  }, [selectedFiles, setValue])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/psd': ['.psd'],
      'application/ai': ['.ai'],
    },
    maxFiles: 5,
  })

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)
    setValue('fichiers', newFiles)
  }

  const watchLongueur = watch('longueur')
  const watchLargeurDemandee = watch('largeurDemandee')
  const watchTypeMateriel = watch('typeMateriel')
  const watchLivraison = watch('livraison.necessaire')
  const watchDistance = watch('livraison.distance')
  const watchFinitions = watch('finitions')

  useEffect(() => {
    // Calcul de la surface et du prix
    const largeurEffective = selectedMateriau 
      ? Math.min(selectedMateriau.largeurs[0], watchLargeurDemandee + 0.05) 
      : watchLargeurDemandee
    
    const newSurface = watchLongueur * largeurEffective
    setSurface(newSurface)
    
    if (selectedMateriau) {
      const basePrice = newSurface * selectedMateriau.prixM2
      let finitionsPrice = 0
      
      if (watchFinitions?.decoupeContour) {
        finitionsPrice += newSurface * 900
      }
      
      if (watchFinitions?.plastification) {
        finitionsPrice += newSurface * 1500
      }
      
      setPrixTotal(basePrice + finitionsPrice)
    }
  }, [watchLongueur, watchLargeurDemandee, selectedMateriau, watchFinitions])

  useEffect(() => {
    // Calcul frais de livraison
    if (watchLivraison && watchDistance) {
      setFraisLivraison(Math.min(2000, watchDistance * 500))
    } else {
      setFraisLivraison(0)
    }
  }, [watchLivraison, watchDistance])

  useEffect(() => {
    // Filtrage des clients
    if (clientSearch) {
      setFilteredClients
        clients.filter(client =>
          client.nom.toLowerCase().includes(clientSearch.toLowerCase()) ||
          client.telephone.includes(clientSearch) ||
          client.email?.toLowerCase().includes(clientSearch.toLowerCase())
      )
    } else {
      setFilteredClients(clients)
    }
  }, [clientSearch])

  useEffect(() => {
    // Mise à jour du matériau sélectionné
    if (watchTypeMateriel) {
      const materiau = materiaux.find(m => m.id === watchTypeMateriel)
      setSelectedMateriau(materiau)
      setValue('largeurDisponible', materiau?.largeurs[0].toString() || '')
    }
  }, [watchTypeMateriel, setValue])

  const onSubmit = (data: CommandeFormData) => {
    console.log({
      ...data,
      numCommande,
      surface,
      prixTotal,
      fraisLivraison,
      prixFinal: prixTotal + fraisLivraison,
      status: 'En attente de paiement',
      dateCreation: new Date().toISOString(),
    })
    
    toast({
      title: 'Commande enregistrée',
      description: `La commande ${numCommande} a été enregistrée avec succès`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
    
    // Réinitialisation du formulaire
    setNumCommande(`CMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
    setSelectedFiles([])
  }

  const selectClient = (client: any) => {
    setValue('client', client)
    setClientSearch(client.nom)
    setFilteredClients(clients)
  }

  return (
    <Box p={6}>
      <Heading mb={8} size="xl">Réception de commande</Heading>
      
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
        {/* Colonne gauche - Formulaire */}
        <GridItem>
          <Box bg="white" p={6} borderRadius="md" boxShadow="md">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={6}>
                {/* Numéro de commande */}
                <FormControl>
                  <FormLabel>Numéro de commande</FormLabel>
                  <Input value={numCommande} isReadOnly fontWeight="bold" />
                </FormControl>
                
                {/* Sélection du matériau */}
                <FormControl isInvalid={!!errors.typeMateriel}>
                  <FormLabel>Type de matériel</FormLabel>
                  <Controller
                    name="typeMateriel"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        placeholder="Sélectionner" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          setSelectedMateriau(materiaux.find(m => m.id === e.target.value))
                        }}
                      >
                        {materiaux.map(materiau => (
                          <option key={materiau.id} value={materiau.id}>
                            {materiau.nom} (Stock: {materiau.stock}m²)
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.typeMateriel && (
                    <Text color="red.500" fontSize="sm">{errors.typeMateriel.message}</Text>
                  )}
                </FormControl>
                
                {selectedMateriau && (
                  <FormControl isInvalid={!!errors.largeurDisponible}>
                    <FormLabel>Largeur disponible</FormLabel>
                    <Controller
                      name="largeurDisponible"
                      control={control}
                      render={({ field }) => (
                        <Select {...field}>
                          {selectedMateriau.largeurs.map((largeur: number) => (
                            <option key={largeur} value={largeur}>
                              {largeur}m
                            </option>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                )}
                
                {/* Dimensions */}
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <FormControl isInvalid={!!errors.longueur}>
                    <FormLabel>Longueur (m)</FormLabel>
                    <Controller
                      name="longueur"
                      control={control}
                      render={({ field }) => (
                        <NumberInput 
                          min={0.1} 
                          max={50} 
                          step={0.1} 
                          {...field}
                          onChange={(valueString) => field.onChange(parseFloat(valueString))}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    />
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.largeurDemandee}>
                    <FormLabel>Largeur demandée (m)</FormLabel>
                    <Controller
                      name="largeurDemandee"
                      control={control}
                      render={({ field }) => (
                        <NumberInput 
                          min={0.1} 
                          max={5} 
                          step={0.1} 
                          {...field}
                          onChange={(valueString) => field.onChange(parseFloat(valueString))}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    />
                    <Text fontSize="sm" color="gray.500">
                      Marge de 5cm incluse automatiquement
                    </Text>
                  </FormControl>
                </Grid>
                
                {/* Client */}
                <FormControl isInvalid={!!errors.client?.nom}>
                  <FormLabel>Client</FormLabel>
                  <Input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Rechercher par nom, téléphone ou email"
                    rightElement={<FiSearch />}
                  />
                  
                  {clientSearch && filteredClients.length > 0 && (
                    <Box mt={2} borderWidth="1px" borderRadius="md" p={2} maxH="200px" overflowY="auto">
                      {filteredClients.map(client => (
                        <Box 
                          key={client.id} 
                          p={2} 
                          _hover={{ bg: 'gray.100' }} 
                          cursor="pointer"
                          onClick={() => selectClient(client)}
                        >
                          <Text fontWeight="bold">{client.nom}</Text>
                          <Text fontSize="sm">{client.telephone} • {client.email}</Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {watch('client.id') && (
                    <Box mt={2}>
                      <Tag size="lg" colorScheme="green" borderRadius="full">
                        <TagLabel>{watch('client.nom')} • {watch('client.telephone')}</TagLabel>
                        <TagCloseButton onClick={() => {
                          setValue('client', { id: '', nom: '', telephone: '', email: '' })
                          setClientSearch('')
                        }} />
                      </Tag>
                    </Box>
                  )}
                </FormControl>
                
                {!watch('client.id') && (
                  <>
                    <FormControl isInvalid={!!errors.client?.nom}>
                      <FormLabel>Nom complet</FormLabel>
                      <Input {...register('client.nom')} />
                    </FormControl>
                    
                    <FormControl isInvalid={!!errors.client?.telephone}>
                      <FormLabel>Téléphone</FormLabel>
                      <Input {...register('client.telephone')} />
                    </FormControl>
                    
                    <FormControl isInvalid={!!errors.client?.email}>
                      <FormLabel>Email (optionnel)</FormLabel>
                      <Input type="email" {...register('client.email')} />
                    </FormControl>
                  </>
                )}
                
                {/* Finitions */}
                <Box borderWidth="1px" borderRadius="md" p={4}>
                  <Heading size="md" mb={4}>Options de finition</Heading>
                  
                  {watchTypeMateriel === '1' && ( // Bâche
                    <Stack spacing={4}>
                      <Checkbox {...register('finitions.perforation')}>
                        Perforation (gratuit)
                      </Checkbox>
                      
                      <HStack align="center">
                        <Text>Œillets:</Text>
                        <NumberInput min={0} max={20} defaultValue={0} w="100px">
                          <NumberInputField {...register('finitions.oillets', { valueAsNumber: true })} />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text>à 200 FCFA/pièce</Text>
                      </HStack>
                    </Stack>
                  )}
                  
                  {watchTypeMateriel === '2' && ( // Autocollant
                    <Checkbox {...register('finitions.decoupeContour')}>
                      Découpe contour (+900 FCFA/m²)
                    </Checkbox>
                  )}
                  
                  {(watchTypeMateriel === '1' || watchTypeMateriel === '2') && (
                    <Checkbox {...register('finitions.plastification')} mt={4}>
                      Plastification (+1500 FCFA/m²)
                    </Checkbox>
                  )}
                </Box>
                
                {/* Livraison */}
                <Box borderWidth="1px" borderRadius="md" p={4}>
                  <Checkbox {...register('livraison.necessaire')}>
                    Livraison nécessaire
                  </Checkbox>
                  
                  {watchLivraison && (
                    <Box mt={4}>
                      <FormControl>
                        <FormLabel>Adresse de livraison</FormLabel>
                        <Input {...register('livraison.adresse')} />
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Distance (km)</FormLabel>
                        <NumberInput min={0} max={100} defaultValue={0}>
                          <NumberInputField {...register('livraison.distance', { valueAsNumber: true })} />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text fontSize="sm" color="gray.500">
                          Frais: 500 FCFA/km (max 2000 FCFA)
                        </Text>
                      </FormControl>
                    </Box>
                  )}
                </Box>
                
                {/* Fichiers */}
                <FormControl isInvalid={!!errors.fichiers}>
                  <FormLabel>Fichiers à imprimer</FormLabel>
                  <Box
                    {...getRootProps()}
                    border="2px dashed"
                    borderColor={isDragActive ? 'blue.500' : 'gray.300'}
                    borderRadius="md"
                    p={6}
                    textAlign="center"
                    cursor="pointer"
                    _hover={{ borderColor: 'blue.500' }}
                  >
                    <input {...getInputProps()} />
                    <FiUpload size={24} style={{ margin: '0 auto 10px' }} />
                    <Text>
                      {isDragActive ? 'Déposez les fichiers ici' : 'Glissez-déposez des fichiers ou cliquez pour sélectionner'}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Formats acceptés: JPG, PNG, PDF, PSD, AI (max 5 fichiers)
                    </Text>
                  </Box>
                  
                  {selectedFiles.length > 0 && (
                    <Box mt={4}>
                      <Text mb={2}>Fichiers sélectionnés:</Text>
                      <VStack align="stretch" spacing={2}>
                        {selectedFiles.map((file, index) => (
                          <HStack key={uuidv4()} p={2} borderWidth="1px" borderRadius="md">
                            <Box flex={1}>
                              <Text isTruncated>{file.name}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {(file.size / 1024).toFixed(2)} KB
                              </Text>
                            </Box>
                            <IconButton
                              aria-label="Supprimer le fichier"
                              icon={<FiX />}
                              size="sm"
                              onClick={() => removeFile(index)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                  
                  {errors.fichiers && (
                    <Text color="red.500" fontSize="sm">{errors.fichiers.message}</Text>
                  )}
                </FormControl>
                
                {/* Bouton de soumission */}
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  size="lg" 
                  rightIcon={<FiCheck />}
                  isLoading={false}
                >
                  Enregistrer la commande
                </Button>
              </Stack>
            </form>
          </Box>
        </GridItem>
        
        {/* Colonne droite - Récapitulatif */}
        <GridItem>
          <Box bg="white" p={6} borderRadius="md" boxShadow="md" position="sticky" top="20px">
            <Heading size="lg" mb={6}>Récapitulatif</Heading>
            
            {selectedMateriau ? (
              <Stack spacing={6}>
                {/* Informations générales */}
                <Box>
                  <Heading size="md" mb={2}>Informations commande</Heading>
                  <Table variant="simple" size="sm">
                    <Tbody>
                      <Tr>
                        <Td fontWeight="bold">Numéro</Td>
                        <Td>{numCommande}</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Date</Td>
                        <Td>{new Date().toLocaleDateString()}</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Statut</Td>
                        <Td>
                          <Badge colorScheme="orange">En attente de paiement</Badge>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>
                
                {/* Détails matériau */}
                <Box>
                  <Heading size="md" mb={2}>Détails matériau</Heading>
                  <Table variant="simple" size="sm">
                    <Tbody>
                      <Tr>
                        <Td fontWeight="bold">Type</Td>
                        <Td>{selectedMateriau.nom}</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Largeur disponible</Td>
                        <Td>{watch('largeurDisponible')}m</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Dimensions demandées</Td>
                        <Td>{watch('longueur')}m x {watch('largeurDemandee')}m</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Surface calculée</Td>
                        <Td>{surface.toFixed(2)}m²</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Stock restant</Td>
                        <Td>
                          <Box>
                            <Text mb={1}>{selectedMateriau.stock}m²</Text>
                            <Progress 
                              value={(selectedMateriau.stock / 100) * 100} 
                              size="xs" 
                              colorScheme={selectedMateriau.stock < 20 ? 'red' : 'green'}
                            />
                          </Box>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>
                
                {/* Finitions */}
                <Box>
                  <Heading size="md" mb={2}>Options sélectionnées</Heading>
                  {(
                    watchFinitions?.perforation || 
                    watchFinitions?.oillets > 0 || 
                    watchFinitions?.decoupeContour || 
                    watchFinitions?.plastification
                  ) ? (
                    <Table variant="simple" size="sm">
                      <Tbody>
                        {watchFinitions?.perforation && (
                          <Tr>
                            <Td>Perforation</Td>
                            <Td textAlign="right">Gratuit</Td>
                          </Tr>
                        )}
                        {watchFinitions?.oillets > 0 && (
                          <Tr>
                            <Td>Œillets ({watchFinitions.oillets})</Td>
                            <Td textAlign="right">{watchFinitions.oillets * 200} FCFA</Td>
                          </Tr>
                        )}
                        {watchFinitions?.decoupeContour && (
                          <Tr>
                            <Td>Découpe contour</Td>
                            <Td textAlign="right">+900 FCFA/m²</Td>
                          </Tr>
                        )}
                        {watchFinitions?.plastification && (
                          <Tr>
                            <Td>Plastification</Td>
                            <Td textAlign="right">+1500 FCFA/m²</Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text color="gray.500">Aucune option sélectionnée</Text>
                  )}
                </Box>
                
                {/* Fichiers */}
                <Box>
                  <Heading size="md" mb={2}>Fichiers</Heading>
                  {selectedFiles.length > 0 ? (
                    <VStack align="stretch" spacing={2}>
                      {selectedFiles.map((file, index) => (
                        <HStack key={index} p={2} borderWidth="1px" borderRadius="md">
                          <FiInfo />
                          <Box flex={1}>
                            <Text isTruncated>{file.name}</Text>
                          </Box>
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500">Aucun fichier sélectionné</Text>
                  )}
                </Box>
                
                {/* Total */}
                <Box borderTopWidth="1px" pt={4}>
                  <Table variant="simple" size="sm">
                    <Tbody>
                      <Tr>
                        <Td fontWeight="bold">Prix matériau</Td>
                        <Td textAlign="right">{(surface * selectedMateriau.prixM2).toFixed(2)} FCFA</Td>
                      </Tr>
                      {watchFinitions?.decoupeContour && (
                        <Tr>
                          <Td>Découpe contour</Td>
                          <Td textAlign="right">+{(surface * 900).toFixed(2)} FCFA</Td>
                        </Tr>
                      )}
                      {watchFinitions?.plastification && (
                        <Tr>
                          <Td>Plastification</Td>
                          <Td textAlign="right">+{(surface * 1500).toFixed(2)} FCFA</Td>
                        </Tr>
                      )}
                      {watchFinitions?.oillets > 0 && (
                        <Tr>
                          <Td>Œillets</Td>
                          <Td textAlign="right">+{watchFinitions.oillets * 200} FCFA</Td>
                        </Tr>
                      )}
                      {watchLivraison && (
                        <Tr>
                          <Td>Frais de livraison</Td>
                          <Td textAlign="right">+{fraisLivraison} FCFA</Td>
                        </Tr>
                      )}
                      <Tr>
                        <Td fontWeight="bold">Total</Td>
                        <Td fontWeight="bold" textAlign="right">
                          {(prixTotal + fraisLivraison).toFixed(2)} FCFA
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>
                
                {/* Actions */}
                <HStack spacing={4} mt={6}>
                  <Button leftIcon={<FiPrinter />} variant="outline">
                    Imprimer
                  </Button>
                  <Button leftIcon={<FiEdit />} variant="outline" onClick={onOpen}>
                    Modifier
                  </Button>
                </HStack>
              </Stack>
            ) : (
              <Text color="gray.500">Sélectionnez un matériau pour voir le récapitulatif</Text>
            )}
          </Box>
        </GridItem>
      </Grid>
      
      {/* Modal d'édition */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modifier la commande</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Fonctionnalité d'édition à implémenter</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}