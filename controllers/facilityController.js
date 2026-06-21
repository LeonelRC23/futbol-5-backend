const pool = require('../config/connection.js');

const getFacilities = async (req, res) => {
    try {
        const queryGet = `SELECT * FROM facilities`;
        const [facilities] = await pool.query(queryGet);
        
        res.status(200).json(facilities);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener las sedes." });
    }
};

const getFacilityById = async (req, res) => {
    try {
        const { id } = req.params;
        const queryGet = `SELECT * FROM facilities WHERE id = ?`;
        const [facility] = await pool.query(queryGet, [id]);

        if (facility.length === 0) {
            return res.status(404).json({ message: "Sede no encontrada." });
        }

        res.status(200).json(facility[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener la sede." });
    }
};

const createFacility = async (req, res) => {
    try {
        const { address } = req.body;

        if (!address || address.trim() === "") {
            return res.status(400).json({ message: "La dirección de la sede es obligatoria." });
        }

        const insertQuery = `INSERT INTO facilities (address) VALUES (?)`;
        await pool.query(insertQuery, [address]);

        res.status(201).json({ message: "Sede creada correctamente." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const updateFacility = async (req, res) => {
    try {
        const { id } = req.params;
        const { address } = req.body;

        if (!address || address.trim() === "") {
            return res.status(400).json({ message: "La dirección de la sede es obligatoria." });
        }

        const updateQuery = `UPDATE facilities SET address = ? WHERE id = ?`;
        const [result] = await pool.query(updateQuery, [address, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Sede no encontrada." });
        }

        res.status(200).json({ message: "Sede actualizada correctamente." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const deleteFacility = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteQuery = `DELETE FROM facilities WHERE id = ?`;
        const [result] = await pool.query(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Sede no encontrada o ya fue eliminada." });
        }

        res.status(200).json({ message: "Sede eliminada correctamente." });
    } catch (error) {
        console.log(error);
        
        if (error.errno === 1451) {
            return res.status(409).json({ 
                message: "No se puede eliminar esta sede porque tiene empleados o canchas asignadas." 
            });
        }
        
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

module.exports = {
    getFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility,
};