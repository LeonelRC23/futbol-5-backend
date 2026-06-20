const pool = require('../config/connection.js');

const getRentalStatuses = async (req, res) => {
  try {
    const queryGet = `SELECT * FROM rental_statuses`;
    const [rentalStatuses] = await pool.query(queryGet);

    res.status(200).json(rentalStatuses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener los estados de renta' });
  }
};

const getRentalStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const queryGet = `SELECT * FROM rental_statuses WHERE id = ?`;
    const [rentalStatus] = await pool.query(queryGet, [id]);

    if (rentalStatus.length === 0) {
      return res
        .status(404)
        .json({ message: 'Estado de renta no encontrado.' });
    }

    res.status(200).json(rentalStatus[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener el estado de renta.' });
  }
};

const createRentalStatus = async (req, res) => {
  try {
    const { rental_status_name } = req.body;

    if (!rental_status_name) {
      return res
        .status(400)
        .json({ message: 'El nombre del estado es requerido.' });
    }

    const insertQuery = `INSERT INTO rental_statuses (rental_status_name) VALUES (?)`;
    await pool.query(insertQuery, [rental_status_name]);

    res.status(201).json({ message: 'Estado creado correctamente.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const updateRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { rental_status_name } = req.body;

    if (!rental_status_name) {
      return res
        .status(400)
        .json({ message: 'El nombre del estado es requerido.' });
    }

    const updateQuery = `UPDATE rental_statuses SET rental_status_name = ? WHERE id = ?`;
    const [result] = await pool.query(updateQuery, [rental_status_name, id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Estado de renta no encontrado.' });
    }

    res.status(200).json({ message: 'Estado actualizado correctamente.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const deleteRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = `DELETE FROM rental_statuses WHERE id = ?`;
    const [result] = await pool.query(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Estado de renta no encontrado o ya fue eliminado.' });
    }

    res.status(200).json({ message: 'Estado eliminado correctamente.' });
  } catch (error) {
    console.log(error);

    if (error.errno === 1451) {
      return res.status(409).json({
        message:
          'No se puede eliminar este estado porque está siendo utilizado por uno o más usuarios.',
      });
    }

    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  getRentalStatuses,
  getRentalStatusById,
  createRentalStatus,
  updateRentalStatus,
  deleteRentalStatus,
};
