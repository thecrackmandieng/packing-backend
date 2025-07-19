const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Parking = require('../models/Parking');

// ✅ Créer une réservation
router.post('/', async (req, res) => {
  try {
    const { user, parkingId, car, startTime, endTime } = req.body;

    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    if (parking.availableSpots <= 0) {
      return res.status(400).json({ error: 'Parking is full' });
    }

    const reservationData = {
      user,
      parking: parkingId,
      startTime,
      endTime
    };
    if (car) reservationData.car = car;

    const reservation = new Reservation(reservationData);
    await reservation.save();

    // Décrémente le nombre de places disponibles
    parking.availableSpots -= 1;
    await parking.save();

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Erreur lors de la création de réservation:', error);
    res.status(400).json({ error: 'Erreur lors de la création de réservation', details: error.message });
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
// PATCH : Annuler une réservation
router.patch('/:id/cancel', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Incrémente le nombre de places disponibles
    await Parking.findByIdAndUpdate(reservation.parking, { $inc: { availableSpots: 1 } });

    res.json(reservation);
  } catch (error) {
    console.error('Erreur lors de l’annulation de la réservation:', error);
    res.status(400).json({ error: 'Erreur lors de l’annulation' });
  }
});

// DELETE : Supprimer une réservation
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Incrémente le nombre de places disponibles
    await Parking.findByIdAndUpdate(deleted.parking, { $inc: { availableSpots: 1 } });

    res.json({ message: 'Réservation supprimée avec succès', reservation: deleted });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    res.status(400).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;