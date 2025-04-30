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

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
  }).format(amount);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
