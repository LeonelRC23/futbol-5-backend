const pool = require('../config/connection.js');

const getFields = async (req, res) => {
    try {
        const query = `
            SELECT 
                f.id AS id_field, 
                fac.address AS facility_address, 
                fs.field_status_name, 
                fc.category_name, 
                fc.field_capacity, 
                f.hourly_price,
                f.id_facility,
                f.id_field_status,
                f.id_field_category
            FROM fields f
            JOIN facilities fac ON f.id_facility = fac.id
            JOIN field_statuses fs ON f.id_field_status = fs.id
            JOIN field_category fc ON f.id_field_category = fc.id
        `;
        const [fields] = await pool.query(query);
        res.status(200).json(fields);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener las canchas." });
    }
};

const getFieldById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                f.id AS id_field, 
                fac.address AS facility_address, 
                fs.field_status_name, 
                fc.category_name, 
                fc.field_capacity, 
                f.hourly_price,
                f.id_facility,
                f.id_field_status,
                f.id_field_category
            FROM fields f
            JOIN facilities fac ON f.id_facility = fac.id
            JOIN field_statuses fs ON f.id_field_status = fs.id
            JOIN field_category fc ON f.id_field_category = fc.id
            WHERE f.id = ?
        `;
        const [field] = await pool.query(query, [id]);

        if (field.length === 0) {
            return res.status(404).json({ message: "Cancha no encontrada." });
        }
        res.status(200).json(field[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener la cancha." });
    }
};

const createField = async (req, res) => {
    try {
        const { id_facility, id_field_status, id_field_category, hourly_price } = req.body;

        if (!id_facility || !id_field_status || !id_field_category || !hourly_price) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        const insertQuery = `
            INSERT INTO fields (id_facility, id_field_status, id_field_category, hourly_price) 
            VALUES (?, ?, ?, ?)
        `;
        await pool.query(insertQuery, [id_facility, id_field_status, id_field_category, hourly_price]);

        res.status(201).json({ message: "Cancha creada correctamente." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const updateField = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_facility, id_field_status, id_field_category, hourly_price } = req.body;

        if (!id_facility || !id_field_status || !id_field_category || !hourly_price) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        const updateQuery = `
            UPDATE fields 
            SET id_facility = ?, id_field_status = ?, id_field_category = ?, hourly_price = ? 
            WHERE id = ?
        `;
        const [result] = await pool.query(updateQuery, [id_facility, id_field_status, id_field_category, hourly_price, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cancha no encontrada." });
        }

        res.status(200).json({ message: "Cancha actualizada correctamente." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const deleteField = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteQuery = `DELETE FROM fields WHERE id = ?`;
        const [result] = await pool.query(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cancha no encontrada o ya fue eliminada." });
        }

        res.status(200).json({ message: "Cancha eliminada correctamente." });
    } catch (error) {
        console.log(error);
        
        if (error.errno === 1451) {
            return res.status(409).json({ 
                message: "No se puede eliminar esta cancha porque tiene un historial de reservas asociado. Te recomendamos cambiar su estado a 'En Mantenimiento' o 'Deshabilitada'." 
            });
        }
        
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

module.exports = {
    getFields,
    getFieldById,
    createField,
    updateField,
    deleteField,
};