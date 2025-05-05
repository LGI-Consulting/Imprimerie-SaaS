import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReceiptData } from './types';
import { paiements } from '../api/paiements';

// Styles pour le ticket de caisse
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: 'Helvetica',
    fontSize: 8,
    width: '80mm', // Largeur standard pour ticket de caisse
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
    textAlign: 'center',
  },
  invoiceNumber: {
    fontSize: 8,
    marginBottom: 3,
    textAlign: 'center',
  },
  date: {
    fontSize: 8,
    marginBottom: 5,
    textAlign: 'center',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
    marginVertical: 5,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  label: {
    fontSize: 8,
  },
  value: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 10,
    fontSize: 7,
    textAlign: 'center',
  },
  thankyou: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  }
});

const PaymentReceiptTemplate: React.FC<{ data: ReceiptData }> = ({ data }) => {
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  return (
    <Document>
      <Page size={[226, 400]} style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.companyName}>IMPRIMERIE SAAS</Text>
          <Text style={styles.title}>TICKET DE CAISSE</Text>
          <Text style={styles.invoiceNumber}>N° {data.numero_facture}</Text>
          <Text style={styles.date}>Le {formatDate(data.date_emission)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Informations client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLIENT</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{data.client.nom} {data.client.prenom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tél:</Text>
            <Text style={styles.value}>{data.client.telephone}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Détails de la commande */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMMANDE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>N° Commande:</Text>
            <Text style={styles.value}>{data.commande.numero}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Détails du paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAIEMENT</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Mode:</Text>
            <Text style={styles.value}>{data.paiement.methode}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Montant payé:</Text>
            <Text style={styles.value}>{paiements.formatAmount(data.paiement.montant_recu)}</Text>
          </View>
          {data.paiement.monnaie_rendue > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Monnaie rendue:</Text>
              <Text style={styles.value}>{paiements.formatAmount(data.paiement.monnaie_rendue)}</Text>
            </View>
          )}
          {data.paiement.reference && (
            <View style={styles.row}>
              <Text style={styles.label}>Réf. Transaction:</Text>
              <Text style={styles.value}>{data.paiement.reference}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={styles.thankyou}>MERCI DE VOTRE CONFIANCE !</Text>
          <Text>IMPRIMERIE SAAS</Text>
          <Text>123 Rue de l'Impression</Text>
          <Text>Tél: +225 07 07 07 07 07</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PaymentReceiptTemplate; 