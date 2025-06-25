const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Parking = require('../models/Parking');

// Endpoint pour obtenir les statistiques du tableau de bord
router.get('/stats', async (req, res) => {
  try {
    const numberOfReservations = await Reservation.countDocuments();
    const parkings = await Parking.find();
    const availableSpots = parkings.reduce((sum, parking) => {
      return sum + (parking.capacity - parking.cars.length);
    }, 0);
    const numberOfParkings = parkings.length;

    res.json({
      numberOfReservations,
      availableSpots,
      numberOfParkings
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).send({ error: 'Failed to fetch dashboard stats' });
  }
});

// Endpoint pour obtenir les données de réservations hebdomadaires
router.get('/weekly-reservations', async (req, res) => {
  try {
    // Calculer la date de début de la semaine en cours
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Commence le dimanche
    startOfWeek.setHours(0, 0, 0, 0);

    // Récupérer les réservations pour la semaine en cours
    const weeklyReservations = await Reservation.aggregate([
      {
        $match: {
          startTime: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$startTime" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    console.log('Weekly Reservations:', weeklyReservations); // Ajoutez un log pour vérifier les résultats de l'agrégation

    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const data = daysOfWeek.map((day, index) => {
      const dayData = weeklyReservations.find(item => item._id === index + 1);
      return dayData ? dayData.count : 0;
    });

    res.json({
      labels: daysOfWeek,
      data
    });
  } catch (error) {
    console.error('Error fetching weekly reservations:', error);
    res.status(500).send({ error: 'Failed to fetch weekly reservations' });
  }
});

module.exports = router;
