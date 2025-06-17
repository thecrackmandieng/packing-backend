const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking' }
});

module.exports = mongoose.model('Car', carSchema);
