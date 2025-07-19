const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // 🔗 Référence au parking (clé étrangère)
  parkingId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parking',
    required: true 
  },

  isOccupied: { type: Boolean, default: false },
  licensePlate: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Place', placeSchema);
