const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const { connection } = require('./config/database.js');
const usersRoutes = require('./routes/userRoutes.js');
const rentalStatusesRoutes = require('./routes/rentalStatuseRoutes.js');
const { verifyDb } = require('./config/database.js');

const app = express();
const PORT = 8000;
const nameDB = process.env.database_name;

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api/users', usersRoutes);
app.use('/api/rentalStatus', rentalStatusesRoutes);

app.listen(PORT, () => {
  console.log('Escuchando en el puerto ' + PORT);
});

verifyDb(nameDB);
