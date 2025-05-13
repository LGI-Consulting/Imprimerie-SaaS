import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const migrateStockToRouleaux = async () => {
  const client = await pool.connect();
  try {
    console.log("Début de la migration des stocks vers les rouleaux...");

    // Récupérer tous les stocks existants
    const stocksQuery = `
      SELECT s.*, m.type_materiau, m.nom as materiau_nom
      FROM stocks_materiaux_largeur s
      JOIN materiaux m ON s.materiau_id = m.materiau_id
      WHERE s.longeur_en_stock > 0
    `;

    const stocksResult = await client.query(stocksQuery);
    const stocks = stocksResult.rows;

    console.log(`${stocks.length} stocks trouvés à migrer`);

    await client.query("BEGIN");

    for (const stock of stocks) {
      // Calculer le nombre de rouleaux virtuels à créer
      // On suppose une longueur moyenne de 50m par rouleau
      const longueurMoyenneRouleau = 50;
      const nombreRouleaux = Math.ceil(stock.longeur_en_stock / longueurMoyenneRouleau);
      
      console.log(`Migration du stock: ${stock.materiau_nom} (${stock.largeur}cm)`);
      console.log(`Longueur totale: ${stock.longeur_en_stock}m`);
      console.log(`Nombre de rouleaux à créer: ${nombreRouleaux}`);

      // Créer les rouleaux virtuels
      for (let i = 0; i < nombreRouleaux; i++) {
        const longueurRouleau = i === nombreRouleaux - 1 
          ? stock.longeur_en_stock - (i * longueurMoyenneRouleau) // Dernier rouleau
          : longueurMoyenneRouleau;

        const numeroRouleau = `MIG-${stock.materiau_id}-${stock.largeur}-${i + 1}`;

        // Insérer le rouleau
        const insertRouleauQuery = `
          INSERT INTO rouleaux (
            materiau_id,
            largeur,
            longueur_initiale,
            longueur_restante,
            numero_rouleau,
            fournisseur,
            prix_achat_total,
            est_actif
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
          RETURNING *
        `;

        await client.query(insertRouleauQuery, [
          stock.materiau_id,
          stock.largeur,
          longueurRouleau,
          longueurRouleau,
          numeroRouleau,
          'Migration',
          0, // Prix d'achat inconnu pour les stocks existants
        ]);

        console.log(`Rouleau créé: ${numeroRouleau} (${longueurRouleau}m)`);
      }

      // Mettre à jour le stock global
      const updateStockQuery = `
        UPDATE stocks_materiaux_largeur
        SET 
          longueur_totale = $1,
          nombre_rouleaux = $2,
          date_modification = CURRENT_TIMESTAMP
        WHERE stock_id = $3
      `;

      await client.query(updateStockQuery, [
        stock.longeur_en_stock,
        nombreRouleaux,
        stock.stock_id,
      ]);
    }

    await client.query("COMMIT");
    console.log("Migration terminée avec succès !");

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur lors de la migration:", error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

// Exécuter la migration
migrateStockToRouleaux().catch(console.error); 