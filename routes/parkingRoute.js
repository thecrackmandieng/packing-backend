const express = require('express');
const router = express.Router();
const Parking = require('../models/Parking');
const upload = require('../upload'); // <-- importe multer


// Créer un parking avec image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const parkingData = {
      ...req.body,
      image: req.file ? req.file.filename : null
    };

    const parking = new Parking(parkingData);
    await parking.save();
    res.status(201).send(parking);
  } catch (error) {
    res.status(400).send(error);
  }
});
// Obtenir tous les parkings
router.get('/', async (req, res) => {
  try {
    const parkings = await Parking.find();
    res.send(parkings);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Obtenir un parking par ID
router.get('/:id', async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) {
      return res.status(404).send();
    }
    res.send(parking);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Obtenir les espaces occupés et restants d'un parking
router.get('/:id/space', async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id).populate('cars');
    if (!parking) {
      return res.status(404).send({ error: 'Parking not found' });
    }

    const occupiedSpaces = parking.cars.length;
    const remainingSpaces = parking.capacity - occupiedSpaces;

    res.send({
      occupiedSpaces,
      remainingSpaces
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Mettre à jour un parking
router.patch('/:id', async (req, res) => {
  try {
    const parking = await Parking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!parking) {
      return res.status(404).send();
    }
    res.send(parking);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Supprimer un parking
router.delete('/:id', async (req, res) => {
  try {
    const parking = await Parking.findByIdAndDelete(req.params.id);
    if (!parking) {
      return res.status(404).send();
    }
    res.send(parking);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
