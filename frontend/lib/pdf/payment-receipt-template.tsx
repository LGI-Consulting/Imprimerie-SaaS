import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReceiptData } from './types';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottom: '1px solid #000',
    paddingBottom: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
  },
  divider: {
    borderBottom: '1px dashed #000',
    marginVertical: 10,
  },
  total: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 10,
  },
});

// Fonction pour formater les dates
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  } catch (error) {
    return dateString || 'Date non disponible';
  }
};

// Fonction pour formater les montants
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Template du reçu de paiement
const PaymentReceiptTemplate: React.FC<{ data: ReceiptData }> = ({ data }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>REÇU DE PAIEMENT</Text>
        <Text style={styles.subtitle}>Facture N° {data.numero_facture}</Text>
        <Text>Date d'émission: {formatDate(data.date_emission)}</Text>
        {data.date_paiement && (
          <Text>Date de paiement: {formatDate(data.date_paiement)}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations Client</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nom:</Text>
          <Text style={styles.value}>{data.client.nom} {data.client.prenom}</Text>
        </View>
        {data.client.telephone && (
          <View style={styles.row}>
            <Text style={styles.label}>Téléphone:</Text>
            <Text style={styles.value}>{data.client.telephone}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails de la Commande</Text>
        <View style={styles.row}>
          <Text style={styles.label}>N° Commande:</Text>
          <Text style={styles.value}>{data.commande.numero}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails du Paiement</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Méthode:</Text>
          <Text style={styles.value}>{data.paiement.methode}</Text>
        </View>
        {data.paiement.reference && (
          <View style={styles.row}>
            <Text style={styles.label}>Référence:</Text>
            <Text style={styles.value}>{data.paiement.reference}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Monnaie rendue:</Text>
          <Text style={styles.value}>{formatAmount(data.paiement.monnaie_rendue)}</Text>
        </View>
        {data.paiement.reste_a_payer !== undefined && (
          <View style={styles.row}>
            <Text style={styles.label}>Reste à payer:</Text>
            <Text style={styles.value}>{formatAmount(data.paiement.reste_a_payer)}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Récapitulatif</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Montant total:</Text>
          <Text style={styles.value}>{formatAmount(data.montants.total)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Taxes:</Text>
          <Text style={styles.value}>{formatAmount(data.montants.taxe)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Montant final:</Text>
          <Text style={styles.value}>{formatAmount(data.montants.final)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Merci pour votre confiance!</Text>
        <Text>Ce reçu est généré automatiquement et ne nécessite pas de signature.</Text>
      </View>
    </Page>
  </Document>
);

export default PaymentReceiptTemplate; 
