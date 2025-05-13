import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Transaction } from '../api/client';
import { Client } from '../api/types';
import TransactionReceiptTemplate from './transaction-receipt-template';

/**
 * Génère un PDF de reçu de transaction
 * @param transaction - Les données de la transaction
 * @param client - Les données du client
 * @returns Promise<Blob> - Le PDF généré sous forme de Blob
 */
export const generateTransactionPDF = async (
  transaction: Transaction,
  client: Client
): Promise<Blob> => {
  try {
    // Préparation des données pour le template
    const receiptData = {
      transaction_id: transaction.transaction_id,
      date_transaction: transaction.date_transaction,
      type_transaction: transaction.type_transaction,
      montant: transaction.montant,
      solde_avant: transaction.solde_avant,
      solde_apres: transaction.solde_apres,
      commentaire: transaction.commentaire,
      reference_transaction: transaction.reference_transaction,
      employe: transaction.employe_nom && transaction.employe_prenom 
        ? `${transaction.employe_prenom} ${transaction.employe_nom}`
        : 'N/A',
      client: {
        nom: client.nom,
        prenom: client.prenom,
        telephone: client.telephone,
      }
    };

    // Génération du PDF
    const pdfBlob = await pdf(
      <TransactionReceiptTemplate data={receiptData} />
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
export const downloadTransactionPDF = (pdfBlob: Blob, fileName: string): void => {
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
 * Fonction utilitaire pour générer et télécharger un PDF de reçu de transaction
 * @param transaction - Les données de la transaction
 * @param client - Les données du client
 * @returns Promise<void>
 */
export const generateAndDownloadTransactionPDF = async (
  transaction: Transaction,
  client: Client
): Promise<void> => {
  try {
    const pdfBlob = await generateTransactionPDF(transaction, client);
    const fileName = `recu_transaction_${transaction.transaction_id}.pdf`;
    downloadTransactionPDF(pdfBlob, fileName);
  } catch (error) {
    console.error('Erreur lors de la génération et du téléchargement du PDF:', error);
    throw error;
  }
};