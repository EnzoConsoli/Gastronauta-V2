const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================================
// LISTAR TODAS AS TAGS
// ============================================
router.get('/', async (req, res) => {
  try {
    const [tags] = await db.query(`
      SELECT id, nome, exclusivo, cor
      FROM tags
      ORDER BY nome ASC
    `);

    res.json(tags);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar tags.' });
  }
});

module.exports = router;
