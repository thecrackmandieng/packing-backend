const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  name: String,
  location: String,
  capacity: Number,
  image: String, // Nouveau champ
  cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }]
});

module.exports = mongoose.model('Parking', parkingSchema);
