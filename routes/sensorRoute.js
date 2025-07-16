const express = require('express');
const router = express.Router();
const Place = require('../models/Place');

// ➕ Voiture entre
router.post('/entry', async (req, res) => {
  const { placeId, parkingId, licensePlate } = req.body;

  try {
    const updatedPlace = await Place.findByIdAndUpdate(
      placeId,
      { isOccupied: true, licensePlate },
      { new: true }
    );

    if (!updatedPlace) {
      return res.status(404).json({ error: 'Place not found' });
    }

    // 🔁 Diffuser l’événement
    req.app.get('io').emit('carEntry', {
      placeId: updatedPlace._id,
      parkingId: updatedPlace.parkingId,
      licensePlate: updatedPlace.licensePlate
    });

    res.status(200).json({ success: true, place: updatedPlace });
  } catch (err) {
    console.error('Erreur carEntry:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ➖ Voiture sort
router.post('/exit', async (req, res) => {
  const { placeId } = req.body;

  try {
    const updatedPlace = await Place.findByIdAndUpdate(
      placeId,
      { isOccupied: false, licensePlate: null },
      { new: true }
    );

    if (!updatedPlace) {
      return res.status(404).json({ error: 'Place not found' });
    }

    req.app.get('io').emit('carExit', {
      placeId: updatedPlace._id,
      parkingId: updatedPlace.parkingId
    });

    res.status(200).json({ success: true, place: updatedPlace });
  } catch (err) {
    console.error('Erreur carExit:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
