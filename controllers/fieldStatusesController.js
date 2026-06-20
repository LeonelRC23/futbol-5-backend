const db = require('../config/connection.js');

const getFieldStatuses = async (req, res) => 
    {
        try
        {
            const queryGet = `SELECT * FROM field_statuses`;
            const [fieldStatuses] = await db.query(queryGet);
            res.status(200).json(fieldStatuses);
        }
        catch(error){
            console.log(error);
            res.status(500).json({message: "Error al obtener los estados de las canchas."});
        }
    }

module.exports = 
{
    getFieldStatuses,
};