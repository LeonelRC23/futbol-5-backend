const { json } = require('express');
const db = require('../config/connection.js');

const getRentalStatuses = async (req, res) => {
    try{
        const queryGet = `SELECT * FROM rental_statuses`;
        const [rentalStatuses] = await connection(queryGet);
        res.status(200),json(rentalStatuses);
    } catch(error) {
        console.log(error);
        res.status(500).json({messaje: "Error al obtener los estados de renta"});
    }
};

const getRentalStatusById = async (req, res) => {
    try{
        const {id} = req.params;
        const queryGet = `SELECT * from rental_statuses WHERE id = ?`;
        const [rentalStatus] = await connection(queryGet, [id]);

        if(rentalStatus.length === 0) {
            res.status(404).json({ messaje: "Estado de renta no encontrado."})
        } 

        res.status(200).json(rentalStatus[0]);
    }catch(error){
        console.log(error);
        res.status(500).json({ messaje: "Error al obtener el estado de renta."})
    }
};

const createRentalStatus = async(req, res) => {
    try{
        const {rental_status_name} = req.body;
        const connection = await db.getConnection();

        await connection.beginTransaction();

        try{
            const insertQuery = `INSERT INTO rental_statuses (rental_status_name) VALUES (?)`;
            await connection.query(insertQuery, [rental_status_name]);

            await connection.commit();
            res.status(200).json({ messaje: "Estado creado correctamente."});
        } catch(error){
            console.log(error);
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }catch(error) {
        console.log(error);
        res.status(500).json({ messaje: "Error interno del servidor."})
    }
};

module.exports = {
    getRentalStatuses,
    getRentalStatusById,
    createRentalStatus,
}

