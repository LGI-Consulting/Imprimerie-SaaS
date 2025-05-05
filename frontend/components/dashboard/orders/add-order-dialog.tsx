"use client";

import { useState, useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Trash2, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { commandes } from "@/lib/api/commandes";
import materiaux from "@/lib/api/materiaux";
import { StockMateriauxLargeur, MateriauxAvecStocks } from "@/lib/api/types";
import { formatCurrency } from "@/lib/api/utils";
import { toast } from "sonner";
import { clients } from "@/lib/api/client";
import { Client } from "@/lib/api/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { calculateOrderPrice } from "@/lib/utils/price-calculator";
import { generateOrderNumber } from "@/lib/utils/order-number-generator";
import { validateOrder } from "@/lib/utils/order-validator";
import {
  validateStock,
  findSuitableMaterialWidth,
} from "@/lib/utils/stock-validator";

// Définir l'interface OptionDetail si elle n'est pas importée
interface OptionDetail {
  option: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Form schema
const formSchema = z.object({
  clientInfo: z.object({
    nom: z.string().min(1, "Le nom est requis"),
    prenom: z.string().min(1, "Le prénom est requis"),
    telephone: z.string().min(1, "Le téléphone est requis"),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    adresse: z.string().optional().or(z.literal("")),
  }),
  materiau_id: z.number().min(1, "Le matériau est requis"),
  dimensions: z.object({
    largeur: z.number().min(1, "La largeur doit être supérieure à 0"),
    longueur: z.number().min(1, "La longueur doit être supérieure à 0"),
  }),
  quantite: z.number().min(1, "La quantité doit être supérieure à 0"),
  options: z.record(z.any()).optional(),
  situation_paiement: z.enum(["credit", "comptant"] as const).default("comptant"),
  commentaires: z.string().optional(),
  est_commande_speciale: z.boolean().default(false),
  priorite: z.number().min(0).max(5).default(1),
});

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: any) => void;
}

export function AddOrderDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddOrderDialogProps) {
  const [materiauList, setMateriauList] = useState<MateriauxAvecStocks[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState<
    | ({
        totalPrice: number;
        unitPrice: number;
        area: number;
        selectedWidth: number;
        materialLengthUsed: number;
        optionsCost: number;
        optionsDetails: Record<string, any>;
        basePrice: number;
      } & {
        materiau_id?: number;
        stock_id?: number;
      })
    | null
  >(null);
  const {} = useAuth(); // Gardons l'import useAuth pour une utilisation future potentielle
  const [selectedMateriau, setSelectedMateriau] =
    useState<MateriauxAvecStocks | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>(
    {}
  );
  // Ajoutons un état pour mémoriser la largeur sélectionnée
  const [selectedWidth, setSelectedWidth] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientInfo: {
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        adresse: "",
      },
      materiau_id: 0,
      dimensions: {
        largeur: 0,
        longueur: 0,
      },
      quantite: 1,
      commentaires: "",
      est_commande_speciale: false,
      priorite: 1,
      options: {},
      situation_paiement: "comptant",
    },
  });

  // Fonction pour gérer la fermeture du dialog
  const handleDialogClose = (isOpen: boolean) => {
    // Si le dialog se ferme
    if (!isOpen) {
      // Réinitialiser le formulaire
      form.reset({
        clientInfo: {
          nom: "",
          prenom: "",
          telephone: "",
          email: "",
          adresse: "",
        },
        materiau_id: 0,
        dimensions: {
          largeur: 0,
          longueur: 0,
        },
        quantite: 1,
        commentaires: "",
        est_commande_speciale: false,
        priorite: 1,
        options: {},
        situation_paiement: "comptant",
      });
      
      // Réinitialiser tous les états
      setSelectedFiles([]);
      setError(null);
      setClientSearch("");
      setFilteredClients([]);
      setSelectedClient(null);
      setPriceCalculation(null);
      setSelectedMateriau(null);
      setSelectedOptions({});
      setSelectedWidth(null);
    }
    
    // Appeler la fonction onOpenChange fournie par le parent
    onOpenChange(isOpen);
  };

  // Charger les données initiales lorsque le dialog s'ouvre
  useEffect(() => {
    if (open) {
      // Charger la liste des matériaux
      const loadMateriaux = async () => {
        try {
          const data = await materiaux.getAll();
          setMateriauList(data);
        } catch (err) {
          console.error("Erreur lors du chargement des matériaux:", err);
          setError("Erreur lors du chargement des matériaux");
        }
      };

      // Charger la liste des clients
      const loadClients = async () => {
        try {
          const data = await clients.getAll();
          setClientsList(data);
        } catch (err) {
          console.error("Erreur lors du chargement des clients:", err);
        }
      };

      loadMateriaux();
      loadClients();
      
      // Réinitialiser le formulaire et les états
      form.reset();
      setSelectedFiles([]);
      setError(null);
      setClientSearch("");
      setFilteredClients([]);
      setSelectedClient(null);
      setPriceCalculation(null);
      setSelectedMateriau(null);
      setSelectedOptions({});
      setSelectedWidth(null);
    }
  }, [open, form]);

  // Configuration de dropzone pour les fichiers
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    onDrop: (acceptedFiles) => {
      setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Ajout d'une fonction pour vérifier le stock en temps réel
  const checkStockAvailability = useCallback(async () => {
    const largeur = form.watch("dimensions.largeur");
    const longueur = form.watch("dimensions.longueur");
    const quantite = form.watch("quantite");
    const estCommandeSpeciale = form.watch("est_commande_speciale");

    // Si le matériau n'est pas sélectionné, ne rien faire
    if (!selectedMateriau) {
      console.log("Aucun matériau sélectionné pour vérifier le stock");
      return;
    }

    // Si les dimensions ou la quantité ne sont pas encore saisies, ne pas afficher d'erreur
    if (!largeur || !longueur || !quantite) {
      console.log("Dimensions ou quantité non saisies:", {
        largeur,
        longueur,
        quantite,
      });
      return;
    }

    try {
      // Utiliser la largeur mémorisée si elle existe, sinon en trouver une nouvelle
      const requestedWidth = largeur;
      const availableWidths =
        selectedMateriau.stocks?.map((s) => s.largeur) || [];
      console.log("Largeurs disponibles:", availableWidths);

      // Si nous avons déjà une largeur sélectionnée et qu'elle est toujours valide, l'utiliser
      const widthToUse =
        selectedWidth && availableWidths.includes(selectedWidth)
          ? selectedWidth
          : findSuitableMaterialWidth(requestedWidth, availableWidths);

      console.log("Largeur sélectionnée:", widthToUse);

      // Mémoriser cette largeur pour les prochains calculs
      if (widthToUse && widthToUse !== selectedWidth) {
        setSelectedWidth(widthToUse);
      }

      console.log("Stocks du matériau:", selectedMateriau.stocks);
      const stock = selectedMateriau.stocks?.find(
        (s) => s.largeur === widthToUse
      );
      console.log("Stock trouvé:", stock);

      if (!stock) {
        console.error("Aucun stock trouvé pour la largeur", widthToUse);
        setError("Stock non disponible pour ce matériau");
        return;
      }

      // Vérifier la disponibilité du stock
      console.log("Vérification du stock avec:", {
        longueur,
        quantite,
        stock: {
          largeur: stock.largeur,
          longeur_en_stock: stock.longeur_en_stock,
          seuil_alerte: stock.seuil_alerte,
        },
      });

      const result = validateStock(longueur, quantite, stock);

      console.log("Résultat de la validation du stock:", result);

      if (!result.available) {
        setError(result.message || "Stock non disponible");
      } else if (result.message) {
        // Stock disponible mais bas
        toast.warning(result.message);
        setError(null);
      } else {
        setError(null);
      }

      // Mettre à jour le calcul de prix
      const calculation = calculateOrderPrice(
        selectedMateriau,
        stock,
        {
          largeur,
          longueur,
        },
        quantite,
        selectedOptions,
        estCommandeSpeciale
      );

      // Ajouter l'ID du matériau pour le backend
      setPriceCalculation({
        ...calculation,
        materiau_id: selectedMateriau.materiau_id,
        stock_id: stock.stock_id,
      });
    } catch (err: any) {
      console.error("Erreur lors de la vérification du stock:", err);
      setError(err.message);
    }
  }, [selectedMateriau, selectedOptions, form]);

  // Appeler la vérification du stock lorsque les valeurs changent
  useEffect(() => {
    checkStockAvailability();
  }, [checkStockAvailability]);

  const calculatePrice = useCallback(() => {
    const values = form.getValues();
    console.log("calculatePrice - Début - form.getValues():", values);
    console.log("calculatePrice - Options du formulaire:", values.options);

    const currentMateriau = materiauList.find(
      (m) => m.materiau_id === values.materiau_id
    );
    const estCommandeSpeciale = values.est_commande_speciale;

    console.log("calculatePrice - Entrée:", {
      materiau_id: values.materiau_id,
      dimensions: values.dimensions,
      quantite: values.quantite,
      options: values.options,
      estCommandeSpeciale,
    });

    if (!currentMateriau) return;

    try {
      // Utiliser la largeur sélectionnée si disponible, sinon utiliser une valeur par défaut
      const stockLargeur = selectedWidth;
      const stock =
        currentMateriau.stocks?.find((s) => s.largeur === stockLargeur) ||
        ({
          largeur: stockLargeur || 100,
          longeur_en_stock: 1000,
        } as StockMateriauxLargeur);

      console.log("calculatePrice - Stock utilisé:", stock);
      console.log(
        "calculatePrice - Options disponibles:",
        currentMateriau.options_disponibles
      );

      const calculation = calculateOrderPrice(
        currentMateriau,
        stock,
        values.dimensions,
        values.quantite,
        values.options, // Utiliser les options du formulaire
        estCommandeSpeciale
      );

      console.log(
        "calculatePrice - Résultat de calculateOrderPrice:",
        calculation
      );

      // Calculer le coût des options
      let optionsCost = 0;
      const optionsDetails: OptionDetail[] = [];

      // Vérifier que les options et options_disponibles existent
      if (currentMateriau.options_disponibles && values.options) {
        console.log(
          "calculatePrice - Options disponibles:",
          currentMateriau.options_disponibles
        );
        console.log("calculatePrice - Options sélectionnées:", values.options);

        // Parcourir uniquement les options sélectionnées
        Object.entries(values.options).forEach(([key, value]) => {
          console.log(`calculatePrice - Traitement option ${key}:`, { value });

          // Récupérer le prix de l'option
          const optionPrice = currentMateriau.options_disponibles[key];

          console.log(`calculatePrice - Prix de l'option ${key}:`, optionPrice);

          if (optionPrice === undefined) {
            console.log(
              `Option ${key} non trouvée dans les options disponibles`
            );
            return; // Ignorer cette option
          }

          console.log(`Traitement option ${key}:`, { optionPrice, value });

          // Calculer le coût de l'option (par m²)
          const cost = calculation.area * optionPrice;

          console.log(`calculatePrice - Coût de l'option ${key}:`, cost);

          // Ajouter le coût de l'option au total
          optionsCost += cost;

          // Ajouter les détails de l'option
          optionsDetails.push({
            option: key,
            quantity: 1, // Toujours 1 car nous n'avons plus d'options avec quantité
            unit_price: optionPrice,
            total_price: cost,
          });

          console.log(`Option ${key} - coût total:`, cost);
        });
      }

      console.log("calculatePrice - optionsCost final:", optionsCost);
      console.log("calculatePrice - optionsDetails final:", optionsDetails);

      // Pour les commandes spéciales, le prix est 0
      const finalPrice = estCommandeSpeciale
      ? 0
      : calculation.totalPrice + optionsCost;
    
    console.log("calculatePrice - Prix final:", finalPrice);
    
    // S'assurer que les optionsDetails sont bien un tableau
    const safeOptionsDetails = Array.isArray(optionsDetails)
      ? optionsDetails
      : [];
    
    // Créer un nouvel objet pour forcer la détection du changement d'état
    const newPriceCalculation = {
      ...calculation,
      totalPrice: finalPrice,
      optionsCost,
      optionsDetails: safeOptionsDetails,
      basePrice: calculation.totalPrice,
      materiau_id: currentMateriau.materiau_id,
    };
    
    // Forcer la mise à jour de l'état avec un nouvel objet
    setPriceCalculation(newPriceCalculation);
    
    console.log("calculatePrice - priceCalculation mis à jour:", newPriceCalculation);
    
    } catch (error) {
      console.error("calculatePrice - Erreur:", error);
      setPriceCalculation(null);
      toast.error(error instanceof Error ? error.message : "Erreur de calcul");
    }
  }, [form, materiauList, selectedWidth]);

  // Définissons la fonction handleOptionChange avec plus de logs
  const handleOptionChange = useCallback(
    (optionKey: string, isChecked: boolean) => {
      console.log(
        `handleOptionChange - Début - Option ${optionKey} ${
          isChecked ? "cochée" : "décochée"
        }`
      );
  
      // Récupérer les options actuelles
      const currentOptions = { ...form.getValues().options };
      console.log(
        `handleOptionChange - currentOptions avant modification:`,
        currentOptions
      );
  
      if (isChecked) {
        // Ajouter l'option
        currentOptions[optionKey] = true;
      } else {
        // Supprimer l'option
        delete currentOptions[optionKey];
      }
  
      console.log(
        `handleOptionChange - currentOptions après modification:`,
        currentOptions
      );
  
      // Mettre à jour le formulaire avec les nouvelles options
      form.setValue("options", currentOptions, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      
      // Mettre à jour l'état local des options sélectionnées
      setSelectedOptions(currentOptions);
      
      // Forcer le recalcul du prix immédiatement (sans setTimeout)
      calculatePrice();
      checkStockAvailability();
  
      console.log(`handleOptionChange - Fin - selectedOptions mis à jour`);
    },
    [form, calculatePrice, checkStockAvailability]
  );

  

  // Mettre à jour les options quand le matériau change
  const handleMateriauChange = useCallback(
    (materiauId: number) => {
      const materiau = materiauList.find((m) => m.materiau_id === materiauId);
      setSelectedMateriau(materiau || null);
      setSelectedOptions({});
      form.setValue("options", {});
    },
    [materiauList, form]
  );

 
  // Ajouter des logs dans le rendu pour vérifier l'état de priceCalculation
  useEffect(() => {
    console.log("Render - priceCalculation:", priceCalculation);
  }, [priceCalculation]);

  // Supprimer ou modifier cet effet qui ne semble appeler checkStockAvailability qu'une seule fois
  // useEffect(() => {
  //   checkStockAvailability();
  // }, [checkStockAvailability]);

  // Ajoutez un useEffect pour charger tous les clients au montage
  useEffect(() => {
    const loadAllClients = async () => {
      try {
        const results = await clients.getAll();
        setClientsList(results);
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        toast.error("Erreur lors du chargement des clients");
      }
    };
    
    loadAllClients();
  }, []);

  // Modifiez la fonction searchClients pour filtrer localement
  const searchClients = useCallback((query: string) => {
    if (query.length < 2) {
      // Afficher tous les clients ou limiter à un nombre raisonnable
      return;
    }

    setIsSearching(true);
    try {
      // Filtrer les clients localement
      const filteredClients = clientsList.filter(client => 
        client.nom.toLowerCase().includes(query.toLowerCase()) ||
        client.prenom.toLowerCase().includes(query.toLowerCase()) ||
        client.telephone.includes(query.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(query.toLowerCase()))
      );
      
      // Pas besoin de mettre à jour clientsList, car nous filtrons juste pour l'affichage
      setFilteredClients(filteredClients);
    } catch (error) {
      console.error("Erreur lors de la recherche des clients:", error);
    } finally {
      setIsSearching(false);
    }
  }, [clientsList]);

  // Sélectionner un client
  const handleClientSelect = useCallback(
    (client: Client) => {
      setSelectedClient(client);
      form.setValue("clientInfo", {
        nom: client.nom,
        prenom: client.prenom,
        telephone: client.telephone,
        email: client.email || "",
        adresse: client.adresse || "",
      });
    },
    [form]
  );

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation des données
      const validationResult = validateOrder({
        clientInfo: data.clientInfo,
        width: data.dimensions.largeur,
        length: data.dimensions.longueur,
        quantity: data.quantite,
        materialType: selectedMateriau?.type_materiau,
        options: data.options,
      });

      if (!validationResult.valid) {
        setError(validationResult.message || "Validation échouée");
        setIsSubmitting(false);
        return;
      }

      // Trouver le stock approprié
      const stock = selectedMateriau?.stocks?.find(
        (s) => s.largeur === priceCalculation?.selectedWidth
      );

      if (!stock) {
        setError("Stock non disponible pour ce matériau");
        setIsSubmitting(false);
        return;
      }

      // Vérification du stock (sauf pour les commandes spéciales)
      if (!data.est_commande_speciale) {
        const stockCheck = validateStock(
          data.dimensions.longueur,
          data.quantite,
          stock
        );

        if (!stockCheck.available) {
          setError(stockCheck.message || "Stock insuffisant");
          setIsSubmitting(false);
          return;
        }
      }

      // Génération du numéro de commande
      const orderNumber = generateOrderNumber();
      console.log("situation_paiement:", data.situation_paiement)
      // Préparation des données pour l'API
      const orderData = {
        clientInfo: data.clientInfo,
        materialType: selectedMateriau?.type_materiau || "",
        width: data.dimensions.largeur,
        length: data.dimensions.longueur,
        quantity: data.quantite,
        options: {
          ...data.options,
          comments: data.commentaires,
          priorite: data.priorite.toString(),
        },
        calculatedPrice: {
          ...priceCalculation,
          materiau_id: selectedMateriau?.materiau_id || 0,
          stock_id: stock?.stock_id,
        },
        orderNumber: orderNumber,
        isDG: data.est_commande_speciale,
        situationPaiement: data.situation_paiement, // Ajouter cette ligne
      };

      // Envoi des données au serveur avec les fichiers
      const response = await commandes.create(orderData, selectedFiles);

      toast.success("Commande créée avec succès");

      if (onSuccess) {
        onSuccess(response);
      }

      // Réinitialiser le formulaire
      form.reset();
      setSelectedFiles([]);
      setSelectedClient(null);
      setPriceCalculation(null);
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Une erreur est survenue lors de la création de la commande"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("useEffect - selectedOptions changed:", selectedOptions);
    // Forcer un recalcul lorsque les options changent
    if (Object.keys(selectedOptions).length > 0) {
      calculatePrice();
    }
  }, [selectedOptions]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      console.log("form.watch - Changement détecté:", { name, value });
      if (
        name &&
        [
          "materiau_id",
          "dimensions.largeur",
          "dimensions.longueur",
          "quantite",
          "est_commande_speciale",
        ].includes(name)
      ) {
        console.log("form.watch - Déclenchement calculatePrice pour:", name);
        calculatePrice();
        console.log(
          "form.watch - Déclenchement checkStockAvailability pour:",
          name
        );
        checkStockAvailability();
      }
      // Nous gérons les "options" séparément dans handleOptionChange
    });
    return () => subscription.unsubscribe();
  }, [form, calculatePrice, checkStockAvailability]);
  

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle commande</DialogTitle>
          <DialogDescription>
            Créez une nouvelle commande en remplissant les informations
            ci-dessous.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="clientInfo"
                render={() => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedClient
                            ? clients.getFullName(selectedClient)
                            : "Sélectionner un client..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Rechercher un client..."
                            value={clientSearch}
                            onValueChange={(value) => {
                              setClientSearch(value);
                              searchClients(value);
                            }}
                          />
                          <CommandEmpty>
                            {isSearching
                              ? "Recherche en cours..."
                              : "Aucun client trouvé"}
                          </CommandEmpty>
                          <CommandGroup>
                            {(clientSearch.length < 2 ? clientsList.slice(0, 10) : filteredClients).map((client) => (
                              <CommandItem
                                key={client.client_id}
                                value={clients.getFullName(client)}
                                onSelect={() => handleClientSelect(client)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedClient?.client_id === client.client_id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {clients.getFullName(client)}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Recherchez un client existant ou créez-en un nouveau
                      ci-dessous.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientInfo.nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientInfo.prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientInfo.telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientInfo.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="clientInfo.adresse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="materiau_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matériau</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        handleMateriauChange(parseInt(value));
                      }}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un matériau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materiauList.map((materiau) => (
                          <SelectItem
                            key={materiau.materiau_id}
                            value={materiau.materiau_id.toString()}
                          >
                            {materiau.type_materiau}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dimensions.largeur"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largeur (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions.longueur"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longueur (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="quantite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="situation_paiement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de paiement</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le mode de paiement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="comptant">Comptant</SelectItem>
                        <SelectItem value="credit">Crédit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Fichiers</h3>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:border-primary"
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Glissez-déposez des fichiers ici ou cliquez pour
                    sélectionner
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tous formats d'impression acceptés (sans limite de taille)
                  </p>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="text-sm">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="est_commande_speciale"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="accent-primary"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Commande spéciale
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priorite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Normale</SelectItem>
                          <SelectItem value="2">Moyenne</SelectItem>
                          <SelectItem value="3">Haute</SelectItem>
                          <SelectItem value="4">Très haute</SelectItem>
                          <SelectItem value="5">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="commentaires"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informations supplémentaires sur la commande"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Toute information additionnelle concernant cette commande
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedMateriau?.options_disponibles &&
              Object.entries(selectedMateriau.options_disponibles).length >
                0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Options disponibles</h3>
                  {Object.entries(selectedMateriau.options_disponibles).map(
                    ([key, optionPrice]) => {
                      // Obtenir la valeur actuelle directement depuis le formulaire pour garantir la cohérence
                      const isSelected = !!form.getValues().options?.[key];

                      // Afficher le prix (maintenant toujours un nombre)
                      const priceDisplay =
                        optionPrice > 0
                          ? `(+${formatCurrency(optionPrice)}/m²)`
                          : "";

                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`option-${key}`}
                            checked={isSelected}
                            onChange={(e) => {
                              handleOptionChange(key, e.target.checked);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`option-${key}`} className="text-sm">
                            {key} {priceDisplay}
                          </label>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

            {/* Résumé des prix */}
            {priceCalculation &&
              (() => {
                console.log(
                  "Rendu du résumé des prix - priceCalculation:",
                  priceCalculation
                );
                return (
                  <div className="mt-4 space-y-2">
                    {/* Afficher la largeur choisie par le système */}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Largeur de matériau utilisée:</span>
                      <span>
                        {selectedWidth || priceCalculation.selectedWidth} cm
                      </span>
                    </div>

                    {/* Afficher le prix par m² */}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Prix par m²:</span>
                      <span>
                        {selectedMateriau
                          ? formatCurrency(selectedMateriau.prix_unitaire)
                          : "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Prix unitaire:</span>
                      <span>{formatCurrency(priceCalculation.unitPrice)}</span>
                    </div>

                    {/* Afficher la surface d'un exemplaire */}
                    <div className="flex justify-between">
                      <span>Surface par exemplaire:</span>
                      <span>
                        {(
                          priceCalculation.area / form.watch("quantite")
                        ).toFixed(2)}{" "}
                        m²
                      </span>
                    </div>

                    {/* Afficher la surface totale */}
                    <div className="flex justify-between">
                      <span>
                        Surface totale ({form.watch("quantite")} exemplaires):
                      </span>
                      <span>{priceCalculation.area.toFixed(2)} m²</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Longueur de matériau utilisée:</span>
                      <span>
                        {priceCalculation.materialLengthUsed.toFixed(2)} m
                      </span>
                    </div>

                    {/* Détail des options - Correction ici pour garantir que c'est un tableau */}
                    {priceCalculation.optionsDetails &&
                      Array.isArray(priceCalculation.optionsDetails) &&
                      priceCalculation.optionsDetails.length > 0 && (
                        <div className="space-y-1 mt-2">
                          <div className="text-sm font-medium">
                            Détail des options:
                          </div>
                          {priceCalculation.optionsDetails.map(
                            (option, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm text-muted-foreground pl-2"
                              >
                                <span>
                                  {option.option} (x{option.quantity}):
                                </span>
                                <span>
                                  {formatCurrency(option.total_price)}
                                </span>
                              </div>
                            )
                          )}
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total options:</span>
                            <span>
                              {formatCurrency(priceCalculation.optionsCost)}
                            </span>
                          </div>
                        </div>
                      )}

                    {/* Prix de base (sans options) */}
                    <div className="flex justify-between">
                      <span>Prix de base (sans options):</span>
                      <span>
                        {formatCurrency(
                          priceCalculation.basePrice ||
                            priceCalculation.totalPrice -
                              priceCalculation.optionsCost
                        )}
                      </span>
                    </div>

                    {/* Prix total */}
                    <div className="flex justify-between font-semibold">
                      <span>Prix total:</span>
                      <span>{formatCurrency(priceCalculation.totalPrice)}</span>
                    </div>
                  </div>
                );
              })()}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création..." : "Créer la commande"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
