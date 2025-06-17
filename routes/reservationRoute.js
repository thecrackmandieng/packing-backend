const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Parking = require('../models/Parking');

// Créer une réservation
router.post('/', async (req, res) => {
  try {
    const { user, parkingId, car, startTime, endTime } = req.body;

    // Vérifier si le parking existe et a de la capacité
    const parking = await Parking.findById(parkingId).populate('cars');
    if (!parking) {
      return res.status(404).send({ error: 'Parking not found' });
    }

    if (parking.cars.length >= parking.capacity) {
      return res.status(400).send({ error: 'Parking is full' });
    }

    // Créer une nouvelle réservation
    const reservation = new Reservation({
      user,
      parking: parkingId,
      car,
      startTime,
      endTime
    });

    await reservation.save();
    res.status(201).send(reservation);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Obtenir toutes les réservations
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'username')
      .populate('parking', 'name')
      .populate('car', 'licensePlate');
    res.send(reservations);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Annuler une réservation
router.patch('/:id/cancel', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).send({ error: 'Reservation not found' });
    }

    res.send(reservation);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
