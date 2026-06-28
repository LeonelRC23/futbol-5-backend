const db = require('../config/connection.js');
const {
  isValidEmail,
  isValidPhoneNumber,
} = require('../helpers/validators.js');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const queryGet = `SELECT u.id, u.id_rol, u.user_email, u.register_date, u.id_rental_status, d.user_name, d.user_dni, d.user_phone 
        FROM users u JOIN user_details d ON u.id = d.id_user `;
    const [users] = await db.query(queryGet);
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT u.id, u.user_email, u.register_date, u.id_rental_status, 
             d.user_name, d.user_dni, d.user_phone, u.id_rol 
      FROM users u
      JOIN user_details d ON u.id = d.id_user
      WHERE u.id = ?
    `;
    const [user] = await db.query(query, [id]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.status(200).json(user[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

const createUser = async (req, res) => {
  let connection;

  try {
    const {
      user_email,
      user_password,
      user_name,
      user_dni,
      user_phone,
      id_rol,
    } = req.body;

    const register_date = new Date();
    const id_rental_status = 1;

    if (!isValidEmail(user_email)) {
      return res.status(400).json({ message: 'Email inválido.' });
    }

    if (!isValidPhoneNumber(user_phone)) {
      return res.status(400).json({ message: 'Número de teléfono inválido.' });
    }

    connection = await db.getConnection();

    const checkQuery = `SELECT u.id 
      FROM users u
      LEFT JOIN user_details d ON u.id = d.id_user
      WHERE u.user_email = ? OR d.user_dni = ? OR d.user_phone = ?`;
    const [existingUsers] = await connection.query(checkQuery, [
      user_email,
      user_dni,
      user_phone,
    ]);

    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({ message: 'Datos ingresados ya existentes.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user_password, saltRounds);

    await connection.beginTransaction();

    try {
      const insertUserQuery = `
          INSERT INTO users (user_email, user_password, register_date, id_rental_status, id_rol) 
          VALUES (?, ?, ?, ?, ?)
      `;
      const [userResult] = await connection.query(insertUserQuery, [
        user_email,
        hashedPassword,
        register_date,
        id_rental_status,
        id_rol || 2,
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
      res.status(201).json({ message: 'Usuario creado y protegido con éxito' });
    } catch (error) {
      console.log(error);
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    if (connection) connection.release();
  }
};

const updateUser = async (req, res) => {
  let connection;
  try {
    const {
      id,
      user_email,
      user_password,
      user_name,
      user_dni,
      user_phone,
      id_rental_status,
      id_rol,
    } = req.body;

    if (!isValidEmail(user_email)) {
      return res.status(400).json({ message: 'Email invalido.' });
    }
    if (!isValidPhoneNumber(user_phone)) {
      return res.status(400).json({ message: 'Numero de telefono invalido.' });
    }

    const checkQuery = `
      SELECT u.id FROM users u
      LEFT JOIN user_details d ON u.id = d.id_user
      WHERE (u.user_email = ? OR d.user_dni = ? OR d.user_phone = ?) AND u.id != ?
    `;
    const [existingUsers] = await db.query(checkQuery, [
      user_email,
      user_dni,
      user_phone,
      id,
    ]);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'El email, DNI o Teléfono ya está en uso por otro usuario.',
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let updateUserQuery = `UPDATE users SET user_email = ?, id_rental_status = ?, id_rol = ?`;
      let queryParams = [user_email, id_rental_status, id_rol];

      if (user_password && user_password.trim() !== '') {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user_password, saltRounds);
        updateUserQuery += `, user_password = ?`;
        queryParams.push(hashedPassword);
      }

      updateUserQuery += ` WHERE id = ?`;
      queryParams.push(id);

      await connection.query(updateUserQuery, queryParams);

      const updateDetailsQuery = `UPDATE user_details SET user_name = ?, user_dni = ?, user_phone = ? WHERE id_user = ?`;
      await connection.query(updateDetailsQuery, [
        user_name,
        user_dni,
        user_phone,
        id,
      ]);

      await connection.commit();
      res.status(200).json({ message: 'Usuario actualizado correctamente.' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.query(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'El usuario no existe o ya fue eliminado.' });
    }

    res.status(200).json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.log('Error al eliminar el usuario.', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const checkAdminRole = (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole === 1) {
      return res.status(200).json({ isAdmin: true });
    } else {
      return res.status(403).json({
        isAdmin: false,
        message: 'Acceso denegado. Se requiere rol de Administrador.',
      });
    }
  } catch (error) {
    console.error('Error al verificar rol:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
