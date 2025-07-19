const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Parking = require('../models/Parking');
const upload = require('../upload'); // multer pour gestion image

// Helper : vérifier validité ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Créer un parking avec image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const parkingData = {
      ...req.body,
      image: req.file ? req.file.filename : null
    };

    const parking = new Parking(parkingData);
    await parking.save();
    res.status(201).json(parking);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la création du parking', details: error.message });
  }
});

// Obtenir tous les parkings
router.get('/', async (req, res) => {
  try {
    const parkings = await Parking.find();
    res.json(parkings);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des parkings' });
  }
});

// Obtenir un parking par ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'ID de parking invalide' });
  }
  try {
    const parking = await Parking.findById(id);
    if (!parking) {
      return res.status(404).json({ error: 'Parking non trouvé' });
    }
    res.json(parking);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du parking' });
  }
});

// Obtenir les espaces occupés et restants d'un parking
router.get('/:id/space', async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'ID de parking invalide' });
  }
  try {
    const parking = await Parking.findById(id).populate('cars');
    if (!parking) {
      return res.status(404).json({ error: 'Parking non trouvé' });
    }

    const occupiedSpaces = parking.cars.length;
    const remainingSpaces = parking.capacity - occupiedSpaces;

    res.json({ occupiedSpaces, remainingSpaces });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du calcul des espaces' });
  }
});

// Mettre à jour un parking
router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'ID de parking invalide' });
  }
  try {
    const parking = await Parking.findByIdAndUpdate(id, req.body, { new: true });
    if (!parking) {
      return res.status(404).json({ error: 'Parking non trouvé' });
    }
    res.json(parking);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour', details: error.message });
  }
});

// Supprimer un parking
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'ID de parking invalide' });
  }
  try {
    const parking = await Parking.findByIdAndDelete(id);
    if (!parking) {
      return res.status(404).json({ error: 'Parking non trouvé' });
    }
    res.json({ message: 'Parking supprimé avec succès', parking });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du parking' });
  }
});

module.exports = router;
