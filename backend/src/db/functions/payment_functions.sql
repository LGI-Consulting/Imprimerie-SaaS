-- Fonction pour obtenir les détails de paiement d'une commande
CREATE OR REPLACE FUNCTION get_commande_payment_details(commande_id_param INTEGER)
RETURNS TABLE (
    montant_total DECIMAL,
    montant_paye DECIMAL,
    reste_a_payer DECIMAL,
    situation_paiement VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH commande_details AS (
        SELECT 
            c.commande_id,
            c.situation_paiement,
            COALESCE(SUM(dc.sous_total), 0) as total_commande
        FROM commandes c
        LEFT JOIN details_commande dc ON c.commande_id = dc.commande_id
        WHERE c.commande_id = commande_id_param
        GROUP BY c.commande_id, c.situation_paiement
    ),
    paiements_valides AS (
        SELECT 
            COALESCE(SUM(p.montant), 0) as total_paye
        FROM paiements p
        WHERE p.commande_id = commande_id_param
        AND p.statut = 'validé'
    )
    SELECT 
        cd.total_commande as montant_total,
        pv.total_paye as montant_paye,
        cd.total_commande - pv.total_paye as reste_a_payer,
        cd.situation_paiement
    FROM commande_details cd
    CROSS JOIN paiements_valides pv;
END;
$$ LANGUAGE plpgsql; 