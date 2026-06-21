const pool = require('../config/connection.js');

const getFieldStatuses = async (req, res) => {
    try {
        const queryGet = `SELECT * FROM field_statuses`;
        const [fieldStatuses] = await pool.query(queryGet);
        
        res.status(200).json(fieldStatuses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener los estados de las canchas." });
    }
};

const getFieldStatusById = async (req, res) => {
    try {
        const { id } = req.params;
        const queryGet = `SELECT * FROM field_statuses WHERE id = ?`;
        const [fieldStatus] = await pool.query(queryGet, [id]);

        if (fieldStatus.length === 0) {
            return res.status(404).json({ message: "Estado de cancha no encontrado." });
        }

        res.status(200).json(fieldStatus[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener el estado de la cancha." });
    }
};

const createFieldStatus = async (req, res) => {
    try {
        const { field_status_name } = req.body;

        if (!field_status_name || field_status_name.trim() === "") {
            return res.status(400).json({ message: "El nombre del estado es requerido." });
        }

        const insertQuery = `INSERT INTO field_statuses (field_status_name) VALUES (?)`;
        await pool.query(insertQuery, [field_status_name]);

        res.status(201).json({ message: "Estado de cancha creado correctamente." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const updateFieldStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { field_status_name } = req.body;

        if (!field_status_name || field_status_name.trim() === "") {
            return res.status(400).json({ message: "El nombre del estado es requerido." });
        }

        const updateQuery = `UPDATE field_statuses SET field_status_name = ? WHERE id = ?`;
        const [result] = await pool.query(updateQuery, [field_status_name, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Estado de cancha no encontrado." });
        }

        res.status(200).json({ message: "Estado actualizado correctamente." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const deleteFieldStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteQuery = `DELETE FROM field_statuses WHERE id = ?`;
        const [result] = await pool.query(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Estado de cancha no encontrado o ya fue eliminado." });
        }

        res.status(200).json({ message: "Estado eliminado correctamente." });
    } catch (error) {
        console.log(error);

        if (error.errno === 1451) {
            return res.status(409).json({ 
                message: "No se puede eliminar este estado porque hay canchas que lo están utilizando." 
            });
        }
        
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

module.exports = {
    getFieldStatuses,
    getFieldStatusById,
    createFieldStatus,
    updateFieldStatus,
    deleteFieldStatus,
};