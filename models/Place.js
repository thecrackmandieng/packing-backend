const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parkingId: { type: Number, required: true },
  isOccupied: { type: Boolean, required: true },
  licensePlate: { type: String }
});

module.exports = mongoose.model('Place', placeSchema);
