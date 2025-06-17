const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const Parking = require('../models/Parking');

// Enregistrer une voiture dans un parking
router.post('/register', async (req, res) => {
  try {
    const { licensePlate, brand, model, owner, parkingId } = req.body;

    // Vérifier si le parking existe et a de la capacité
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).send({ error: 'Parking not found' });
    }

    if (parking.cars.length >= parking.capacity) {
      return res.status(400).send({ error: 'Parking is full' });
    }

    // Créer une nouvelle voiture
    const car = new Car({ licensePlate, brand, model, owner, parking: parkingId });
    await car.save();

    // Ajouter la voiture au parking
    parking.cars.push(car._id);
    await parking.save();

    res.status(201).send(car);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Obtenir toutes les voitures
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().populate('owner', 'username').populate('parking', 'name');
    res.send(cars);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Supprimer une voiture d'un parking
router.delete('/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).send({ error: 'Car not found' });
    }

    // Retirer la voiture du parking
    await Parking.updateOne({ _id: car.parking }, { $pull: { cars: car._id } });

    res.send(car);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
