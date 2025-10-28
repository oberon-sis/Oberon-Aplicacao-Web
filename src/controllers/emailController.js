// src/controllers/emailController.js

const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const database = require('../database/config');

// CONFIGURAÇÃO DO OUTLOOK
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

// ---------------------------------------------------
// FUNÇÃO 1: Solicitar o Link (POST /auth/esqueci-senha)
// ---------------------------------------------------
async function esqueciSenha(req, res) {
  const { email } = req.body;
  let usuario = null;

  // 1. Verificar se o e-mail existe no BD
  try {
    const resultado = await database.executar(`
            SELECT idFuncionario FROM Funcionario WHERE email = '${email}'
        `);
    if (resultado.length > 0) {
      usuario = resultado[0];
    }
  } catch (error) {
    console.error('Erro ao buscar usuário no BD:', error);
    return res.status(500).json({ msg: 'Erro interno do servidor.' });
  }

  if (!usuario) {
    return res.status(200).json({ msg: 'Se o e-mail estiver cadastrado, o link será enviado.' });
  }

  // 2. Gerar Token e Expiração (1 hora)
  const token = crypto.randomBytes(32).toString('hex');
  // Formato 'YYYY-MM-DD HH:MM:SS' para o MySQL
  const expiracaoToken = new Date(Date.now() + 3600000)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  // 3. Salvar Token e Expiração no BD
  try {
    // 💥 AQUI: Usando tokenReset e okenExpira (correto conforme seu schema!)
    await database.executar(`
            UPDATE Funcionario 
            SET tokenReset = '${token}', tokenExpira = '${expiracaoToken}' 
            WHERE idFuncionario = ${usuario.idFuncionario}
        `);
  } catch (error) {
    console.error('Erro ao salvar token no BD:', error);
    return res.status(500).json({ msg: 'Erro interno ao salvar token.' });
  }

  // 4. Preparar e Enviar E-mail
  const resetUrl = `${process.env.FRONTEND_URL}/redefinir_senha.html?token=${token}&email=${email}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'OBERON - Redefinição de Senha',
    html: `
            <p>Você solicitou uma redefinição de senha para o e-mail ${email}.</p>
            <p>Clique no link abaixo para redefinir sua senha. Este link expirará em 1 hora.</p>
            <a href="${resetUrl}" style="color: white; background-color: #007bff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
            <p style="margin-top: 20px;">Se você não solicitou isso, ignore este e-mail.</p>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de recuperação enviado com sucesso para:', email);
    res.status(200).json({
      msg: 'Link de redefinição de senha enviado para o seu e-mail!',
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({
      msg: 'Falha ao enviar e-mail. Verifique suas credenciais de SMTP.',
      erro: error.message,
    });
  }
}

// --------------------------------------------------
// FUNÇÃO 2: Redefinir a Senha (POST /auth/redefinir-senha)
// --------------------------------------------------
async function redefinirSenha(req, res) {
  const { email, token, novaSenha } = req.body;

  let usuario = null;
  const dataAtual = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // 1. Buscar usuário e validar existência/expiração
  try {
    // 💥 AQUI: Usamos tokenReset e okenExpira e verificamos se não expirou
    const resultado = await database.executar(`
            SELECT idFuncionario FROM Funcionario 
            WHERE email = '${email}' 
              AND tokenReset = '${token}' 
              AND tokenExpira > '${dataAtual}'
        `);
    if (resultado.length > 0) {
      usuario = resultado[0];
    }
  } catch (error) {
    console.error('Erro ao buscar token no BD:', error);
    return res.status(500).json({ msg: 'Erro interno ao validar token.' });
  }

  if (!usuario) {
    return res.status(400).json({ msg: 'O link é inválido, expirou ou já foi utilizado.' });
  }

  try {
    // 2. Gerar HASH da Nova Senha
    const novoHash = await bcrypt.hash(novaSenha, 10);

    // 3. Atualizar Senha e Invalidar Token
    await database.executar(`
            UPDATE Funcionario 
            SET senha = '${novoHash}', tokenReset = NULL, tokenExpira = NULL 
            WHERE idFuncionario = ${usuario.idFuncionario}
        `);

    console.log(`Senha redefinida com sucesso para: ${email}`);

    // 4. Resposta de Sucesso
    res.status(200).json({ msg: 'Senha redefinida com sucesso! Você já pode fazer login.' });
  } catch (error) {
    console.error('Erro ao redefinir senha e salvar no BD:', error);
    res.status(500).json({ msg: 'Falha interna ao redefinir senha.' });
  }
}

module.exports = {
  esqueciSenha,
  redefinirSenha,
};
