const express = require('express');
require('dotenv').config();
const { connection } = require('./config/database.js');
const usersRoutes = require('./routes/userRoutes.js');
const { verifyDb } = require('./config/database.js');

const app = express();
const PORT = 8000;
const nameDB = process.env.database;

app.use('/api/users', usersRoutes);

app.listen(PORT, () => {
  console.log('Escuchando en el puerto ' + PORT);
});

verifyDb(nameDB);
