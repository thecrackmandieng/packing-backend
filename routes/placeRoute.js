const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const Parking = require('../models/Parking');

// 1) Récupérer toutes les places avec leur parking (populate)
router.get('/', async (req, res) => {
  try {
    const places = await Place.find().populate('parkingId');
    res.json(places);
  } catch (error) {
    console.error('❌ Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// 2) Récupérer toutes les places d’un parking donné (avec parking rempli aussi)
router.get('/by-parking/:id', async (req, res) => {
  try {
    // Vérifier si l'id parking est un ObjectId valide
    if (!Parking.exists({ _id: req.params.id })) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    const places = await Place.find({ parkingId: req.params.id }).populate('parkingId');
    res.json(places);
  } catch (error) {
    console.error('❌ Error fetching places by parking:', error);
    res.status(500).json({ error: 'Failed to fetch places by parking' });
  }
});

// 3) Ajouter une place (avec vérification que parking existe)
router.post('/', async (req, res) => {
  try {
    const { name, parkingId } = req.body;

    const parkingExists = await Parking.exists({ _id: parkingId });
    if (!parkingExists) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    const newPlace = new Place({ name, parkingId, isOccupied: false });
    await newPlace.save();

    res.status(201).json(newPlace);
  } catch (error) {
    console.error('❌ Error adding place:', error);
    res.status(500).json({ error: 'Failed to add place' });
  }
});

// 4) Mettre à jour une place
router.put('/:id', async (req, res) => {
  try {
    const updatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedPlace) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json(updatedPlace);
  } catch (error) {
    console.error('❌ Error updating place:', error);
    res.status(500).json({ error: 'Failed to update place' });
  }
});

// 5) Supprimer une place
router.delete('/:id', async (req, res) => {
  try {
    const deletedPlace = await Place.findByIdAndDelete(req.params.id);

    if (!deletedPlace) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json({ message: 'Place deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting place:', error);
    res.status(500).json({ error: 'Failed to delete place' });
  }
});

module.exports = router;
