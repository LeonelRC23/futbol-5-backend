const db = require('../config/connection.js');

const getUsers = async (req, res) => {
    try{
        const users = await db.query('SELECT * FROM USERS');
        res.status(200).json(users);
    }catch(error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener los usuarios" });
    }
};

module.exports = {
    getUsers
};

