import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReceiptData } from './types';
import { paiements } from '../api/paiements';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 12,
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontSize: 10,
  },
  value: {
    width: '70%',
    fontSize: 10,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  col1: { width: '40%' },
  col2: { width: '20%' },
  col3: { width: '20%' },
  col4: { width: '20%' },
  amounts: {
    marginTop: 20,
    marginBottom: 20,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  total: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
  },
});

const PaymentReceiptTemplate: React.FC<{ data: ReceiptData }> = ({ data }) => {
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  const formatAmount = (amount: number) => {
    return paiements.formatAmount(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Image src="/logo.png" style={styles.logo} />
          <View>
            <Text style={styles.title}>REÇU DE PAIEMENT</Text>
            <Text style={styles.invoiceNumber}>N° {data.numero_facture}</Text>
            <Text style={styles.date}>Date: {formatDate(data.date_emission)}</Text>
          </View>
        </View>

        {/* Informations client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLIENT</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{data.client.nom} {data.client.prenom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Téléphone:</Text>
            <Text style={styles.value}>{data.client.telephone}</Text>
          </View>
        </View>

        {/* Détails de la commande */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DÉTAILS DE LA COMMANDE</Text>
          <Text style={styles.value}>Commande N° {data.commande.numero}</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Description</Text>
              <Text style={styles.col2}>Dimensions</Text>
              <Text style={styles.col3}>Quantité</Text>
              <Text style={styles.col4}>Prix</Text>
            </View>
            {data.commande.details.map((detail, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{detail.description}</Text>
                <Text style={styles.col2}>{detail.dimensions || '-'}</Text>
                <Text style={styles.col3}>{detail.quantite}</Text>
                <Text style={styles.col4}>{formatAmount(detail.prix_unitaire)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Détails du paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DÉTAILS DU PAIEMENT</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Méthode:</Text>
            <Text style={styles.value}>{paiements.getPaymentMethodLabel(data.paiement.methode)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Montant reçu:</Text>
            <Text style={styles.value}>{formatAmount(data.paiement.montant_recu)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Monnaie rendue:</Text>
            <Text style={styles.value}>{formatAmount(data.paiement.monnaie_rendue)}</Text>
          </View>
          {data.paiement.reference && (
            <View style={styles.row}>
              <Text style={styles.label}>Référence:</Text>
              <Text style={styles.value}>{data.paiement.reference}</Text>
            </View>
          )}
        </View>

        {/* Montants */}
        <View style={styles.amounts}>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Sous-total:</Text>
            <Text style={styles.value}>{formatAmount(data.montants.sous_total)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Remise:</Text>
            <Text style={styles.value}>{formatAmount(data.montants.remise)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.total}>Total: {formatAmount(data.montants.total)}</Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>Merci de votre confiance!</Text>
          <Text>Pour toute question, contactez-nous au +225 07 07 07 07 07</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PaymentReceiptTemplate; 