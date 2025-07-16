const mongoose = require('mongoose');
const Reservation = require('./models/Reservation');
const User = require('./models/User');
const Parking = require('./models/Parking');
const Car = require('./models/Car');

async function enrichReservations() {
  await mongoose.connect('mongodb://localhost:27017/parkingDB'); // adapter ton URI

  const reservations = await Reservation.find();

  for (const resv of reservations) {
    const user = await User.findById(resv.user);
    const parking = await Parking.findById(resv.parking);
    const car = await Car.findById(resv.car);

    if (user && parking && car) {
      resv.user = {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone
      };

      resv.parking = {
        _id: parking._id,
        name: parking.name
      };

      resv.car = {
        _id: car._id,
        licensePlate: car.licensePlate
      };

      await resv.save();
      console.log(`Reservation ${resv._id} mise à jour.`);
    } else {
      console.log(`Données manquantes pour reservation ${resv._id}`);
    }
  }

  mongoose.disconnect();
}

enrichReservations().catch(console.error);
