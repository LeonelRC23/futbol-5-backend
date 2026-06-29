const pool = require('../config/connection.js');

const getRentals = async (req, res) => {
  try {
    const query = `
            SELECT 
                r.id_rental,
                r.rental_price,
                r.rental_date,
                r.rental_start,
                r.rental_end,
                f.id AS id_field,
                fac.address AS facility_address,
                fc.category_name,
                u.id AS id_user,
                u.user_email,
                ud.user_name,
                ud.user_phone
            FROM rental r
            JOIN fields f ON r.id_field = f.id
            JOIN facilities fac ON f.id_facility = fac.id
            JOIN field_category fc ON f.id_field_category = fc.id
            JOIN users u ON r.id_user = u.id
            JOIN user_details ud ON u.id = ud.id_user
            ORDER BY r.rental_date DESC, r.rental_start DESC
        `;
    const [rentals] = await pool.query(query);
    res.status(200).json(rentals);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener las reservas.' });
  }
};

const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
            SELECT 
                r.id_rental,
                r.rental_price,
                r.rental_date,
                r.rental_start,
                r.rental_end,
                f.id AS id_field,
                fac.address AS facility_address,
                fc.category_name,
                u.id AS id_user,
                u.user_email,
                ud.user_name,
                ud.user_phone
            FROM rental r
            JOIN fields f ON r.id_field = f.id
            JOIN facilities fac ON f.id_facility = fac.id
            JOIN field_category fc ON f.id_field_category = fc.id
            JOIN users u ON r.id_user = u.id
            JOIN user_details ud ON u.id = ud.id_user
            WHERE r.id_rental = ?
        `;
    const [rental] = await pool.query(query, [id]);

    if (rental.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada.' });
    }
    res.status(200).json(rental[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener la reserva.' });
  }
};

const createRental = async (req, res) => {
  try {
    const { id_field, rental_price, rental_date, rental_start, rental_end } =
      req.body;

    const id_user = req.user.id;

    if (
      !id_field ||
      !rental_price ||
      !id_user ||
      !rental_date ||
      !rental_start ||
      !rental_end
    ) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios para crear la reserva.',
      });
    }

    const checkOverlapQuery = `
            SELECT id_rental FROM rental 
            WHERE id_field = ? 
            AND rental_date = ? 
            AND (rental_start < ? AND rental_end > ?)
        `;
    const [conflicts] = await pool.query(checkOverlapQuery, [
      id_field,
      rental_date,
      rental_end,
      rental_start,
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: 'La cancha ya se encuentra reservada en ese horario.',
      });
    }

    const insertQuery = `
            INSERT INTO rental (id_field, rental_price, id_user, rental_date, rental_start, rental_end) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    await pool.query(insertQuery, [
      id_field,
      rental_price,
      id_user,
      rental_date,
      rental_start,
      rental_end,
    ]);

    res.status(201).json({ message: 'Reserva creada correctamente.' });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: 'Error interno del servidor al crear la reserva.' });
  }
  console.log('REQ BODY REAL:', req.body);
};

const createRentalAdmin = async (req, res) => {
  try {
    const {
      id_user,
      id_field,
      rental_price,
      rental_date,
      rental_start,
      rental_end,
    } = req.body;

    if (
      !id_field ||
      !rental_price ||
      !id_user ||
      !rental_date ||
      !rental_start ||
      !rental_end
    ) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios para crear la reserva.',
      });
    }

    const checkOverlapQuery = `
            SELECT id_rental FROM rental 
            WHERE id_field = ? 
            AND rental_date = ? 
            AND (rental_start < ? AND rental_end > ?)
        `;
    const [conflicts] = await pool.query(checkOverlapQuery, [
      id_field,
      rental_date,
      rental_end,
      rental_start,
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: 'La cancha ya se encuentra reservada en ese horario.',
      });
    }

    const insertQuery = `
            INSERT INTO rental (id_field, rental_price, id_user, rental_date, rental_start, rental_end) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    await pool.query(insertQuery, [
      id_field,
      rental_price,
      id_user,
      rental_date,
      rental_start,
      rental_end,
    ]);

    res.status(201).json({ message: 'Reserva creada correctamente.' });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: 'Error interno del servidor al crear la reserva.' });
  }
  console.log('REQ BODY REAL:', req.body);
};

const updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_field,
      rental_price,
      id_user,
      rental_date,
      rental_start,
      rental_end,
    } = req.body;

    if (
      !id_field ||
      !rental_price ||
      !id_user ||
      !rental_date ||
      !rental_start ||
      !rental_end
    ) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son obligatorios.' });
    }

    const checkOverlapQuery = `
            SELECT id_rental FROM rental 
            WHERE id_field = ? 
            AND rental_date = ? 
            AND (rental_start < ? AND rental_end > ?)
            AND id_rental != ?
        `;
    const [conflicts] = await pool.query(checkOverlapQuery, [
      id_field,
      rental_date,
      rental_end,
      rental_start,
      id,
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({
        message:
          'El nuevo horario entra en conflicto con una reserva existente.',
      });
    }

    const updateQuery = `
            UPDATE rental 
            SET id_field = ?, rental_price = ?, id_user = ?, rental_date = ?, rental_start = ?, rental_end = ? 
            WHERE id_rental = ?
        `;
    const [result] = await pool.query(updateQuery, [
      id_field,
      rental_price,
      id_user,
      rental_date,
      rental_start,
      rental_end,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada.' });
    }

    res.status(200).json({ message: 'Reserva actualizada correctamente.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const deleteRental = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = `DELETE FROM rental WHERE id_rental = ?`;
    const [result] = await pool.query(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Reserva no encontrada o ya fue eliminada.' });
    }

    res.status(200).json({ message: 'Reserva eliminada correctamente.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getRentalsByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        r.id_rental, 
        r.rental_price, 
        r.rental_date, 
        r.rental_start, 
        r.rental_end,
        f.id AS field_id,
        f.id_facility,
        f.hourly_price,
        c.category_name,
        c.field_capacity
      FROM rental r
      INNER JOIN fields f ON r.id_field = f.id
      INNER JOIN field_categories c ON f.id_field_category = c.id
      WHERE r.id_user = ?
      ORDER BY r.rental_date DESC, r.rental_start DESC
    `;

    const [rentals] = await db.query(query, [userId]);

    return res.status(200).json(rentals);
  } catch (error) {
    console.error('Error al obtener las reservas del usuario:', error);
    return res
      .status(500)
      .json({ message: 'Error interno del servidor al obtener las reservas.' });
  }
};

module.exports = {
  getRentals,
  getRentalById,
  createRental,
  createRentalAdmin,
  updateRental,
  deleteRental,
};
