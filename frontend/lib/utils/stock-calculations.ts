import type { Materiau, StockMateriauxLargeur, SurfaceCalculation } from "../api/types";

/**
 * Calcule la surface disponible pour un stock spécifique en fonction de l'unité de mesure
 */
export function calculateStockSurface(
  stock: StockMateriauxLargeur,
  uniteMesure: string
): number {
  // Conversion de largeur et longueur en cm vers m
  const largeurEnM = stock.largeur / 100;
  const longueurEnM = stock.longeur_en_stock / 100;
  
  if (uniteMesure === "cm") {
    // Pour les matériaux mesurés en cm, calcul en m²
    return largeurEnM * longueurEnM;
  } else if (uniteMesure === "cm_lineaire") {
    // Pour les matériaux linéaires, on retourne la longueur en m
    return longueurEnM;
  } else {
    // Pour les autres unités (ex: unité), on retourne simplement la quantité
    return stock.longeur_en_stock;
  }
}

/**
 * Calcule la valeur monétaire d'un stock spécifique
 */
export function calculateStockValue(
  stock: StockMateriauxLargeur,
  materiau: Materiau
): number {
  const surface = calculateStockSurface(stock, materiau.unite_mesure);
  return surface * materiau.prix_unitaire;
}

/**
 * Calcule la surface totale disponible pour tous les stocks d'un matériau
 */
export function calculateTotalSurface(
  materiau: Materiau,
  stocks: StockMateriauxLargeur[]
): number {
  return stocks.reduce((total, stock) => {
    return total + calculateStockSurface(stock, materiau.unite_mesure);
  }, 0);
}

/**
 * Calcule la valeur totale de l'inventaire d'un matériau
 */
export function calculateTotalValue(
  materiau: Materiau,
  stocks: StockMateriauxLargeur[]
): number {
  return stocks.reduce((total, stock) => {
    return total + calculateStockValue(stock, materiau);
  }, 0);
}

/**
 * Retourne les détails complets de surface et valeur pour un stock
 */
export function getStockDetails(
  stock: StockMateriauxLargeur,
  materiau: Materiau
): SurfaceCalculation {
  const surface = calculateStockSurface(stock, materiau.unite_mesure);
  return {
    largeur: stock.largeur,
    longueur: stock.longeur_en_stock,
    surfaceM2: surface,
    valeur: surface * materiau.prix_unitaire,
  };
}

/**
 * Vérifie si un stock est en-dessous de son seuil d'alerte
 */
export function isLowStock(stock: StockMateriauxLargeur): boolean {
  return stock.longeur_en_stock <= stock.seuil_alerte;
}

/**
 * Vérifie si un stock est épuisé
 */
export function isOutOfStock(stock: StockMateriauxLargeur): boolean {
  return stock.longeur_en_stock <= 0;
}

/**
 * Retourne la couleur d'alerte en fonction du niveau de stock
 */
export function getStockAlertColor(stock: StockMateriauxLargeur): string {
  if (isOutOfStock(stock)) {
    return "red";
  } else if (isLowStock(stock)) {
    return "yellow";
  } else {
    return "green";
  }
}

/**
 * Formate l'affichage de la longueur avec unité
 */
export function formatStockLength(longueur: number, unite: string): string {
  if (unite === "cm" || unite === "cm_lineaire") {
    return `${longueur.toFixed(0)} cm`;
  } else {
    return `${longueur.toFixed(2)} ${unite}`;
  }
}

/**
 * Formate l'affichage de la surface selon l'unité de mesure
 */
export function formatSurfaceDisplay(materiau: Materiau, surface: number): string {
  if (materiau.unite_mesure === "cm") {
    return `${surface.toFixed(2)} m²`;
  } else if (materiau.unite_mesure === "cm_lineaire") {
    return `${surface.toFixed(2)} m`;
  } else {
    return `${surface.toFixed(0)} ${materiau.unite_mesure}`;
  }
} 