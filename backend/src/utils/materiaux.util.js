export const buildStockJson = () => `
  COALESCE(json_agg(json_build_object(
    'stock_id', s.stock_id,
    'largeur', s.largeur,
    'quantite_en_stock', s.quantite_en_stock,
    'unite_mesure', s.unite_mesure,
    'seuil_alerte', s.seuil_alerte
  )) FILTER (WHERE s.stock_id IS NOT NULL), '[]') as stocks
`;

export const buildMateriauQueryBase = (condition = '') => `
  SELECT m.*, ${buildStockJson()}
  FROM materiaux m
  LEFT JOIN stocks_materiaux_largeur s ON m.materiau_id = s.materiau_id
  ${condition}
  GROUP BY m.materiau_id
  ORDER BY m.type_materiau, m.nom
`;
