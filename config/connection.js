const mysql2 = require('mysql2/promise');

const pool = mysql2.createPool({
  host: process.env.host,
  user: process.env.user_db,
  password: process.env.password_db,
  database: process.env.database_name,
});

module.exports = pool;
