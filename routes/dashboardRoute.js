const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Parking = require('../models/Parking');
const Place = require('../models/Place'); // ✅ Import du modèle Place

// ─────────────────────────────
// ▶️ GET /api/dashboard/stats
// ─────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const numberOfReservations = await Reservation.countDocuments();
    const numberOfParkings = await Parking.countDocuments();

    const totalSpots = await Place.countDocuments();
    const occupiedSpots = await Place.countDocuments({ isOccupied: true });
    const availableSpots = totalSpots - occupiedSpots;

    res.json({
      numberOfReservations,
      numberOfParkings,
      totalSpots,
      occupiedSpots,
      availableSpots
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ─────────────────────────────────────────────
// ▶️ GET /api/dashboard/weekly-reservations
// ─────────────────────────────────────────────
router.get('/weekly-reservations', async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyReservations = await Reservation.aggregate([
      { $match: { startTime: { $gte: startOfWeek } } },
      { $group: { _id: { $dayOfWeek: "$startTime" }, count: { $sum: 1 } } },
      { $sort: { "_id": 1 } }
    ]);

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
    console.error('❌ Error fetching weekly reservations:', error);
    res.status(500).json({ error: 'Failed to fetch weekly reservations' });
  }
});

module.exports = router;
