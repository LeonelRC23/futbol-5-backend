const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/connection.js');

const loginUser = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    const query = `SELECT id, user_email, user_password FROM users WHERE user_email = ?`;
    const [users] = await db.query(query, [user_email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const user = users[0];

    const match = await bcrypt.compare(user_password, user.user_password);

    if (!match) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const payload = {
      id: user.id,
      email: user.user_email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    res.status(200).json({
      message: 'Login exitoso',
      token: token,
    });
  } catch (error) {
    console.log('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = { loginUser };
