const mysql2 = require('mysql2/promise');
const pool = require('../config/connection.js');
const axios = require('axios');

async function verifyDb(db_name) {
  let connection;

  try {
    connection = await mysql2.createConnection({
      host: process.env.host,
      user: process.env.user_db,
      password: process.env.password_db,
    });
    
    const [rows] = await connection.query('SHOW DATABASES LIKE ?', [db_name]);

    const exist = rows.length > 0;

    if (!exist) {
      console.log('La base de datos no existe, creando base de datos...');

      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${db_name}\``);
      await connection.query(`USE \`${db_name}\``);

      const tables = [
        `CREATE TABLE IF NOT EXISTS field_statuses (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    field_status_name VARCHAR(50) NOT NULL
                )`,
        `CREATE TABLE IF NOT EXISTS field_category (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    category_name VARCHAR(50) NOT NULL,
                    field_capacity INT NOT NULL
                )`,
        `CREATE TABLE IF NOT EXISTS rental_statuses (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    rental_status_name VARCHAR(50) NOT NULL
                )`,
        `CREATE TABLE IF NOT EXISTS employee_statuses (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    employee_status_name VARCHAR(50) NOT NULL
                )`,
        `CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_email VARCHAR(120) NOT NULL UNIQUE,
                user_password VARCHAR(255) NOT NULL, -- Ampliamos a 255 porque el hash de bcrypt es largo
                register_date DATE NOT NULL,
                id_rental_status INT NOT NULL,
                CONSTRAINT fk_rentalStatus_user
                    FOREIGN KEY (id_rental_status)
                    REFERENCES rental_statuses(id)
                    ON DELETE RESTRICT 
                    ON UPDATE CASCADE
            )`,
        `CREATE TABLE IF NOT EXISTS user_details (
                id INT PRIMARY KEY AUTO_INCREMENT,
                id_user INT NOT NULL UNIQUE,
                user_name VARCHAR(120) NOT NULL,
                user_dni VARCHAR(50) NOT NULL UNIQUE,
                user_phone VARCHAR(20) NOT NULL UNIQUE,
                CONSTRAINT fk_user_details
                    FOREIGN KEY (id_user)
                    REFERENCES users(id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            )`,
        `CREATE TABLE IF NOT EXISTS facilities (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    address VARCHAR(250) NOT NULL
                )`,
        `CREATE TABLE IF NOT EXISTS fields (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    id_facility INT NOT NULL,
                    id_field_status INT NOT NULL,
                    id_field_category INT NOT NULL,
                    hourly_price DECIMAL(6, 2),
                    CONSTRAINT fk_facility_field
                        FOREIGN KEY (id_facility)
                        REFERENCES facilities(id)
                        ON UPDATE CASCADE
                        ON DELETE RESTRICT,
                    CONSTRAINT fk_fieldStatus_field
                        FOREIGN KEY (id_field_status)
                        REFERENCES field_statuses(id)
                        ON UPDATE CASCADE
                        ON DELETE RESTRICT,
                    CONSTRAINT fk_fieldCategory_field
                        FOREIGN KEY (id_field_category)
                        REFERENCES field_category(id)
                        ON UPDATE CASCADE
                        ON DELETE RESTRICT
                )`,
        `CREATE TABLE IF NOT EXISTS rental (
                    id_rental INT PRIMARY KEY AUTO_INCREMENT,
                    id_field INT NOT NULL,
                    rental_price DECIMAL(6, 2) NOT NULL,
                    id_user INT NOT NULL,
                    rental_date DATE NOT NULL,
                    rental_start TIME NOT NULL,
                    rental_end TIME NOT NULL,
                    CONSTRAINT fk_idField_rental
                        FOREIGN KEY (id_field)
                        REFERENCES fields(id)
                        ON UPDATE CASCADE
                        ON DELETE RESTRICT,
                    CONSTRAINT fk_idUser_rental
                        FOREIGN KEY (id_user)
                        REFERENCES users(id)
                        ON UPDATE CASCADE
                        ON DELETE RESTRICT
                )`,
        `CREATE TABLE IF NOT EXISTS employee_details (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    id_status_employee INT NOT NULL,
                    phone_employee VARCHAR(50) NOT NULL,
                    dni_employee VARCHAR(15) NOT NULL,
                    name_employee VARCHAR(250) NOT NULL,
                    CONSTRAINT fk_employeeDetails_status
                        FOREIGN KEY (id_status_employee)
                        REFERENCES employee_statuses(id)
                        ON UPDATE CASCADE
                        ON DELETE RESTRICT
                )`,
        `CREATE TABLE IF NOT EXISTS employee (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    id_facility INT NOT NULL,
                    id_employee_details INT NOT NULL,
                    CONSTRAINT fk_idFacility_employee
                        FOREIGN KEY (id_facility)
                        REFERENCES facilities(id)
                        ON UPDATE CASCADE
                        ON DELETE RESTRICT,
                    CONSTRAINT fk_idEmployeeDetails_employee
                        FOREIGN KEY (id_employee_details)
                        REFERENCES employee_details(id)
                        ON UPDATE CASCADE
                        ON DELETE RESTRICT
                )`,
      ];

      for (const query of tables) {
        await connection.query(query);
      }
    } else {
      console.log('La base de datos existe.');
    }
  } catch (error) {
    console.log(error);
  }
}

// async function insertData() {
//   try{
//     await pool.beginTransaction();

//     const insertRentalStatuses = `INSERT INTO rental_Statuses (rental_status_name) VALUES (?)`
//     const rentalStatusesValues = 
//   }catch(error) {
//     console.log(error);
//   }
// }

module.exports = {
  verifyDb,
};
