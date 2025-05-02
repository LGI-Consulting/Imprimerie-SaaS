import type { Materiau, StockMateriauxLargeur } from "@/lib/api/types";

interface Dimensions {
  largeur: number;
  longueur: number;
}

interface OptionDetail {
  option: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface PriceCalculationResult {
  totalPrice: number;
  unitPrice: number;
  area: number;
  selectedWidth: number;
  materialLengthUsed: number;
  optionsCost: number;
  optionsDetails: OptionDetail[];
  basePrice: number;
  isDG: boolean;
}

export const calculateMaterialPrice = (
  width: number,
  length: number,
  unitPrice: number
): number => {
  const area = (width * length) / 10000; // Convert cm² to m²
  return area * unitPrice;
};

export const findSuitableMaterialWidth = (
  requestedWidth: number,
  availableWidths: number[]
): number => {
  const widthWithMargin = requestedWidth + 5;
  return (
    availableWidths.find((w) => w >= widthWithMargin) ||
    Math.max(...availableWidths)
  );
};

export const generateOrderNumber = (): string => {
  return `CMD-${Date.now().toString().slice(-8)}-${Math.floor(
    Math.random() * 1000
  )}`;
};

export const isSpecialDGOrder = (clientName: string): boolean => {
  return clientName.toLowerCase().startsWith("d-g");
};

export const verifyStockAvailability = (
  requestedLength: number,
  quantity: number,
  stockLength: number
): { available: boolean; message?: string } => {
  const materialLengthUsed = (requestedLength / 100) * quantity; // en mètres

  if (materialLengthUsed > stockLength) {
    return {
      available: false,
      message: `Stock insuffisant (${materialLengthUsed.toFixed(
        2
      )}m demandés, ${stockLength.toFixed(2)}m disponibles)`,
    };
  }

  return { available: true };
};

export const calculateOptionsPrice = (
  options: Record<string, any>,
  materialOptions: Record<string, any>,
  areaSqM: number,
  numExemplaires: number
): { totalCost: number; optionsDetails: OptionDetail[] } => {
  let additionalCosts = 0;
  const optionsDetails: OptionDetail[] = [];

  if (!options || !materialOptions) {
    return { totalCost: 0, optionsDetails: [] };
  }

  Object.entries(options).forEach(([key, val]) => {
    if (key === "comments") return;

    const opt = materialOptions[key];
    if (opt) {
      let cost = 0;
      if (opt.type === "fixed") cost = opt.price || 0;
      else if (opt.type === "per_sqm") cost = areaSqM * (opt.price || 0);
      else if (opt.type === "per_unit" && val.quantity)
        cost = val.quantity * (opt.price || 0);

      if (!opt.is_free) {
        const totalCost = cost * numExemplaires;
        additionalCosts += totalCost;
        optionsDetails.push({
          option: key,
          quantity: val.quantity || 1,
          unit_price: cost,
          total_price: totalCost,
        });
      }
    }
  });

  return { totalCost: additionalCosts, optionsDetails };
};

export const calculateOrderPrice = (
  material: Materiau,
  stock: StockMateriauxLargeur,
  dimensions: Dimensions,
  quantity: number,
  options?: Record<string, any>,
  isSpecialOrder: boolean = false
): PriceCalculationResult => {
  const requestedWidth = dimensions.largeur;
  const requestedLength = dimensions.longueur;

  // Sélection de la largeur appropriée
  const selectedWidth = findSuitableMaterialWidth(requestedWidth, [
    stock.largeur,
  ]);
  const calculationWidth = selectedWidth - 5; // Applique la règle des -5cm

  // Calculs prix et surface
  const areaSqM = (calculationWidth * requestedLength) / 10000;
  const totalAreaSqM = areaSqM * quantity;
  const materialLengthUsed = (requestedLength / 100) * quantity; // en mètres

  // Vérification stock
  const stockCheck = verifyStockAvailability(
    requestedLength,
    quantity,
    stock.longeur_en_stock
  );
  if (!stockCheck.available) {
    throw new Error(stockCheck.message);
  }

  // Calcul du prix de base
  const unitPrice = calculateMaterialPrice(
    calculationWidth,
    requestedLength,
    material.prix_unitaire
  );
  const basePrice = unitPrice * quantity;

  // Calcul des options
  const { totalCost: optionsCost, optionsDetails } = calculateOptionsPrice(
    options || {},
    material.options_disponibles || {},
    areaSqM,
    quantity
  );

  // Calcul du prix total
  const totalPrice = isSpecialOrder ? 0 : basePrice + optionsCost;

  return {
    totalPrice,
    unitPrice,
    area: totalAreaSqM,
    selectedWidth,
    materialLengthUsed,
    optionsCost,
    optionsDetails,
    basePrice,
    isDG: isSpecialOrder,
  };
};
