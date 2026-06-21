const pool = require('../config/connection.js');

const getFieldCategories = async (req, res) => {
    try {
        const queryGet = `SELECT * FROM field_category`;
        const [categories] = await pool.query(queryGet);
        
        res.status(200).json(categories);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener las categorías de canchas." });
    }
};

const getFieldCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const queryGet = `SELECT * FROM field_category WHERE id = ?`;
        const [category] = await pool.query(queryGet, [id]);

        if (category.length === 0) {
            return res.status(404).json({ message: "Categoría no encontrada." });
        }

        res.status(200).json(category[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener la categoría." });
    }
};

const createFieldCategory = async (req, res) => {
    try {
        const { category_name, field_capacity } = req.body;

        if (!category_name || !field_capacity) {
            return res.status(400).json({ message: "El nombre de la categoría y la capacidad son obligatorios." });
        }

        const insertQuery = `INSERT INTO field_category (category_name, field_capacity) VALUES (?, ?)`;
        await pool.query(insertQuery, [category_name, field_capacity]);

        res.status(201).json({ message: "Categoría creada correctamente." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const updateFieldCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, field_capacity } = req.body;

        if (!category_name || !field_capacity) {
            return res.status(400).json({ message: "El nombre de la categoría y la capacidad son obligatorios." });
        }

        const updateQuery = `UPDATE field_category SET category_name = ?, field_capacity = ? WHERE id = ?`;
        const [result] = await pool.query(updateQuery, [category_name, field_capacity, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Categoría no encontrada." });
        }

        res.status(200).json({ message: "Categoría actualizada correctamente." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const deleteFieldCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteQuery = `DELETE FROM field_category WHERE id = ?`;
        const [result] = await pool.query(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Categoría no encontrada o ya fue eliminada." });
        }

        res.status(200).json({ message: "Categoría eliminada correctamente." });
    } catch (error) {
        console.log(error);
        
        if (error.errno === 1451) {
            return res.status(409).json({ 
                message: "No se puede eliminar esta categoría porque hay canchas asignadas a ella." 
            });
        }
        
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

module.exports = {
    getFieldCategories,
    getFieldCategoryById,
    createFieldCategory,
    updateFieldCategory,
    deleteFieldCategory,
};