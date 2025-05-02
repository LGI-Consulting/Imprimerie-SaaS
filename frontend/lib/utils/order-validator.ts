// /home/geekobueno/LGI-CODING/Imprimerie-SaaS/frontend/lib/utils/order-validator.ts

import type { Client } from "@/lib/api/types";

interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface OrderValidationData {
  clientInfo: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
  };
  width?: number;
  length?: number;
  quantity?: number;
  materialType?: string;
  options?: Record<string, any>;
}

export const validateClient = (
  clientInfo: OrderValidationData["clientInfo"]
): ValidationResult => {
  if (!clientInfo.nom || clientInfo.nom.trim() === "") {
    return { valid: false, message: "Le nom du client est requis" };
  }

  if (!clientInfo.prenom || clientInfo.prenom.trim() === "") {
    return { valid: false, message: "Le prénom du client est requis" };
  }

  if (!clientInfo.telephone || clientInfo.telephone.trim() === "") {
    return { valid: false, message: "Le téléphone du client est requis" };
  }

  if (clientInfo.email && !isValidEmail(clientInfo.email)) {
    return { valid: false, message: "L'email du client est invalide" };
  }

  return { valid: true };
};

export const validateDimensions = (
  width?: number,
  length?: number
): ValidationResult => {
  if (!width || isNaN(width) || width <= 0) {
    return { valid: false, message: "La largeur doit être supérieure à 0" };
  }

  if (!length || isNaN(length) || length <= 0) {
    return { valid: false, message: "La longueur doit être supérieure à 0" };
  }

  return { valid: true };
};

export const validateQuantity = (quantity?: number): ValidationResult => {
  if (!quantity || isNaN(quantity) || quantity <= 0) {
    return { valid: false, message: "La quantité doit être supérieure à 0" };
  }

  return { valid: true };
};

export const validateMaterial = (materialType?: string): ValidationResult => {
  if (!materialType || materialType.trim() === "") {
    return { valid: false, message: "Le type de matériau est requis" };
  }

  return { valid: true };
};

export const validateOrder = (data: OrderValidationData): ValidationResult => {
  // Validation du client
  const clientValidation = validateClient(data.clientInfo);
  if (!clientValidation.valid) {
    return clientValidation;
  }

  // Validation des dimensions
  const dimensionsValidation = validateDimensions(data.width, data.length);
  if (!dimensionsValidation.valid) {
    return dimensionsValidation;
  }

  // Validation de la quantité
  const quantityValidation = validateQuantity(data.quantity);
  if (!quantityValidation.valid) {
    return quantityValidation;
  }

  // Validation du matériau
  const materialValidation = validateMaterial(data.materialType);
  if (!materialValidation.valid) {
    return materialValidation;
  }

  return { valid: true };
};

// Fonction utilitaire pour valider les emails
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
