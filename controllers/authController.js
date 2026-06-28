const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/connection.js');
const {
  isValidEmail,
  isValidPhoneNumber,
} = require('../helpers/validators.js');

const loginUser = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    const query = `SELECT id, user_email, user_password FROM users WHERE user_email = ?`;
    const [users] = await db.query(query, [user_email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const user = users[0];

    const match = await bcrypt.compare(user_password, user.user_password);

    if (!match) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const payload = {
      id: user.id,
      email: user.user_email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    res.cookie('token_futbol5', token, {
      httpOnly: true,
      secure: process.env.secure_cookie, //ponerlo en true cuando se suba a produccion.
      sameSite: 'lax',
      // path: '/',
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login exitoso',
    });
  } catch (error) {
    console.log('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const registerUser = async (req, res) => {
  let connection;
  try {
    const { user_email, user_password, user_name, user_dni, user_phone } =
      req.body;

    if (!isValidEmail(user_email)) {
      return res.status(400).json({ message: 'Email inválido.' });
    }
    if (!isValidPhoneNumber(user_phone)) {
      return res.status(400).json({ message: 'Número de teléfono inválido.' });
    }

    connection = await db.getConnection();

    const checkQuery = `
      SELECT u.id FROM users u
      LEFT JOIN user_details d ON u.id = d.id_user
      WHERE u.user_email = ? OR d.user_dni = ? OR d.user_phone = ?
    `;
    const [existingUsers] = await connection.query(checkQuery, [
      user_email,
      user_dni,
      user_phone,
    ]);

    if (existingUsers.length > 0) {
      connection.release();
      return res
        .status(409)
        .json({ message: 'El email, DNI o teléfono ya están registrados.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user_password, saltRounds);
    const registerDate = new Date();
    const idStatus = 1;

    await connection.beginTransaction();

    try {
      const insertUserQuery = `
        INSERT INTO users (user_email, user_password, register_date, id_rental_status) 
        VALUES (?, ?, ?, ?)
      `;
      const [userResult] = await connection.query(insertUserQuery, [
        user_email,
        hashedPassword,
        registerDate,
        idStatus,
      ]);
      const newUserId = userResult.insertId;

      const insertDetailsQuery = `
        INSERT INTO user_details (id_user, user_name, user_dni, user_phone) 
        VALUES (?, ?, ?, ?)
      `;
      await connection.query(insertDetailsQuery, [
        newUserId,
        user_name,
        user_dni,
        user_phone,
      ]);

      await connection.commit();

      res.status(201).json({
        message: 'Registro exitoso',
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { loginUser, registerUser };
