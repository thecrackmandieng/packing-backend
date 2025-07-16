const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const parkingRoutes = require('./routes/parkingRoute');
const authRoutes = require('./routes/authRoute');
const carRoutes = require('./routes/carRoute');
const reservationRoutes = require('./routes/reservationRoute');
const dashboardRoutes = require('./routes/dashboardRoute'); // Assurez-vous que le chemin est correct

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/parkingDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/parking', parkingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/car', carRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/dashboard', dashboardRoutes); // Utilisez la route du tableau de bord

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
