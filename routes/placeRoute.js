const express = require('express');
const router = express.Router();
const Place = require('../models/Place'); // Assurez-vous que le modèle Place est importé

// Obtenir toutes les places
router.get('/', async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).send({ error: 'Failed to fetch places' });
  }
});

// Ajouter une nouvelle place
router.post('/', async (req, res) => {
  try {
    const { name, parkingId } = req.body;
    const newPlace = new Place({ name, parkingId, isOccupied: false });
    await newPlace.save();
    res.status(201).send(newPlace);
  } catch (error) {
    console.error('Error adding place:', error);
    res.status(500).send({ error: 'Failed to add place' });
  }
});

module.exports = router;
