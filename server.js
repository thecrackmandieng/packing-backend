// ─────────────────────────────────────────────
// 1. Dépendances
// ─────────────────────────────────────────────
const express      = require('express');
const http         = require('http');
const mongoose     = require('mongoose');
const bodyParser   = require('body-parser');
const cors         = require('cors');
const { Server }   = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Routes métier
const parkingRoutes     = require('./routes/parkingRoute');
const authRoutes        = require('./routes/authRoute');
const carRoutes         = require('./routes/carRoute');
const reservationRoutes = require('./routes/reservationRoute');
const dashboardRoutes   = require('./routes/dashboardRoute');
const sensorRoutes      = require('./routes/sensorRoute');   // Entrée / sortie véhicules
const placeRoutes       = require('./routes/placeRoute');    // ➕ / 🔍 places

const Place = require('./models/Place');

// ─────────────────────────────────────────────
// 2. Initialisation Express + HTTP + Socket.io
// ─────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});
app.set('io', io); // rendre l'instance io accessible dans req.app.get('io')

// ─────────────────────────────────────────────
// 3. Middlewares
// ─────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// ─────────────────────────────────────────────
// 4. Connexion MongoDB
// ─────────────────────────────────────────────
mongoose.connect('mongodb://localhost:27017/parkingDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connecté'))
.catch((err) => console.error('❌ Connexion MongoDB échouée', err));

// ─────────────────────────────────────────────
// 5. Routes REST
// ─────────────────────────────────────────────
app.use('/api/parking',     parkingRoutes);
app.use('/api/auth',        authRoutes);
app.use('/api/car',         carRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/sensor',      sensorRoutes);
app.use('/api/place',       placeRoutes);

// ─────────────────────────────────────────────
// 6. WebSocket (Socket.io)
// ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🟢 Client WebSocket connecté');
  socket.on('disconnect', () => console.log('🔴 Client WebSocket déconnecté'));
});

// ─────────────────────────────────────────────
// 7. Communication avec Arduino via port série
// ─────────────────────────────────────────────
/* const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', async (line) => {
  const [event, id] = line.trim().split(',');
  const parkingId = Number(id);

  if (!parkingId || (event !== 'ENTRY' && event !== 'EXIT')) return;

  try {
    const place = await Place.findOne({ parkingId });
    if (!place) return;

    if (event === 'ENTRY') {
      place.isOccupied = true;
      place.licensePlate = 'UNKNOWN';
      await place.save();
      io.emit('carEntry', {
        placeId: place._id,
        parkingId: place.parkingId,
        licensePlate: place.licensePlate
      });
    }

    if (event === 'EXIT') {
      place.isOccupied = false;
      place.licensePlate = '';
      await place.save();
      io.emit('carExit', {
        placeId: place._id,
        parkingId: place.parkingId
      });
    }
  } catch (err) {
    console.error('❌ Erreur traitement ligne série:', err);
  }
});
 */
// ─────────────────────────────────────────────
// 8. Lancement du serveur
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket opérationnels sur http://localhost:${PORT}`);
});
