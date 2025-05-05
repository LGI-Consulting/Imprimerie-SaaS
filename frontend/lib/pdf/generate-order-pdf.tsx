import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { OrderInvoiceData, Dimensions, OptionData } from './types';
import { Commande, DetailCommande, Client, Materiau } from '../api/types';
import OrderInvoiceTemplate from './order-invoice-template';

// Interface étendue pour les détails de commande avec matériau
export interface DetailCommandeWithMateriau extends Omit<DetailCommande, 'dimensions'> {
  materiau?: {
    materiau_id: number;
    type_materiau: string;
    nom?: string | null;
  };
  materiau_nom?: string | null;
  dimensions?: Dimensions | string;
}

// Interface étendue pour la commande avec détails et matériaux
export interface CommandeWithDetails extends Commande {
  client: Client;
  details: DetailCommandeWithMateriau[];
  remise?: {
    type: string;
    valeur: number;
    montant_applique: number;
  };
}

/**
 * Parse les commentaires JSON pour extraire les options et commentaires textuels
 * @param commentairesJson - Chaîne JSON des commentaires
 * @returns Objet contenant les options et commentaires
 */
const parseCommentaires = (commentairesJson?: string | null): { options: OptionData[], commentaires: string } => {
  if (!commentairesJson) {
    return { options: [], commentaires: '' };
  }

  try {
    const parsed = JSON.parse(commentairesJson);
    
    // Transformer les options dans le format attendu
    const options = Array.isArray(parsed.options) 
      ? parsed.options.map((opt: any) => ({
          name: opt.option || opt.name || '',
          quantity: opt.quantity || 1,
          unit_price: opt.unit_price || 0,
          total_price: opt.total_price || 0
        }))
      : [];
    
    return {
      options,
      commentaires: parsed.commentaires || ''
    };
  } catch (error) {
    console.error('Erreur lors du parsing des commentaires:', error);
    return { options: [], commentaires: commentairesJson };
  }
};

/**
 * Formate les dimensions pour l'affichage
 * @param dimensions - Objet ou chaîne de dimensions
 * @returns Chaîne formatée des dimensions
 */
const formatDimensions = (dimensions: Dimensions | string | undefined): string => {  
  if (!dimensions) return 'N/A';  // Vérifier si dimensions est null ou undefined
  
  if (typeof dimensions === 'string') {
    try {
      const parsedDimensions = JSON.parse(dimensions);
      // Vérifier si le résultat du parsing est un objet valide
      if (typeof parsedDimensions === 'object' && parsedDimensions !== null) {
        dimensions = parsedDimensions;
      } else {
        return dimensions;
      }
    } catch (e) {
      return dimensions?.toString() || 'N/A';
    }
  }

  // À ce stade, dimensions est soit un objet Dimensions, soit undefined
  // Mais nous avons déjà vérifié si dimensions est undefined au début
  const dim = dimensions as Dimensions;
  if (dim.longueur && (dim.largeur_materiau || dim.largeur_demandee)) {
    return `${dim.longueur || 0}cm × ${dim.largeur_materiau || dim.largeur_demandee || 0}cm`;
  }
  
  return 'N/A';
};

/**
 * Génère un PDF de facture pour une commande
 * @param commande - Données de la commande
 * @param materiaux - Liste des matériaux pour enrichir les détails
 * @param format - Format du PDF (A4 ou A5)
 * @returns Blob du PDF généré
 */
export const generateOrderPDF = async (
  commande: CommandeWithDetails,
  materiaux: Materiau[] = [],
  format: 'A4' | 'A5' = 'A4'
): Promise<Blob> => {
  // Préparer les données pour le template de facture
  const invoiceData: OrderInvoiceData = {
    numero_commande: commande.numero_commande || commande.commande_id.toString(),
    date_creation: commande.date_creation,
    statut: commande.statut,
    client: commande.client,
    situation_paiement: commande.est_commande_speciale ? 'crédit' : 'comptant',
    details: [],
  };

  // Extraire les commentaires généraux de la commande
  const commandeCommentaires = parseCommentaires(commande.commentaires);
  invoiceData.commentaires = commandeCommentaires.commentaires;

  // Traiter chaque détail de commande
  invoiceData.details = commande.details.map(detail => {
    // Trouver le matériau correspondant
    const materiau = materiaux.find(m => m.materiau_id === detail.materiau_id);
    
    // Parser les commentaires du détail pour extraire les options
    const { options, commentaires } = parseCommentaires(detail.commentaires);
    
    // Formater les dimensions
    const formattedDimensions: string = formatDimensions(detail.dimensions);
    
    return {
      materiau_id: detail.materiau_id,
      materiau: materiau ? {
        materiau_id: materiau.materiau_id,
        type_materiau: materiau.type_materiau,
        nom: materiau.nom
      } : {
        materiau_id: detail.materiau_id,
        type_materiau: detail.materiau?.type_materiau || detail.materiau_nom || 'Matériau non spécifié',
        nom: detail.materiau?.nom || detail.materiau_nom
      },
      dimensions: formattedDimensions,
      quantite: Number(detail.quantite),
      prix_unitaire: Number(detail.prix_unitaire),
      options: options,
      commentaires: commentaires
    };
  });

  // Générer le PDF avec le template
  return pdf(<OrderInvoiceTemplate data={invoiceData} format={format} />).toBlob();
};

/**
 * Ouvre la boîte de dialogue d'impression du navigateur pour le PDF
 * @param pdfBlob - Le PDF sous forme de Blob
 * @param fileName - Le nom du fichier (utilisé pour l'URL)
 */
export const printOrderPDF = async (pdfBlob: Blob, fileName: string): Promise<void> => {
  try {
    // Création d'un URL pour le Blob
    const url = URL.createObjectURL(pdfBlob);
    
    // Créer un iframe caché pour charger le PDF
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    
    // Attendre que l'iframe soit chargé avant d'imprimer
    printFrame.onload = () => {
      try {
        // Accéder au contenu de l'iframe
        const frameWindow = printFrame.contentWindow;
        if (!frameWindow) {
          throw new Error("Impossible d'accéder à la fenêtre de l'iframe");
        }
        
        // Imprimer le contenu
        frameWindow.focus();
        frameWindow.print();
        
        // Nettoyer après un délai pour permettre à la boîte de dialogue d'impression de s'ouvrir
        setTimeout(() => {
          document.body.removeChild(printFrame);
          URL.revokeObjectURL(url);
        }, 1000);
      } catch (printError) {
        console.error('Erreur lors de l\'impression:', printError);
        document.body.removeChild(printFrame);
        URL.revokeObjectURL(url);
        throw printError;
      }
    };
    
    // Définir la source de l'iframe et l'ajouter au DOM
    printFrame.src = url;
    document.body.appendChild(printFrame);
  } catch (error) {
    console.error('Erreur lors de la préparation de l\'impression:', error);
    throw new Error(
      `Erreur lors de la préparation de l'impression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    );
  }
};

/**
 * Télécharge le PDF généré
 * @param pdfBlob - Le PDF sous forme de Blob
 * @param fileName - Le nom du fichier à télécharger
 */
export const downloadOrderPDF = (pdfBlob: Blob, fileName: string): void => {
  try {
    // Création d'un URL pour le Blob
    const url = URL.createObjectURL(pdfBlob);
    
    // Création d'un lien temporaire pour le téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Ajout du lien au DOM, clic et suppression
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Libération de l'URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error);
    throw new Error(
      `Erreur lors du téléchargement du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    );
  }
};

/**
 * Fonction utilitaire pour générer et imprimer un PDF de facture de commande
 * @param order - Les données de la commande
 * @param format - Format du PDF (A4 ou A5)
 * @returns Promise<void>
 */
export const generateAndPrintOrderPDF = async (
  order: CommandeWithDetails,
  format: 'A4' | 'A5' = 'A4'
): Promise<void> => {
  try {
    const pdfBlob = await generateOrderPDF(order, [], format);
    const fileName = `facture_commande_${order.numero_commande}.pdf`;
    await printOrderPDF(pdfBlob, fileName);
  } catch (error) {
    console.error('Erreur lors de la génération et de l\'impression du PDF:', error);
    throw error;
  }
};

/**
 * Fonction utilitaire pour générer et télécharger un PDF de facture de commande
 * @param order - Les données de la commande
 * @param format - Format du PDF (A4 ou A5)
 * @returns Promise<void>
 */
export const generateAndDownloadOrderPDF = async (
  order: CommandeWithDetails,
  format: 'A4' | 'A5' = 'A4'
): Promise<void> => {
  try {
    const pdfBlob = await generateOrderPDF(order, [], format);
    const fileName = `facture_commande_${order.numero_commande}.pdf`;
    downloadOrderPDF(pdfBlob, fileName);
  } catch (error) {
    console.error('Erreur lors de la génération et du téléchargement du PDF:', error);
    throw error;
  }
};
