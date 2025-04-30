import type { Materiau, StockMateriauxLargeur } from "@/lib/api/types";

interface Dimensions {
  largeur: number;
  longueur: number;
}

export const calculateMaterialPrice = (width: number, length: number, unitPrice: number): number => {
  const area = (width * length) / 10000; // Convert cm² to m²
  return area * unitPrice;
};

export const findSuitableMaterialWidth = (requestedWidth: number, availableWidths: number[]): number => {
  const widthWithMargin = requestedWidth + 5;
  return availableWidths.find((w) => w >= widthWithMargin) || Math.max(...availableWidths);
};

export const calculateOrderPrice = (
  material: Materiau,
  stock: StockMateriauxLargeur,
  dimensions: Dimensions,
  quantity: number
): {
  totalPrice: number;
  unitPrice: number;
  area: number;
  selectedWidth: number;
  materialLengthUsed: number;
} => {
  const requestedWidth = dimensions.largeur;
  const requestedLength = dimensions.longueur;

  // Sélection de la largeur appropriée
  const selectedWidth = findSuitableMaterialWidth(requestedWidth, [stock.largeur]);
  const calculationWidth = selectedWidth - 5; // Applique la règle des -5cm

  // Calculs prix et surface
  const areaSqM = (calculationWidth * requestedLength) / 10000;
  const totalAreaSqM = areaSqM * quantity;
  const materialLengthUsed = (requestedLength / 100) * quantity; // en mètres

  // Vérification stock
  if (materialLengthUsed > stock.longeur_en_stock) {
    throw new Error(`Stock insuffisant (${materialLengthUsed}m demandés, ${stock.longeur_en_stock}m disponibles)`);
  }

  // Calcul du prix
  const unitPrice = calculateMaterialPrice(calculationWidth, requestedLength, material.prix_unitaire);
  const totalPrice = unitPrice * quantity;

  return {
    totalPrice,
    unitPrice,
    area: totalAreaSqM,
    selectedWidth,
    materialLengthUsed
  };
}; 