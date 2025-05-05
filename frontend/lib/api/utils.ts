import { StatutCommande } from "./types";

export const getStatusLabel = (status: StatutCommande): string => {
  const statusMap: Record<StatutCommande, string> = {
    reçue: "Reçue",
    payée: "Payée",
    en_impression: "En impression",
    terminée: "Terminée",
    livrée: "Livrée",
  };
  return statusMap[status] || status;
};

/**
 * Formate un montant en devise (FCFA)
 * @param amount - Montant à formater
 * @returns Chaîne formatée
 */
export const formatCurrency = (amount: number): string => {
  // Utiliser l'API Intl.NumberFormat pour formater correctement les montants
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal', // Utiliser 'decimal' au lieu de 'currency' pour éviter le symbole €
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
