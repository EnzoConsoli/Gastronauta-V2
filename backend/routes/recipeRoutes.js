// routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Configuração do Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
    cb(null, true);
  else
    cb(new Error('Tipo de arquivo não suportado.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }
});

router.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// =====================================================================
// FEED PRINCIPAL
// =====================================================================
router.get('/feed', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [results] = await db.query(`
      SELECT 
        r.id,
        r.prato,
        r.descricao,
        r.url_imagem,
        r.data_postagem,
        r.usuario_id,

        u.nome_usuario,
        u.foto_perfil_url,

        (SELECT COUNT(*) FROM curtidas WHERE receita_id = r.id) AS totalCurtidas,
        (SELECT COUNT(*) FROM comentarios WHERE receita_id = r.id) AS totalComentarios,
        EXISTS(SELECT 1 FROM curtidas WHERE receita_id = r.id AND usuario_id = ?) AS isLikedByMe,

        ROUND(AVG(a.nota), 1) AS avgAval,
        COUNT(a.id) AS totalAval

      FROM receitas r
      JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN avaliacoes a ON a.receita_id = r.id
      GROUP BY r.id
      ORDER BY r.data_postagem DESC
    `, [userId]);

    for (const r of results) {
  const [tags] = await db.query(`
    SELECT t.id, t.nome
    FROM receita_tags rt
    JOIN tags t ON t.id = rt.tag_id
    WHERE rt.receita_id = ?
  `, [r.id]);

  r.tags = tags;
}


    res.json({ receitas: results, page: 1, hasMore: false });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao buscar feed.' });
  }
});

// =====================================================================
// CRIAR RECEITA
// =====================================================================
router.post('/', authMiddleware, upload.single('imagemReceita'), async (req, res) => {
  const {
    prato, ingredientes, preparacao, descricao,
    tempo_preparo, dificuldade, custo, rendimento, cozimento,
    tags // ← vem do Angular como string JSON
  } = req.body;

  const userId = req.user.id;
  const url_imagem = req.file ? `/uploads/${req.file.filename}` : null;

  if (!prato || !ingredientes || !preparacao) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ mensagem: 'Campos obrigatórios faltando.' });
  }

  try {
    // 1) Criar receita
    const [result] = await db.query(`
      INSERT INTO receitas (
        usuario_id, prato, ingredientes, preparacao, descricao,
        tempo_preparo, dificuldade, custo, rendimento, url_imagem, cozimento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, prato, ingredientes, preparacao, descricao || null,
      tempo_preparo || null, dificuldade || null, custo || null,
      rendimento || null, url_imagem, cozimento || null
    ]);

    const receitaId = result.insertId;

    // 2) Inserir TAGS, se existirem
    if (tags) {
      const tagList = JSON.parse(tags); // ex: [1,4,7]

      for (const tagId of tagList) {
        await db.query(
          'INSERT INTO receita_tags (receita_id, tag_id) VALUES (?, ?)',
          [receitaId, tagId]
        );
      }
    }

    res.status(201).json({ 
      mensagem: 'Receita criada!',
      receitaId 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao criar receita.' });
  }
});

// =====================================================================
// RECEITAS DE UM USUÁRIO
// =====================================================================
router.get('/user/:userId', authMiddleware, async (req, res) => {
  const uId = req.params.userId;
  const currentUser = req.user.id;

  try {
    const [results] = await db.query(`
      SELECT 
        r.id,
        r.prato,
        r.descricao,
        r.url_imagem,
        r.data_postagem,

        u.nome_usuario,
        u.foto_perfil_url,

        (SELECT COUNT(*) FROM curtidas WHERE receita_id = r.id) AS totalCurtidas,
        (SELECT COUNT(*) FROM comentarios WHERE receita_id = r.id) AS totalComentarios,
        EXISTS(SELECT 1 FROM curtidas WHERE receita_id = r.id AND usuario_id = ?) AS isLikedByMe,

        ROUND(AVG(a.nota), 1) AS mediaNotas,
        COUNT(a.id) AS totalAvaliacoes

      FROM receitas r
      JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN avaliacoes a ON r.id = a.receita_id
      WHERE r.usuario_id = ?
      GROUP BY r.id
      ORDER BY r.data_postagem DESC
    `, [currentUser, uId]);

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao buscar receitas do usuário.' });
  }
});

// =====================================================================
// MINHAS RECEITAS
// =====================================================================
router.get('/my-recipes', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [results] = await db.query(`
      SELECT 
        r.id,
        r.prato,
        r.descricao,
        r.url_imagem,
        r.data_postagem,
        u.nome_usuario,
        u.foto_perfil_url,

        (SELECT COUNT(*) FROM curtidas WHERE receita_id = r.id) AS totalCurtidas,
        (SELECT COUNT(*) FROM comentarios WHERE receita_id = r.id) AS totalComentarios,
        EXISTS(SELECT 1 FROM curtidas WHERE receita_id = r.id AND usuario_id = ?) AS isLikedByMe,

        AVG(a.nota) AS mediaNotas,
        COUNT(a.id) AS totalAvaliacoes

      FROM receitas r
      JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN avaliacoes a ON r.id = a.receita_id

      WHERE r.usuario_id = ?
      GROUP BY r.id
      ORDER BY r.data_postagem DESC
    `, [userId, userId]);

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao buscar suas receitas.' });
  }
});

// =====================================================================
// RECEITAS CURTIDAS
// =====================================================================
router.get('/liked', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [results] = await db.query(`
      SELECT 
        r.id,
        r.prato,
        r.descricao,
        r.url_imagem,
        r.data_postagem,

        u.nome_usuario,
        u.foto_perfil_url,

        (SELECT COUNT(*) FROM curtidas WHERE receita_id = r.id) AS totalCurtidas,
        (SELECT COUNT(*) FROM comentarios WHERE receita_id = r.id) AS totalComentarios,

        1 AS isLikedByMe,

        AVG(a.nota) AS mediaNotas,
        COUNT(a.id) AS totalAvaliacoes

      FROM receitas r
      JOIN curtidas c ON r.id = c.receita_id
      JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN avaliacoes a ON r.id = a.receita_id

      WHERE c.usuario_id = ?
      GROUP BY r.id
      ORDER BY c.data_curtida DESC
    `, [userId]);

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao buscar curtidas.' });
  }
});

// =====================================================================
// 🔍 BUSCA DE RECEITAS
// =====================================================================
router.get('/search', authMiddleware, async (req, res) => {
  const q = (req.query.q || '').toString().trim();

  if (!q) {
    return res.json([]);
  }

  const like = `%${q}%`;

  try {
    const [rows] = await db.query(
      `
      SELECT
        r.id,
        r.prato,
        r.descricao,
        r.url_imagem,
        r.usuario_id,
        u.nome_usuario
      FROM receitas AS r
      JOIN usuarios AS u ON r.usuario_id = u.id
      WHERE
        r.prato LIKE ?
        OR r.descricao LIKE ?
        OR r.ingredientes LIKE ?
      ORDER BY r.data_postagem DESC
      LIMIT 20
      `,
      [like, like, like]
    );

    res.json(rows);

  } catch (error) {
    console.error('Erro na busca de receitas:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar receitas.' });
  }
});

// =====================================================================
// DETALHES DA RECEITA
// =====================================================================
router.get('/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT 
        r.*,
        u.nome_usuario,
        u.foto_perfil_url,

        (SELECT COUNT(*) FROM curtidas WHERE receita_id = r.id) AS totalCurtidas,
        (SELECT COUNT(*) FROM comentarios WHERE receita_id = r.id) AS totalComentarios,
        EXISTS(SELECT 1 FROM curtidas WHERE receita_id = r.id AND usuario_id = ?) AS isLikedByMe,

        AVG(a.nota) AS mediaNotas,
        COUNT(a.id) AS totalAvaliacoes

      FROM receitas r
      JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN avaliacoes a ON r.id = a.receita_id

      WHERE r.id = ?
      GROUP BY r.id
    `, [userId, id]);

    if (!rows[0]) return res.status(404).json({ mensagem: 'Receita não encontrada.' });
    
    const receita = rows[0];

    // === 🔥 BUSCAR TAGS DA RECEITA ===
    const [tagRows] = await db.query(`
      SELECT t.id, t.nome
      FROM receita_tags rt
      JOIN tags t ON t.id = rt.tag_id
      WHERE rt.receita_id = ?
    `, [id]);

    receita.tags = tagRows; // <-- ADICIONAR TAGS AO OBJETO

    res.json(receita);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao buscar receita.' });
  }
});

// =====================================================================
// EXCLUIR RECEITA
// =====================================================================
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    const [rows] = await db.query('SELECT usuario_id, url_imagem FROM receitas WHERE id = ?', [id]);

    if (!rows[0]) return res.status(404).json({ mensagem: 'Receita não encontrada.' });

    if (rows[0].usuario_id !== userId)
      return res.status(403).json({ mensagem: 'Sem permissão.' });

    if (rows[0].url_imagem) {
      const imgPath = path.join(__dirname, '../public', rows[0].url_imagem);
      fs.unlink(imgPath, () => {});
    }

    await db.query('DELETE FROM receitas WHERE id = ?', [id]);

    res.json({ mensagem: 'Receita excluída!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao excluir receita.' });
  }
});

// =====================================================================
// ATUALIZAR RECEITA
// =====================================================================
// =====================================================================
// ATUALIZAR RECEITA
// =====================================================================
router.put('/:id', authMiddleware, upload.single('imagemReceita'), async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  const {
    prato, ingredientes, preparacao, descricao,
    tempo_preparo, dificuldade, custo, rendimento, cozimento,
    tags
  } = req.body;

  try {
    const [[rows]] = await db.query(
      'SELECT usuario_id, url_imagem FROM receitas WHERE id = ?',
      [id]
    );

    if (!rows) return res.status(404).json({ mensagem: 'Receita não encontrada.' });
    if (rows.usuario_id !== userId) return res.status(403).json({ mensagem: 'Sem permissão.' });

    let url_imagem = rows.url_imagem;

    if (req.file) {
      url_imagem = `/uploads/${req.file.filename}`;

      if (rows.url_imagem) {
        const oldImg = path.join(__dirname, '../public', rows.url_imagem);
        fs.unlink(oldImg, () => {});
      }
    }

    await db.query(`
      UPDATE receitas SET 
        prato = ?, ingredientes = ?, preparacao = ?, descricao = ?,
        tempo_preparo = ?, dificuldade = ?, custo = ?, rendimento = ?,
        url_imagem = ?, cozimento = ?
      WHERE id = ?
    `, [
      prato, ingredientes, preparacao, descricao || null, tempo_preparo || null,
      dificuldade || null, custo || null, rendimento || null,
      url_imagem, cozimento || null, id
    ]);

    // ================================
    // ATUALIZAR TAGS
    // ================================
    if (tags) {
      const tagList = JSON.parse(tags);

      // Remove tags antigas
      await db.query('DELETE FROM receita_tags WHERE receita_id = ?', [id]);

      // Insere tags novas
      for (const tagId of tagList) {
        await db.query(
          'INSERT INTO receita_tags (receita_id, tag_id) VALUES (?, ?)',
          [id, tagId]
        );
      }
    }

    res.json({ mensagem: 'Receita atualizada!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar receita.' });
  }
});


// =====================================================================
// CURTIR / DESCURTIR RECEITA
// =====================================================================
router.post('/:id/like', authMiddleware, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      'SELECT id FROM curtidas WHERE usuario_id = ? AND receita_id = ?',
      [userId, id]
    );

    if (rows[0]) {
      await db.query('DELETE FROM curtidas WHERE id = ?', [rows[0].id]);

      const [[count]] = await db.query(
        'SELECT COUNT(*) AS total FROM curtidas WHERE receita_id = ?',
        [id]
      );

      return res.json({ liked: false, totalCurtidas: count.total });
    }

    await db.query(
      'INSERT INTO curtidas (usuario_id, receita_id) VALUES (?, ?)',
      [userId, id]
    );

    const [[count]] = await db.query(
      'SELECT COUNT(*) AS total FROM curtidas WHERE receita_id = ?',
      [id]
    );

    res.json({ liked: true, totalCurtidas: count.total });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao curtir.' });
  }
});

// =====================================================================
// AVALIAÇÕES
// =====================================================================
router.post('/:id/avaliar', authMiddleware, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const { nota, comentario } = req.body;

  if (!nota) return res.status(400).json({ mensagem: 'Nota obrigatória.' });

  try {
    const [[existente]] = await db.query(`
      SELECT comentario FROM avaliacoes
      WHERE usuario_id = ? AND receita_id = ?
    `, [userId, id]);

    if (existente) {
      const finalComentario = comentario?.trim() || existente.comentario;

      await db.query(`
        UPDATE avaliacoes
        SET nota = ?, comentario = ?
        WHERE usuario_id = ? AND receita_id = ?
      `, [nota, finalComentario, userId, id]);

      return res.json({ mensagem: 'Avaliação atualizada!' });
    }

    await db.query(`
      INSERT INTO avaliacoes (receita_id, usuario_id, nota, comentario)
      VALUES (?, ?, ?, ?)
    `, [id, userId, nota, comentario || '']);

    res.json({ mensagem: 'Avaliação publicada!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao avaliar.' });
  }
});

// =====================================================================
// AVALIAÇÕES - LISTAR COMPLETO (com likes + dislikes + respostas)
// =====================================================================
router.get('/:id/avaliacoes', authMiddleware, async (req, res) => {
  const receitaId = req.params.id;
  const userId = req.user.id;

  try {
    const [avaliacoes] = await db.query(`
      SELECT
        a.id,
        a.usuario_id,
        a.comentario,
        a.nota,
        a.data_avaliacao,

        u.nome_usuario,
        u.foto_perfil_url,

        (SELECT COUNT(*) FROM avaliacao_reacoes WHERE avaliacao_id = a.id AND tipo = 'like') AS likes,
        (SELECT COUNT(*) FROM avaliacao_reacoes WHERE avaliacao_id = a.id AND tipo = 'dislike') AS dislikes,

        (SELECT tipo FROM avaliacao_reacoes WHERE avaliacao_id = a.id AND usuario_id = ? LIMIT 1) AS minhaReacao

      FROM avaliacoes a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.receita_id = ?
      ORDER BY a.data_avaliacao DESC
    `, [userId, receitaId]);

    for (let a of avaliacoes) {
      const [resp] = await db.query(`
        SELECT r.*, u.nome_usuario, u.foto_perfil_url
        FROM avaliacao_respostas r
        JOIN usuarios u ON u.id = r.usuario_id
        WHERE r.avaliacao_id = ?
        ORDER BY r.data_resposta ASC
      `, [a.id]);

      a.respostas = resp;
    }

    const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) AS totalAvaliacoes,
        AVG(nota) AS mediaNotas
      FROM avaliacoes
      WHERE receita_id = ?
    `, [receitaId]);

    res.json({ stats, avaliacoes });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar avaliações.' });
  }
});

// =====================================================================
// RESPONDER UMA AVALIAÇÃO
// =====================================================================
router.post('/avaliacao/:avaliacaoId/responder', authMiddleware, async (req, res) => {
  const avaliacaoId = req.params.avaliacaoId;
  const userId = req.user.id;
  const { texto } = req.body;

  if (!texto || texto.trim() === '')
    return res.status(400).json({ mensagem: 'Resposta vazia.' });

  try {
    await db.query(`
      INSERT INTO avaliacao_respostas (avaliacao_id, usuario_id, texto)
      VALUES (?, ?, ?)
    `, [avaliacaoId, userId, texto]);

    const [[nova]] = await db.query(`
      SELECT r.*, u.nome_usuario, u.foto_perfil_url
      FROM avaliacao_respostas r
      JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.id = LAST_INSERT_ID()
    `);

    res.json({
      mensagem: 'Resposta enviada!',
      novaResposta: nova
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao responder avaliação.' });
  }
});

// =====================================================================
// LIKE / DISLIKE EM AVALIAÇÃO
// =====================================================================
router.post('/avaliacao/:avaliacaoId/react', authMiddleware, async (req, res) => {
  const avaliacaoId = req.params.avaliacaoId;
  const userId = req.user.id;
  const { tipo } = req.body;

  if (!['like', 'dislike'].includes(tipo))
    return res.status(400).json({ mensagem: 'Tipo inválido.' });

  try {
    const [[exist]] = await db.query(`
      SELECT * FROM avaliacao_reacoes 
      WHERE avaliacao_id = ? AND usuario_id = ?
    `, [avaliacaoId, userId]);

    let novaReacao = null;

    if (!exist) {
      await db.query(`
        INSERT INTO avaliacao_reacoes (avaliacao_id, usuario_id, tipo)
        VALUES (?, ?, ?)
      `, [avaliacaoId, userId, tipo]);

      novaReacao = tipo;

    } else if (exist.tipo === tipo) {
      await db.query('DELETE FROM avaliacao_reacoes WHERE id = ?', [exist.id]);
      novaReacao = null;

    } else {
      await db.query(`
        UPDATE avaliacao_reacoes SET tipo = ? WHERE id = ?
      `, [tipo, exist.id]);

      novaReacao = tipo;
    }

    const [[count]] = await db.query(`
      SELECT
        SUM(tipo = 'like')   AS likes,
        SUM(tipo = 'dislike') AS dislikes
      FROM avaliacao_reacoes
      WHERE avaliacao_id = ?
    `, [avaliacaoId]);

    res.json({
      liked: novaReacao === 'like',
      disliked: novaReacao === 'dislike',
      likes: count.likes || 0,
      dislikes: count.dislikes || 0
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao reagir avaliação.' });
  }
});

// =====================================================================
// DELETAR AVALIAÇÃO
// =====================================================================
router.delete('/:id/avaliacoes/:avaliacaoId', authMiddleware, async (req, res) => {
  const avaliacaoId = req.params.avaliacaoId;
  const userId = req.user.id;

  try {
    const [[avaliacao]] = await db.query(
      'SELECT usuario_id FROM avaliacoes WHERE id = ?',
      [avaliacaoId]
    );

    if (!avaliacao)
      return res.status(404).json({ mensagem: 'Avaliação não encontrada.' });

    if (avaliacao.usuario_id !== userId)
      return res.status(403).json({ mensagem: 'Sem permissão.' });

    await db.query('DELETE FROM avaliacao_respostas WHERE avaliacao_id = ?', [avaliacaoId]);
    await db.query('DELETE FROM avaliacao_reacoes WHERE avaliacao_id = ?', [avaliacaoId]);
    await db.query('DELETE FROM avaliacoes WHERE id = ?', [avaliacaoId]);

    res.json({ mensagem: 'Avaliação removida!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao excluir avaliação.' });
  }
});

router.delete('/avaliacao/resposta/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    const [[resp]] = await db.query(
      'SELECT usuario_id FROM avaliacao_respostas WHERE id = ?',
      [id]
    );

    if (!resp)
      return res.status(404).json({ mensagem: 'Resposta não encontrada.' });

    if (resp.usuario_id !== userId)
      return res.status(403).json({ mensagem: 'Sem permissão.' });

    await db.query('DELETE FROM avaliacao_respostas WHERE id = ?', [id]);

    res.json({ mensagem: 'Resposta excluída!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao excluir resposta.' });
  }
});


module.exports = router;
