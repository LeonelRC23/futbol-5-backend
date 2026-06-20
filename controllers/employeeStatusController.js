const pool = require('../config/connection.js');

const getEmployeeStatuses = async (req, res) => {
  try {
    const queryGet = `SELECT * FROM employee_statuses`;
    const [employeeStatuses] = await pool.query(queryGet);

    res.status(200).json(employeeStatuses);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: 'Error al obtener los estados de empleado.' });
  }
};

const getEmployeeStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const queryGet = `SELECT * FROM employee_statuses WHERE id = ?`;
    const [employeeStatus] = await pool.query(queryGet, [id]);

    if (employeeStatus.length === 0) {
      return res
        .status(404)
        .json({ message: 'Estado de empleado no encontrado.' });
    }

    res.status(200).json(employeeStatus[0]);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: 'Error al obtener el estado de empleado.' });
  }
};

const createEmployeeStatus = async (req, res) => {
  try {
    const { employee_status_name } = req.body;

    if (!employee_status_name) {
      return res
        .status(400)
        .json({ message: 'El nombre del estado es requerido.' });
    }

    const insertQuery = `INSERT INTO employee_statuses (employee_status_name) VALUES (?)`;
    await pool.query(insertQuery, [employee_status_name]);

    res
      .status(201)
      .json({ message: 'Estado de empleado creado correctamente.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_status_name } = req.body;

    if (!employee_status_name) {
      return res
        .status(400)
        .json({ message: 'El nombre del estado es requerido.' });
    }

    const updateQuery = `UPDATE employee_statuses SET employee_status_name = ? WHERE id = ?`;
    const [result] = await pool.query(updateQuery, [employee_status_name, id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Estado de empleado no encontrado.' });
    }

    res.status(200).json({ message: 'Estado actualizado correctamente.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const deleteEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = `DELETE FROM employee_statuses WHERE id = ?`;
    const [result] = await pool.query(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Estado de empleado no encontrado o ya fue eliminado.',
      });
    }

    res.status(200).json({ message: 'Estado eliminado correctamente.' });
  } catch (error) {
    console.log(error);

    // Protección de Clave Foránea
    if (error.errno === 1451) {
      return res.status(409).json({
        message:
          'No se puede eliminar este estado porque está siendo utilizado por uno o más empleados.',
      });
    }

    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  getEmployeeStatuses,
  getEmployeeStatusById,
  createEmployeeStatus,
  updateEmployeeStatus,
  deleteEmployeeStatus,
};
