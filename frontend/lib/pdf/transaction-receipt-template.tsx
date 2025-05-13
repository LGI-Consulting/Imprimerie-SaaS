import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types pour les données du reçu
interface TransactionReceiptData {
  transaction_id: number;
  date_transaction: string;
  type_transaction: string;
  montant: string | number;
  solde_avant: string | number;
  solde_apres: string | number;
  commentaire: string | null;
  reference_transaction: string | null;
  employe: string;
  client: {
    nom: string;
    prenom: string;
    telephone: string;
  };
}

// Styles pour le document PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    padding: 5,
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginVertical: 10,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
});

// Fonction pour formater les dates
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
};

// Fonction pour formater les montants
const formatAmount = (amount: string | number) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numericAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' FCFA';
};

// Fonction pour obtenir le libellé du type de transaction
const getTransactionLabel = (type: string) => {
  switch (type) {
    case 'depot':
      return 'Dépôt';
    case 'retrait':
      return 'Retrait';
    case 'imputation_dette':
      return 'Imputation de dette';
    case 'paiement_dette':
      return 'Paiement de dette';
    default:
      return type;
  }
};

// Template du reçu de transaction
const TransactionReceiptTemplate: React.FC<{ data: TransactionReceiptData }> = ({ data }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>IMPRIMERIE LGI</Text>
        <Text>Agbalépédogan, non loin du CEG</Text>
        <Text>Tél: +228 90 90 90 90</Text>
        <Text style={[styles.title, { marginTop: 20 }]}>REÇU DE TRANSACTION</Text>
        <Text style={styles.subtitle}>N° {data.transaction_id.toString().padStart(6, "0")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations Client</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nom:</Text>
          <Text style={styles.value}>{data.client.prenom} {data.client.nom}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Téléphone:</Text>
          <Text style={styles.value}>{data.client.telephone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails de la Transaction</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{getTransactionLabel(data.type_transaction)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(data.date_transaction)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Montant:</Text>
          <Text style={styles.value}>{formatAmount(data.montant)}</Text>
        </View>
        {data.reference_transaction && (
          <View style={styles.row}>
            <Text style={styles.label}>Référence:</Text>
            <Text style={styles.value}>{data.reference_transaction}</Text>
          </View>
        )}
        {data.commentaire && (
          <View style={styles.row}>
            <Text style={styles.label}>Commentaire:</Text>
            <Text style={styles.value}>{data.commentaire}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Récapitulatif</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Solde avant:</Text>
          <Text style={styles.value}>{formatAmount(data.solde_avant)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Solde après:</Text>
          <Text style={styles.value}>{formatAmount(data.solde_apres)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Opérateur:</Text>
          <Text style={styles.value}>{data.employe}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Merci pour votre confiance!</Text>
        <Text>Ce reçu est généré automatiquement et ne nécessite pas de signature.</Text>
        <Text style={{ marginTop: 10 }}>Imprimerie LGI - RCCM: TG-LOM-01-2022-B13-00099 - NIF: 1001595341</Text>
      </View>
    </Page>
  </Document>
);

export default TransactionReceiptTemplate;