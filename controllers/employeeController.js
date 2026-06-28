const pool = require('../config/connection.js');

const getEmployees = async (req, res) => {
  try {
    const query = `
            SELECT 
                e.id AS id_employee, 
                ed.name_employee, 
                ed.dni_employee, 
                ed.phone_employee, 
                es.employee_status_name, 
                f.address AS facility_address,
                e.id_facility,
                ed.id_status_employee
            FROM employee e
            JOIN employee_details ed ON e.id_employee_details = ed.id
            JOIN employee_statuses es ON ed.id_status_employee = es.id
            JOIN facilities f ON e.id_facility = f.id
        `;
    const [employees] = await pool.query(query);
    res.status(200).json(employees);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener los empleados.' });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
            SELECT 
                e.id AS id_employee, 
                ed.name_employee, 
                ed.dni_employee, 
                ed.phone_employee, 
                es.employee_status_name, 
                f.address AS facility_address,
                e.id_facility,
                ed.id_status_employee
            FROM employee e
            JOIN employee_details ed ON e.id_employee_details = ed.id
            JOIN employee_statuses es ON ed.id_status_employee = es.id
            JOIN facilities f ON e.id_facility = f.id
            WHERE e.id = ?
        `;
    const [employee] = await pool.query(query, [id]);

    if (employee.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado.' });
    }
    res.status(200).json(employee[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener el empleado.' });
  }
};

const createEmployee = async (req, res) => {
  let connection;
  try {
    const {
      name_employee,
      dni_employee,
      phone_employee,
      id_status_employee,
      id_facility,
    } = req.body;

    if (
      !name_employee ||
      !dni_employee ||
      !id_status_employee ||
      !id_facility
    ) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    connection = await pool.getConnection();

    const checkQuery = `SELECT id FROM employee_details WHERE dni_employee = ? OR phone_employee = ?`;
    const [existing] = await connection.query(checkQuery, [
      dni_employee,
      phone_employee,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'El DNI o Teléfono ya está registrado en el sistema.',
      });
    }

    await connection.beginTransaction();

    try {
      const insertDetailsQuery = `
                INSERT INTO employee_details (id_status_employee, phone_employee, dni_employee, name_employee) 
                VALUES (?, ?, ?, ?)
            `;
      const [detailsResult] = await connection.query(insertDetailsQuery, [
        id_status_employee,
        phone_employee,
        dni_employee,
        name_employee,
      ]);
      const newDetailsId = detailsResult.insertId;
      const insertEmployeeQuery = `INSERT INTO employee (id_facility, id_employee_details) VALUES (?, ?)`;

      await connection.query(insertEmployeeQuery, [id_facility, newDetailsId]);
      await connection.commit();
      res.status(201).json({ message: 'Empleado creado correctamente.' });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  } finally {
    if (connection) connection.release();
  }
};

const updateEmployee = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const {
      name_employee,
      dni_employee,
      phone_employee,
      id_status_employee,
      id_facility,
    } = req.body;

    connection = await pool.getConnection();

    const findQuery = `SELECT id_employee_details FROM employee WHERE id = ?`;
    const [employeeInfo] = await connection.query(findQuery, [id]);

    if (employeeInfo.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado.' });
    }

    const detailsId = employeeInfo[0].id_employee_details;
    const checkQuery = `
            SELECT id FROM employee_details 
            WHERE (dni_employee = ? OR phone_employee = ?) AND id != ?
        `;
    const [existing] = await connection.query(checkQuery, [
      dni_employee,
      phone_employee,
      detailsId,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'El DNI o Teléfono ya está en uso por otro empleado.',
      });
    }

    await connection.beginTransaction();

    try {
      const updateDetailsQuery = `
                UPDATE employee_details 
                SET name_employee = ?, dni_employee = ?, phone_employee = ?, id_status_employee = ? 
                WHERE id = ?
            `;
      await connection.query(updateDetailsQuery, [
        name_employee,
        dni_employee,
        phone_employee,
        id_status_employee,
        detailsId,
      ]);

      const updateEmployeeQuery = `UPDATE employee SET id_facility = ? WHERE id = ?`;

      await connection.query(updateEmployeeQuery, [id_facility, id]);
      await connection.commit();
      res.status(200).json({ message: 'Empleado actualizado correctamente.' });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  } finally {
    if (connection) connection.release();
  }
};

const deleteEmployee = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await pool.getConnection();

    const findQuery = `SELECT id_employee_details FROM employee WHERE id = ?`;
    const [employeeInfo] = await connection.query(findQuery, [id]);

    if (employeeInfo.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado.' });
    }

    const detailsId = employeeInfo[0].id_employee_details;

    await connection.beginTransaction();

    try {
      await connection.query(`DELETE FROM employee WHERE id = ?`, [id]);
      await connection.query(`DELETE FROM employee_details WHERE id = ?`, [
        detailsId,
      ]);
      await connection.commit();
      res.status(200).json({ message: 'Empleado eliminado correctamente.' });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
