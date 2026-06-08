const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');

const connection = await mysql2.createConnection({
    host: localhost,
    user: process.env.user_db,
    password: process.env.password_db,
    database: process.env.database
});