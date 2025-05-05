import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const materiaux = [
  {
    type_materiau: "Bâches",
    description:
      "Matériau polyvalent utilisé pour des applications diverses comme les couvertures, rideaux ou panneaux publicitaires",
    prix_unitaire: 1600,
    unite_mesure: "m2",
    options_disponibles: {
      "Perforation": 0,
      "Œillets": 500, // Remplacé par un prix fixe au lieu de "supplément selon nombre et espacement"
      "Renfort des bords": 300, // Remplacé par un prix fixe au lieu de "supplément"
    },
    largeurs: [65, 75, 85, 105, 125, 127, 130, 160, 180, 215, 255, 320],
  },
  {
    type_materiau: "Autocollants",
    description:
      "Matériau adhésif utilisé pour des impressions sur des surfaces lisses comme les vitrines, véhicules ou panneaux publicitaires",
    prix_unitaire: 1500,
    unite_mesure: "m2",
    options_disponibles: {
      "Découpe droite": 0,
      "Découpe à forme": 900,
      "Pelliculage de protection": 400, // Remplacé par un prix fixe au lieu de "supplément"
    },
    largeurs: [107, 127, 152],
  },
  {
    type_materiau: "Transparent",
    description:
      "Film transparent utilisé pour des impressions nécessitant de la transparence, comme les films pour fenêtres ou affichages lumineux",
    prix_unitaire: 3500,
    unite_mesure: "m2",
    options_disponibles: {
      "Découpe droite": 0,
      "Découpe à forme": 1200, // Remplacé par un prix fixe au lieu de "supplément"
    },
    largeurs: [107, 127],
  },
  {
    type_materiau: "Dos Bleu",
    description:
      "Matériau avec face arrière bleue utilisé pour des impressions sur fond opaque, comme les posters ou bannières publicitaires",
    prix_unitaire: 3000,
    unite_mesure: "m2",
    options_disponibles: {
      "Découpe droite": 0,
      "Plastification": 350, // Remplacé par un prix fixe au lieu de "supplément"
    },
    largeurs: [107, 127],
  },
  {
    type_materiau: "One Way",
    description:
      "Film micro-perforé utilisé pour des impressions sur des fenêtres ou vitrines permettant de voir de l'intérieur vers l'extérieur tout en étant opaque de l'autre côté",
    prix_unitaire: 4000,
    unite_mesure: "m2",
    options_disponibles: {
      "Découpe aux dimensions": 0,
      "Traitement anti-UV": 600, // Remplacé par un prix fixe au lieu de "supplément"
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
      // Convertir toutes les valeurs en nombres
      normalizedOptions[key] = typeof value === 'number' ? value : 0;
    }

    // Insérer le matériau
    const insertMateriauQuery = `
            INSERT INTO materiaux (
                type_materiau,
                description,
                prix_unitaire,
                unite_mesure,
                options_disponibles
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

    const materiauResult = await client.query(insertMateriauQuery, [
      materiau.type_materiau,
      materiau.description,
      materiau.prix_unitaire,
      materiau.unite_mesure,
      normalizedOptions, // Utiliser les options normalisées
    ]);

    const newMateriau = materiauResult.rows[0];

    // Insérer les stocks pour chaque largeur
    const insertStockQuery = `
            INSERT INTO stocks_materiaux_largeur (
                materiau_id,
                largeur,
                longeur_en_stock,
                seuil_alerte
            )
            VALUES ($1, $2, $3, $4)
        `;

    for (const largeur of materiau.largeurs) {
      await client.query(insertStockQuery, [
        newMateriau.materiau_id,
        largeur,
        100,
        10,
      ]);
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
