const express = require('express');
const {connection} = require('./config/database.js')

const app = express();
const PORT = 8000;

app.listen(PORT, () => {
    console.log('Escuchando en el puerto ' + PORT);
});