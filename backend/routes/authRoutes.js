// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const router = express.Router();

// =======================================================
// === ROTA DE CADASTRO (POST /api/auth/register) ===
// =======================================================
router.post('/register', async (req, res) => {
  const { nome_usuario, email, senha } = req.body;

  if (!nome_usuario || !email || !senha) {
    return res.status(400).json({ mensagem: 'Por favor, preencha todos os campos.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);

    const [result] = await db.query(
      'INSERT INTO usuarios (nome_usuario, email, senha_hash) VALUES (?, ?, ?)',
      [nome_usuario, email, hashedPassword]
    );

    res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuarioId: result.insertId });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Email ou nome de usuário já existe.' });
    }
    res.status(500).json({ mensagem: 'Erro no servidor.', erro: error.message });
  }
});

// =======================================================
// === LOGIN ===
// =======================================================
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Por favor, preencha todos os campos.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    const payload = { id: user.id, nome_usuario: user.nome_usuario };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({
      mensagem: 'Login bem-sucedido!',
      token,
      id: user.id,
      nome_usuario: user.nome_usuario
    });

  } catch (error) {
    res.status(500).json({ mensagem: 'Erro no servidor.', erro: error.message });
  }
});

// =======================================================
// === SOLICITAR CÓDIGO — /forgot-password ===
// =======================================================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ mensagem: 'Nenhuma conta encontrada com este email.' });
    }

    // código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // hash do código para salvar no banco
    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await db.query(`
      UPDATE usuarios
      SET reset_token = ?, reset_token_expira = ?
      WHERE id = ?
    `, [hashedCode, expires, user.id]);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'colasmoreira@gmail.com',
        pass: 'iwzldrkdapasznti'
      }
    });

    const emailHtml = `
  <body style="font-family:Poppins,sans-serif;">
    <div style="max-width:600px;margin:auto;padding:20px;background:#fff;border-radius:12px;">
      <h2 style="text-align:center;color:#12182B;">Seu Código de Redefinição</h2>

      <p style="font-size:16px;color:#444;">
        Olá <strong>${user.nome_usuario}</strong>,<br><br>
        Você solicitou a redefinição da sua senha no Gastronauta.
        Use o código abaixo para continuar o processo.
      </p>

      <div style="text-align:center;margin:30px 0;">
        <span style="
          font-size:38px;
          font-weight:bold;
          letter-spacing:10px;
          color:#12182B;">
          ${resetCode}
        </span>
      </div>

      <p style="font-size:14px;color:#444;">
        ⏱ O código expira em <strong>10 minutos</strong>.<br>
        ❗ Não compartilhe este código com ninguém.
      </p>
    </div>
  </body>
`;

    await transporter.sendMail({
      to: user.email,
      from: 'Gastronauta <colasmoreira@gmail.com>',
      subject: 'Seu Código de Redefinição - Gastronauta',
      html: emailHtml
    });

    res.json({ mensagem: 'Um código foi enviado para seu email.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// =======================================================
// === VERIFICAR CÓDIGO — /verify-reset-code ===
// =======================================================
router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ mensagem: 'Email e código são obrigatórios.' });
  }

  try {
    const hashed = crypto.createHash('sha256').update(code).digest('hex');

    const [rows] = await db.query(`
      SELECT * FROM usuarios
      WHERE email = ? AND reset_token = ? AND reset_token_expira > NOW()
    `, [email, hashed]);

    if (!rows[0]) {
      return res.status(400).json({ mensagem: 'Código inválido ou expirado.' });
    }

    res.json({ mensagem: 'Código válido!' });

  } catch (error) {
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});

// =======================================================
// === DEFINIR A NOVA SENHA — /reset-password ===
// =======================================================
router.post('/reset-password', async (req, res) => {
  const { email, code, novaSenha } = req.body;

  if (!email || !code || !novaSenha) {
    return res.status(400).json({ mensagem: 'Email, código e nova senha são obrigatórios.' });
  }

  try {
    const hashed = crypto.createHash('sha256').update(code).digest('hex');

    const [rows] = await db.query(`
      SELECT * FROM usuarios
      WHERE email = ? AND reset_token = ? AND reset_token_expira > NOW()
    `, [email, hashed]);

    const user = rows[0];

    if (!user) {
      return res.status(400).json({ mensagem: 'Código inválido ou expirado.' });
    }

    const newHash = await bcrypt.hash(novaSenha, 10);

    await db.query(`
      UPDATE usuarios
      SET senha_hash = ?, reset_token = NULL, reset_token_expira = NULL
      WHERE id = ?
    `, [newHash, user.id]);

    res.json({ mensagem: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno.' });
  }
});
// =======================================================
// === EXCLUIR CONTA (POST /api/auth/delete-account) ===
// =======================================================
router.post('/delete-account', async (req, res) => {
  const { senha } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!senha) {
    return res.status(400).json({ mensagem: "Senha obrigatória." });
  }

  try {
    if (!token) {
      return res.status(401).json({ mensagem: "Token ausente." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const [[user]] = await db.query(
      "SELECT senha_hash FROM usuarios WHERE id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha_hash);

    if (!senhaCorreta) {
      return res.status(403).json({ mensagem: "Senha incorreta." });
    }

    await db.query("DELETE FROM usuarios WHERE id = ?", [userId]);

    res.json({ mensagem: "Conta excluída com sucesso." });

  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    res.status(500).json({ mensagem: "Erro no servidor ao excluir conta." });
  }
});


module.exports = router;
