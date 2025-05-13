import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { OrderInvoiceData, OrderDetailData, OptionData } from './types';
import { formatCurrency } from '../api/utils';

// Styles pour le document PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  logo: {
    width: 100,
    height: 50,
    marginRight: 10,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: '#555555',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 10,
    flexDirection: 'column',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tableRowEven: {
    backgroundColor: '#F9F9F9',
  },
  tableHeader: {
    backgroundColor: '#EEEEEE',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  tableCellNarrow: {
    width: '10%',
    padding: 5,
    fontSize: 10,
  },
  tableCellMedium: {
    width: '15%',
    padding: 5,
    fontSize: 10,
  },
  tableCellWide: {
    width: '40%',
    padding: 5,
    fontSize: 10,
  },
  tableCellRight: {
    textAlign: 'right',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  totalSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalLabel: {
    width: '20%',
    textAlign: 'right',
    paddingRight: 10,
    fontWeight: 'bold',
  },
  totalValue: {
    width: '15%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#555555',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  statusBadge: {
    padding: 5,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  statusReceived: {
    backgroundColor: '#FFF9C4',
    color: '#F57F17',
  },
  statusPaid: {
    backgroundColor: '#BBDEFB',
    color: '#1565C0',
  },
  statusPrinting: {
    backgroundColor: '#E1BEE7',
    color: '#6A1B9A',
  },
  statusCompleted: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
  statusDelivered: {
    backgroundColor: '#B2DFDB',
    color: '#00695C',
  },
  paymentMethod: {
    marginTop: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 3,
    fontSize: 10,
    textAlign: 'center',
  },
  commentSection: {
    marginTop: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 3,
    fontSize: 10,
  },
});

// Composant pour afficher le badge de statut
const StatusBadge = ({ status }: { status: string }) => {
  let style;
  switch (status.toLowerCase()) {
    case 'reçue':
      style = styles.statusReceived;
      break;
    case 'payée':
      style = styles.statusPaid;
      break;
    case 'en_impression':
      style = styles.statusPrinting;
      break;
    case 'terminée':
      style = styles.statusCompleted;
      break;
    case 'livrée':
      style = styles.statusDelivered;
      break;
    default:
      style = {};
  }

  return (
    <View style={[styles.statusBadge, style]}>
      <Text>{status.toUpperCase()}</Text>
    </View>
  );
};

// Composant principal pour le template de facture
const OrderInvoiceTemplate = ({ data, format = 'A4' }: { data: OrderInvoiceData; format: 'A4' | 'A5' }) => {
  // Extraire les options de tous les détails de commande
  const allOptions: OptionData[] = [];
  data.details.forEach(detail => {
    if (detail.options && detail.options.length > 0) {
      allOptions.push(...detail.options);
    }
  });

  // Calculer les totaux
  const subtotalItems = data.details.reduce((sum, detail) => sum + (detail.prix_unitaire * detail.quantite), 0);
  const subtotalOptions = allOptions.reduce((sum, option) => sum + option.total_price, 0);
  const discountAmount = data.remise ? data.remise.montant_applique : 0;
  const totalAmount = subtotalItems + subtotalOptions - discountAmount;

  return (
    <Document>
      <Page size={format} style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>IMPRIMERIE SAAS</Text>
            <Text style={styles.companyDetails}>123 Rue de l'Impression, 75000 Paris</Text>
            <Text style={styles.companyDetails}>Tél: +33 1 23 45 67 89 | Email: contact@imprimerie-saas.com</Text>
          </View>
          <View style={{ width: 100 }}>
            <StatusBadge status={data.statut} />
            <Text style={styles.paymentMethod}>
              {data.situation_paiement === 'comptant' ? 'PAIEMENT COMPTANT' : 'PAIEMENT À CRÉDIT'}
            </Text>
          </View>
        </View>

        {/* Titre */}
        <Text style={styles.title}>
          {data.statut === "proforma" ? "FACTURE PROFORMA" : "FACTURE"} N° {data.numero_commande}
        </Text>

        {/* Informations client et commande */}
        <View style={styles.row}>
          {/* Colonne gauche: Client */}
          <View style={{ width: '50%' }}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CLIENT</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Nom:</Text>
                <Text style={styles.value}>{data.client.prenom} {data.client.nom}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Téléphone:</Text>
                <Text style={styles.value}>{data.client.telephone}</Text>
              </View>
              {data.client.email && (
                <View style={styles.row}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{data.client.email}</Text>
                </View>
              )}
              {data.client.adresse && (
                <View style={styles.row}>
                  <Text style={styles.label}>Adresse:</Text>
                  <Text style={styles.value}>{data.client.adresse}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Colonne droite: Commande */}
          <View style={{ width: '50%' }}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DÉTAILS DE LA COMMANDE</Text>
              <View style={styles.row}>
                <Text style={styles.label}>N° Commande:</Text>
                <Text style={styles.value}>{data.numero_commande}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>
                  {new Date(data.date_creation).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Statut:</Text>
                <Text style={styles.value}>{data.statut.toUpperCase()}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Paiement:</Text>
                <Text style={styles.value}>
                  {data.situation_paiement === 'comptant' ? 'Comptant' : 'Crédit'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tableau des articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ARTICLES COMMANDÉS</Text>
          <View style={styles.table}>
            {/* En-tête du tableau */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellWide]}>Matériau</Text>
              <Text style={[styles.tableCell, styles.tableCellMedium]}>Dimensions</Text>
              <Text style={[styles.tableCellNarrow, styles.tableCellCenter]}>Qté</Text>
              <Text style={[styles.tableCellMedium, styles.tableCellRight]}>Prix unitaire</Text>
              <Text style={[styles.tableCellMedium, styles.tableCellRight]}>Total</Text>
            </View>

            {/* Corps du tableau */}
            {data.details.map((detail, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCell, styles.tableCellWide]}>
                  {detail.materiau?.type_materiau || 'Matériau non spécifié'}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellMedium]}>
                  {detail.dimensions || 'N/A'}
                </Text>
                <Text style={[styles.tableCellNarrow, styles.tableCellCenter]}>
                  {detail.quantite}
                </Text>
                <Text style={[styles.tableCellMedium, styles.tableCellRight]}>
                  {formatCurrency(detail.prix_unitaire)}
                </Text>
                <Text style={[styles.tableCellMedium, styles.tableCellRight]}>
                  {formatCurrency(detail.prix_unitaire * detail.quantite)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tableau des options (si présentes) */}
        {allOptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OPTIONS SÉLECTIONNÉES</Text>
            <View style={styles.table}>
              {/* En-tête du tableau des options */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableCellWide]}>Option</Text>
                <Text style={[styles.tableCellNarrow, styles.tableCellCenter]}>Qté</Text>
                <Text style={[styles.tableCellMedium, styles.tableCellRight]}>Prix unitaire</Text>
                <Text style={[styles.tableCellMedium, styles.tableCellRight]}>Total</Text>
              </View>

              {/* Corps du tableau des options */}
              {allOptions.map((option, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}>
                  <Text style={[styles.tableCell, styles.tableCellWide]}>
                    {option.name}
                  </Text>
                  <Text style={[styles.tableCellNarrow, styles.tableCellCenter]}>
                    {option.quantity}
                  </Text>
                  <Text style={[styles.tableCellMedium, styles.tableCellRight]}>
                    {formatCurrency(option.unit_price)}
                  </Text>
                  <Text style={[styles.tableCellMedium, styles.tableCellRight]}>
                    {formatCurrency(option.total_price)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Section des commentaires (si présents) */}
        {data.commentaires && data.commentaires.trim() !== '' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMMENTAIRES</Text>
            <View style={styles.commentSection}>
              <Text>{data.commentaires}</Text>
            </View>
          </View>
        )}

        {/* Récapitulatif des totaux */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total articles:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotalItems)}</Text>
          </View>
          
          {allOptions.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total options:</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotalOptions)}</Text>
            </View>
          )}
          
          {data.remise && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Remise 
                {data.remise.type === 'pourcentage' ? ` (${data.remise.valeur}%)` : ''}:
              </Text>
              <Text style={styles.totalValue}>-{formatCurrency(discountAmount)}</Text>
            </View>
          )}
          
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>Merci pour votre confiance. Pour toute question concernant cette facture, veuillez nous contacter.</Text>
          <Text>IMPRIMERIE SAAS - SIRET: 123 456 789 00010 - TVA: FR12 123 456 789</Text>
        </View>
      </Page>
    </Document>
  );
};

export default OrderInvoiceTemplate;
