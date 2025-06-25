const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, adresse, email, motDePasse } = req.body;

    if (!nom || !prenom || !adresse || !email || !motDePasse) {
      return res.status(400).send({ error: 'Tous les champs sont requis' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already in use' });
    }

    const user = new User({ nom, prenom, adresse, email, motDePasse });
    await user.save();

    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(400).send({ error: 'Registration failed', details: error.message });
  }
});


// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(motDePasse))) {
      return res.status(401).send({ error: 'Login failed! Check authentication credentials' });
    }

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.send({
      token,
      role: user.role // Inclure le rôle de l'utilisateur dans la réponse
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Déconnexion
router.post('/logout', (req, res) => {
  // La déconnexion côté serveur avec JWT est généralement gérée côté client en supprimant le token
  res.send({ message: 'Logged out successfully' });
});

module.exports = router;
