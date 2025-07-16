const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Parking = require('../models/Parking');

// ✅ Créer une réservation
router.post('/', async (req, res) => {
  try {
    const { user, parkingId, car, startTime, endTime } = req.body;

    const parking = await Parking.findById(parkingId).populate('cars');
    if (!parking) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    if (parking.cars.length >= parking.capacity) {
      return res.status(400).json({ error: 'Parking is full' });
    }

    const reservation = new Reservation({
      user,
      parking: parkingId,
      car,
      startTime,
      endTime
    });

    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    console.error('Erreur lors de la création de réservation:', error);
    res.status(400).json({ error: 'Erreur lors de la création de réservation' });
  }
});

// ✅ Obtenir toutes les réservations avec détails complets
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'nom prenom email telephone')
      .populate('parking', 'name')
      .populate('car', 'licensePlate');
    res.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// ✅ Annuler une réservation
router.patch('/:id/cancel', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ error: 'Réservation non trouvées' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Erreur lors de l’annulation de la réservation:', error);
    res.status(400).json({ error: 'Erreur lors de l’annulation' });
  }
});

// ✅ Supprimer une réservation
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    res.json({ message: 'Réservation supprimée avec succès', reservation: deleted });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    res.status(400).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;
