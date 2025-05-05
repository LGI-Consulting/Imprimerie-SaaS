import api from "./config";
import { PrintFile } from "./types";

// Fonctions pour les fichiers
export const Files = {
  // Récupérer un fichier par son ID
  getById: async (fileId: number): Promise<PrintFile> => {
    const response = await api.get<PrintFile>(`/files/${fileId}`);
    return response.data;
  },

  // Récupérer tous les fichiers d'une commande
  getByOrderId: async (orderId: number): Promise<PrintFile[]> => {
    const response = await api.get<PrintFile[]>(`/commandes/${orderId}/files`);
    return response.data;
  },

  // Télécharger un fichier
  download: async (fileId: number): Promise<Blob> => {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Prévisualiser un fichier (retourne l'URL)
  getPreviewUrl: (fileId: number): string => {
    return `/api/files/${fileId}/preview`;
  },

  // Supprimer un fichier
  delete: async (fileId: number): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },

  // Uploader des fichiers pour une commande
  upload: async (orderId: number, files: File[]): Promise<PrintFile[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post(`/commandes/${orderId}/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};

export default Files;
