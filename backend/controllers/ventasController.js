const db = require('../config/database');

exports.getVentas = (req, res) => {
  db.query('SELECT * FROM ventas', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};