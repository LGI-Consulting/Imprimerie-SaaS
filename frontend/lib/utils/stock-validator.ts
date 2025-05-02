// /home/geekobueno/LGI-CODING/Imprimerie-SaaS/frontend/lib/utils/stock-validator.ts

import type { StockMateriauxLargeur } from "@/lib/api/types";

interface StockValidationResult {
  available: boolean;
  message?: string;
  materialLengthUsed: number;
  remainingStock: number;
}

/**
 * Vérifie si le stock est suffisant pour une commande
 * @param requestedLength Longueur demandée en cm
 * @param quantity Quantité demandée
 * @param stock Information sur le stock disponible
 */
export const validateStock = (
  requestedLength: number,
  quantity: number,
  stock: StockMateriauxLargeur
): StockValidationResult => {
  console.log('validateStock - Entrée:', { 
    requestedLength, 
    quantity, 
    stock: {
      largeur: stock.largeur,
      longeur_en_stock: stock.longeur_en_stock,
      seuil_alerte: stock.seuil_alerte
    }
  });

  // Conversion en mètres
  const materialLengthUsed = (requestedLength / 100) * quantity;
  const remainingStock = stock.longeur_en_stock - materialLengthUsed;

  console.log('validateStock - Calculs:', { 
    materialLengthUsed, 
    remainingStock, 
    stockSuffisant: materialLengthUsed <= stock.longeur_en_stock 
  });

  if (materialLengthUsed > stock.longeur_en_stock) {
    const result = {
      available: false,
      message: `Stock insuffisant (${materialLengthUsed.toFixed(
        2
      )}m demandés, ${stock.longeur_en_stock.toFixed(2)}m disponibles)`,
      materialLengthUsed,
      remainingStock: -remainingStock,
    };
    console.log('validateStock - Résultat (insuffisant):', result);
    return result;
  }

  // Alerte si le stock est bas après la commande
  if (remainingStock < stock.seuil_alerte) {
    const result = {
      available: true,
      message: `Attention: le stock sera bas après cette commande (${remainingStock.toFixed(
        2
      )}m restants)`,
      materialLengthUsed,
      remainingStock,
    };
    console.log('validateStock - Résultat (bas):', result);
    return result;
  }

  const result = {
    available: true,
    materialLengthUsed,
    remainingStock,
  };
  console.log('validateStock - Résultat (ok):', result);
  return result;
};

/**
 * Trouve la largeur de matériau appropriée pour une largeur demandée
 */
export const findSuitableMaterialWidth = (
  requestedWidth: number,
  availableWidths: number[]
): number => {
  console.log('findSuitableMaterialWidth - Entrée:', { 
    requestedWidth, 
    availableWidths 
  });
  
  const widthWithMargin = requestedWidth + 5; // Ajoute 5cm de marge
  
  const suitableWidth = availableWidths.find((w) => w >= widthWithMargin) ||
    Math.max(...availableWidths);
  
  console.log('findSuitableMaterialWidth - Résultat:', { 
    widthWithMargin, 
    suitableWidth 
  });
  
  return suitableWidth;
};
