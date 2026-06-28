const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const { connection } = require('./config/database.js');
const usersRoutes = require('./routes/userRoutes.js');
const rentalStatusesRoutes = require('./routes/rentalStatuseRoutes.js');
const employeeStatusRoutes = require('./routes/employeeStatusRoutes.js');
const employeeRoutes = require('./routes/employeeRoutes.js');
const facilityRoutes = require('./routes/facilityRoutes.js');
const fieldStatusRoutes = require('./routes/fieldStatusRoute.js');
const fieldCategoryRoutes = require('./routes/fieldCategoryRoutes.js');
const fieldRoutes = require('./routes/fieldRoutes.js');
const rentalRoutes = require('./routes/rentalRoutes.js');
const { verifyDb } = require('./config/database.js');

const app = express();
const PORT = 8000;
const nameDB = process.env.database_name;
app.use(
  cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], //usar ambos origins durante el desarrollo
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/users', usersRoutes);
app.use('/api/rentalStatuses', rentalStatusesRoutes);
app.use('/api/employeeStatuses', employeeStatusRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/fieldStatuses', fieldStatusRoutes);
app.use('/api/fieldCategories', fieldCategoryRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/rental', rentalRoutes);

app.listen(PORT, () => {
  console.log('Escuchando en el puerto ' + PORT);
});

verifyDb(nameDB);
