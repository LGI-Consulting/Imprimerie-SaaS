import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const materiaux = [
  {
    type_materiau: "Bâches",
    nom: "Bâche standard",
    description: "Matériau polyvalent utilisé pour des applications diverses comme les couvertures, rideaux ou panneaux publicitaires",
    prix_achat: 800, // Prix d'achat par m²
    prix_vente: 1600, // Prix de vente par m²
    unite_mesure: "m2",
    options_disponibles: {
      "Perforation": 0,
      "Œillets": 500,
      "Renfort des bords": 300,
    },
    largeurs: [65, 75, 85, 105, 125, 127, 130, 160, 180, 215, 255, 320],
  },
  {
    type_materiau: "Autocollants",
    nom: "Autocollant premium",
    description: "Matériau adhésif utilisé pour des impressions sur des surfaces lisses comme les vitrines, véhicules ou panneaux publicitaires",
    prix_achat: 750,
    prix_vente: 1500,
    unite_mesure: "m2",
    options_disponibles: {
      "Découpe droite": 0,
      "Découpe à forme": 900,
      "Pelliculage de protection": 400,
    },
    largeurs: [107, 127, 152],
  },
  {
    type_materiau: "Transparent",
    nom: "Film transparent",
    description: "Film transparent utilisé pour des impressions nécessitant de la transparence, comme les films pour fenêtres ou affichages lumineux",
    prix_achat: 1750,
    prix_vente: 3500,
    unite_mesure: "m2",
    options_disponibles: {
      "Découpe droite": 0,
      "Découpe à forme": 1200,
    },
    largeurs: [107, 127],
  },
  {
    type_materiau: "Dos Bleu",
    nom: "Dos bleu standard",
    description: "Matériau avec face arrière bleue utilisé pour des impressions sur fond opaque, comme les posters ou bannières publicitaires",
    prix_achat: 1500,
    prix_vente: 3000,
    unite_mesure: "m2",
    options_disponibles: {
      "Découpe droite": 0,
      "Plastification": 350,
    },
    largeurs: [107, 127],
  },
  {
    type_materiau: "One Way",
    nom: "One way vision",
    description: "Film micro-perforé utilisé pour des impressions sur des fenêtres ou vitrines permettant de voir de l'intérieur vers l'extérieur tout en étant opaque de l'autre côté",
    prix_achat: 2000,
    prix_vente: 4000,
    unite_mesure: "m2",
    options_disponibles: {
      "Découpe aux dimensions": 0,
      "Traitement anti-UV": 600,
    },
    largeurs: [107, 127],
  },
];

const insertMateriau = async (materiau) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Normaliser les options pour s'assurer qu'elles sont toutes des nombres
    const normalizedOptions = {};
    for (const [key, value] of Object.entries(materiau.options_disponibles)) {
      normalizedOptions[key] = typeof value === 'number' ? value : 0;
    }

    // Insérer le matériau
    const insertMateriauQuery = `
      INSERT INTO materiaux (
        type_materiau,
        nom,
        description,
        prix_achat,
        prix_vente,
        unite_mesure,
        options_disponibles
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const materiauResult = await client.query(insertMateriauQuery, [
      materiau.type_materiau,
      materiau.nom,
      materiau.description,
      materiau.prix_achat,
      materiau.prix_vente,
      materiau.unite_mesure,
      normalizedOptions,
    ]);

    const newMateriau = materiauResult.rows[0];

    // Pour chaque largeur, créer un stock et des rouleaux initiaux
    for (const largeur of materiau.largeurs) {
      // Longueur initiale par défaut pour chaque largeur
      const longueurInitiale = 100; // 100 mètres par défaut
      const nombreRouleaux = 2; // 2 rouleaux par largeur par défaut
      const longueurParRouleau = longueurInitiale / nombreRouleaux;

      // Insérer le stock global
      const insertStockQuery = `
        INSERT INTO stocks_materiaux_largeur (
          materiau_id,
          largeur,
          longueur_totale,
          nombre_rouleaux,
          seuil_alerte
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const stockResult = await client.query(insertStockQuery, [
        newMateriau.materiau_id,
        largeur,
        longueurInitiale,
        nombreRouleaux,
        10, // seuil_alerte
      ]);

      const stock = stockResult.rows[0];

      // Créer les rouleaux initiaux
      for (let i = 0; i < nombreRouleaux; i++) {
        const numeroRouleau = `INIT-${newMateriau.materiau_id}-${largeur}-${i + 1}`;
        const prixAchatRouleau = (materiau.prix_achat * longueurParRouleau * (largeur / 100)).toFixed(2);

        const insertRouleauQuery = `
          INSERT INTO rouleaux (
            materiau_id,
            largeur,
            longueur_initiale,
            longueur_restante,
            numero_rouleau,
            date_reception,
            fournisseur,
            prix_achat_total,
            est_actif
          )
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, true)
        `;

        await client.query(insertRouleauQuery, [
          newMateriau.materiau_id,
          largeur,
          longueurParRouleau,
          longueurParRouleau,
          numeroRouleau,
          'Stock initial',
          prixAchatRouleau,
        ]);

        console.log(`Rouleau créé: ${numeroRouleau} (${longueurParRouleau}m)`);
      }
    }

    await client.query("COMMIT");
    console.log(`Matériau ${materiau.type_materiau} inséré avec succès`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      `Erreur lors de l'insertion de ${materiau.type_materiau}:`,
      error
    );
    throw error;
  } finally {
    client.release();
  }
};

const insertAllMateriaux = async () => {
  try {
    for (const materiau of materiaux) {
      await insertMateriau(materiau);
    }
    console.log("Tous les matériaux ont été insérés avec succès");
  } catch (error) {
    console.error("Erreur lors de l'insertion des matériaux:", error);
  } finally {
    pool.end();
  }
};

// Exécuter le script
insertAllMateriaux();
