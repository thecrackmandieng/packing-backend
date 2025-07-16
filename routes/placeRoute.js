const express = require('express');
const router = express.Router();
const Place = require('../models/Place'); // Modèle Place

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

// Mettre à jour une place par ID
router.put('/:id', async (req, res) => {
  try {
    const placeId = req.params.id;
    const updateData = req.body;

    const updatedPlace = await Place.findByIdAndUpdate(placeId, updateData, { new: true });

    if (!updatedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.json(updatedPlace);
  } catch (error) {
    console.error('Error updating place:', error);
    res.status(500).json({ error: 'Failed to update place' });
  }
});

// Supprimer une place par ID (optionnel)
router.delete('/:id', async (req, res) => {
  try {
    const placeId = req.params.id;
    const deletedPlace = await Place.findByIdAndDelete(placeId);

    if (!deletedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.json({ message: 'Place deleted successfully' });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({ error: 'Failed to delete place' });
  }
});

module.exports = router;
