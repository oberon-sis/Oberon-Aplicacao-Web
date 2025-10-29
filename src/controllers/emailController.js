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
            -- ${email}
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
            INSERT INTO TokenRecuperacao (fkFuncionario, hashToken , horarioExpiracao ) VALUES 
            (${usuario.idFuncionario},'${token}','${expiracaoToken}' )
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
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de Senha</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
                    <tr>
                        <td style="padding: 40px; text-align: center;">

                            <img src="https://i.imgur.com/Z22FIZJ.png" 
                                 alt="OBERON Logo" 
                                 width="150" 
                                 height="auto" 
                                 style="display: block; 
                                        margin: 0 auto; 
                                        padding-bottom: 25px; /* Espaço abaixo da logo */
                                        max-width: 150px;">
                            
                            <h2 style="color: #333333; margin-top: 0; margin-bottom: 30px; font-size: 20px;">
                                🔒 Solicitação de Redefinição de Senha
                            </h2>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                                Você solicitou uma redefinição de senha para o e-mail <b>${email}</b>.
                            </p>
                            
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                Clique no botão abaixo para redefinir sua senha. Este link expirará em <b>1 hora</b>.
                            </p>

                            <a href="${resetUrl}" 
                                style="display: inline-block; 
                                        color: white; 
                                        background-color: #0c8186; /* Cor ajustada para o estilo OBERON */
                                        padding: 12px 25px; 
                                        text-decoration: none; 
                                        border-radius: 6px; 
                                        font-size: 16px; 
                                        font-weight: bold; 
                                        box-shadow: 0 2px 4px rgba(12, 129, 134, 0.4);">
                                Redefinir Senha
                            </a>
                            
                            <p style="margin-top: 30px; color: #777777; font-size: 14px;">
                                Se você não solicitou esta redefinição, por favor, ignore este e-mail. Nenhuma alteração será feita na sua conta.
                            </p>

                        </td>
                    </tr>
                </table>
                
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin-top: 20px; background-color: #ffffff; border-radius: 8px;">
                    <tr>
                        <td align="center" style="padding: 30px 40px 10px 40px;">

                            <img src="https://i.imgur.com/Z22FIZJ.png" alt="OBERON Logo" width="120" height="auto" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
                            
                            <p style="color: #555555; font-size: 18px; margin-top: 10px; margin-bottom: 20px;">
                                <b>Sua segurança é nossa prioridade.</b>
                            </p>

                            <div style="width: 100%; border-top: 1px solid #eeeeee; margin: 20px 0;"></div>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="text-align: left;">
                                <tr>
                                    <td width="33%" style="color: #555555; font-size: 14px; padding-bottom: 20px;">
                                        <img src="https://i.imgur.com/civoh7f.png" alt="Email" width="18" height="16" style="vertical-align: middle; margin-right: 5px;">
                                        <span style="vertical-align: middle;">suporte@oberon.tech</span>
                                    </td>
                                    
                                    <td width="33%" style="color: #555555; font-size: 14px; padding-bottom: 20px;">
                                        <img src="https://i.imgur.com/3qJupDg.png" alt="Link" width="18" height="16" style="vertical-align: middle; margin-right: 5px;">
                                        <span style="vertical-align: middle;"><a href="${process.env.FRONTEND_URL}" style="color: #40babd; text-decoration: none;">www.oberon-sis.tech</a></span>
                                    </td>
                                    
                                    <td width="33%" style="color: #555555; font-size: 14px; padding-bottom: 20px; text-align: right;">
                                        <img src="https://i.imgur.com/nXcqSmk.png" alt="Local" width="18" height="16" style="vertical-align: middle; margin-right: 5px;">
                                        <span style="vertical-align: middle;">R. Haddock Lobo 595, SP-BR</span>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td style="padding: 20px; text-align: center; color: #999999; font-size: 12px;">
                            <p>&copy; 2025 Oberon Tech. Todos os direitos reservados.</p>
                            <p>Este é um e-mail automático, por favor não responda.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>
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
            SELECT tk.fkFuncionario as idFuncionario  FROM TokenRecuperacao as tk
            JOIN Funcionario as f on tk.fkFuncionario = f.idFuncionario
            WHERE f.email = '${email}' 
              AND tk.hashToken  = '${token}' 
              AND tk.horarioExpiracao > '${dataAtual}'
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
            SET senha = '${novoHash}'
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
