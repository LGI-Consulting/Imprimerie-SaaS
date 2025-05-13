import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReceiptData } from './types';
import { Paiement, Facture } from '../api/types';
import { commandes } from '../api/commandes';
import { paiements } from '../api/paiements';
import PaymentReceiptTemplate from './payment-receipt-template';

/**
 * Génère un PDF de reçu de paiement à partir des données fournies
 * @param paiement - Les données du paiement
 * @param facture - Les données de la facture associée
 * @returns Promise<Blob> - Le PDF généré sous forme de Blob
 */
export const generatePaymentPDF = async (
  paiement: Paiement,
  facture: Facture
): Promise<Blob> => {
  try {
    // Vérification des données requises
    if (!paiement || !facture) {
      throw new Error('Les données du paiement et de la facture sont requises');
    }

    // Récupération des détails de la commande avec les informations client
    const commandeDetails = await commandes.getById(paiement.commande_id);
    if (!commandeDetails) {
      throw new Error('Impossible de récupérer les détails de la commande');
    }

    // Préparation des données pour le template
    const receiptData: ReceiptData = {
      numero_facture: facture.numero_facture,
      date_emission: facture.date_emission,
      client: {
        nom: commandeDetails.client.nom,
        prenom: commandeDetails.client.prenom,
        telephone: commandeDetails.client.telephone,
      },
      commande: {
        numero: commandeDetails.numero_commande,
      },
      paiement: {
        methode: paiement.methode,
        montant_recu: paiement.montant_recu,
        monnaie_rendue: paiement.monnaie_rendue,
        reference: paiement.reference_transaction || undefined,
      },
      montants: {
        total: Number(facture.montant_total),
        taxe: Number(facture.montant_taxe),
        final: Number(facture.montant_final),
      },
    };

    // Génération du PDF
    const pdfBlob = await pdf(
      <PaymentReceiptTemplate data={receiptData} />
    ).toBlob();

    return pdfBlob;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error(
      `Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    );
  }
};

/**
 * Télécharge le PDF généré
 * @param pdfBlob - Le PDF sous forme de Blob
 * @param fileName - Le nom du fichier à télécharger
 */
export const downloadPaymentPDF = (pdfBlob: Blob, fileName: string): void => {
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
 * Fonction utilitaire pour générer et télécharger un PDF de reçu de paiement
 * @param paiement - Les données du paiement
 * @param facture - Les données de la facture associée
 * @returns Promise<void>
 */
export const generateAndDownloadPaymentPDF = async (
  paiement: Paiement,
  facture: Facture
): Promise<void> => {
  try {
    const pdfBlob = await generatePaymentPDF(paiement, facture);
    const fileName = `recu_paiement_${facture.numero_facture}.pdf`;
    downloadPaymentPDF(pdfBlob, fileName);
  } catch (error) {
    console.error('Erreur lors de la génération et du téléchargement du PDF:', error);
    throw error;
  }
};

/**
 * Génère un ticket de caisse au format PDF
 * @param paiement - Les données du paiement
 * @param facture - Les données de la facture associée
 * @returns Promise<Blob> - Le PDF généré sous forme de Blob
 */
export const generateReceiptPDF = async (
  paiement: Paiement,
  facture: Facture
): Promise<Blob> => {
  try {
    // Vérification des données requises
    if (!paiement || !facture) {
      throw new Error('Les données du paiement et de la facture sont requises');
    }

    // Récupération des détails de la commande avec les informations client
    const commandeDetails = await commandes.getById(paiement.commande_id);
    if (!commandeDetails) {
      throw new Error('Impossible de récupérer les détails de la commande');
    }

    // Préparation des données pour le template
    const receiptData: ReceiptData = {
      numero_facture: facture.numero_facture,
      date_emission: facture.date_emission,
      date_paiement: paiement.date_paiement,
      client: {
        nom: commandeDetails.client.nom,
        prenom: commandeDetails.client.prenom,
        telephone: commandeDetails.client.telephone,
      },
      commande: {
        numero: paiement.numero_commande || commandeDetails.numero_commande,
      },
      paiement: {
        methode: paiement.methode,
        montant_recu: paiement.montant_recu,
        monnaie_rendue: paiement.monnaie_rendue,
        reste_a_payer: paiement.reste_a_payer,
        reference: paiement.reference_transaction || undefined,
      },
      montants: {
        total: Number(facture.montant_total),
        taxe: Number(facture.montant_taxe),
        final: Number(facture.montant_final),
      },
    };

    // Génération du PDF
    const pdfBlob = await pdf(
      <PaymentReceiptTemplate data={receiptData} />
    ).toBlob();

    return pdfBlob;
  } catch (error) {
    console.error('Erreur lors de la génération du ticket de caisse:', error);
    throw new Error(
      `Erreur lors de la génération du ticket de caisse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    );
  }
};

/**
 * Télécharge le ticket de caisse généré
 * @param pdfBlob - Le PDF sous forme de Blob
 * @param fileName - Le nom du fichier à télécharger
 */
export const downloadReceiptPDF = (pdfBlob: Blob, fileName: string): void => {
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
    console.error('Erreur lors du téléchargement du ticket de caisse:', error);
    throw new Error(
      `Erreur lors du téléchargement du ticket de caisse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    );
  }
};

/**
 * Fonction utilitaire pour générer et télécharger un ticket de caisse
 * @param paiement - Les données du paiement
 * @param facture - Les données de la facture associée
 * @returns Promise<void>
 */
export const generateAndDownloadReceiptPDF = async (
  paiement: Paiement,
  facture: Facture
): Promise<void> => {
  try {
    const pdfBlob = await generateReceiptPDF(paiement, facture);
    const fileName = `ticket_${facture.numero_facture}.pdf`;
    downloadReceiptPDF(pdfBlob, fileName);
  } catch (error) {
    console.error('Erreur lors de la génération et du téléchargement du ticket de caisse:', error);
    throw error;
  }
}; 
