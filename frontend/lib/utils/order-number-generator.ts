// /home/geekobueno/LGI-CODING/Imprimerie-SaaS/frontend/lib/utils/order-number-generator.ts

/**
 * Génère un numéro de commande unique au format CMD-TIMESTAMP-RANDOM
 * où TIMESTAMP est les 8 derniers chiffres du timestamp actuel
 * et RANDOM est un nombre aléatoire entre 0 et 999
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `CMD-${timestamp}-${random}`;
};

/**
 * Vérifie si un numéro de commande est valide
 */
export const isValidOrderNumber = (orderNumber: string): boolean => {
  const regex = /^CMD-\d{8}-\d{1,3}$/;
  return regex.test(orderNumber);
};
