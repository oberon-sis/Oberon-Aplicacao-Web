const usuarioModel = require('../models/CadastroModel');
const bcrypt = require('bcryptjs');
const axios = require('axios'); 

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN ;

function formatarNomeCanal(razaoSocial) {
  let nomeFormatado = razaoSocial
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');

  const PREFIXO = 'alertas-';
  const MAX_LENGTH = 80 - PREFIXO.length;

  if (nomeFormatado.length > MAX_LENGTH) {
    nomeFormatado = nomeFormatado.substring(0, MAX_LENGTH);
  }

  return `${PREFIXO}${nomeFormatado}`;
}

async function criarCanalSlack(nomeCanal) {
  const url = 'https://slack.com/api/conversations.create';
  try {
    const response = await axios.post(
      url,
      {
        name: nomeCanal,
        is_private: false,
      },
      {
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.data.ok) {
      const canal = response.data.channel;
      const linkCanal = `https://app.slack.com/client/TID_DO_WORKSPACE/${canal.id}`;

      return {
        idCanalSlack: canal.id,
        linkCanalSlack: linkCanal,
      };
    } else {
      console.error('Erro ao criar canal no Slack:', response.data.error);
      throw new Error(`Slack API Error: ${response.data.error}`);
    }
  } catch (error) {
    console.error('Erro de requisição ao Slack:', error.message);
    throw new Error('Falha ao comunicar com a API do Slack.');
  }
}

const usuarioController = {
  async autenticar(req, res) {
    const email = req.body.emailServer;
    const senha = req.body.senhaServer;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }
    try {
      const resultado = await usuarioModel.buscarPorEmail(email);
      if (resultado.length == 0) {
        return res.status(403).json({ mensagem: 'Email ou senha inválidos.' });
      }
      const usuarioEncontrado = resultado[0];
      const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);
      if (!senhaCorreta) {
        return res.status(403).json({ mensagem: 'Email ou senha inválidos.' });
      }
      delete usuarioEncontrado.senha;
      res.status(200).json(usuarioEncontrado);
    } catch (erro) {
      console.error('Erro na autenticação:', erro);
      res.status(500).json({ mensagem: 'Erro interno do servidor.', erro: erro.message });
    }
  },

  async finalizarCadastro(req, res) {
    const { empresa, usuario } = req.body;

    if (
      !empresa ||
      !usuario ||
      !empresa.razaoSocial ||
      !empresa.cnpj ||
      !usuario.nome ||
      !usuario.cpf ||
      !usuario.email ||
      !usuario.senha
    ) {
      return res.status(400).json({ mensagem: 'Dados para cadastro incompletos.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const senhaHash = bcrypt.hashSync(usuario.senha, salt);
    usuario.senha = senhaHash;

    let idEmpresaCadastrada;

    try {
      const resultadoCadastro = await usuarioModel.cadastrar(empresa, usuario);

      idEmpresaCadastrada = resultadoCadastro.insertId;

      const nomeCanal = formatarNomeCanal(empresa.razaoSocial);

      const canalSlack = await criarCanalSlack(nomeCanal);

      await usuarioModel.atualizarCanalSlack(
        idEmpresaCadastrada,
        canalSlack.idCanalSlack,
        canalSlack.linkCanalSlack,
      );

      res.status(201).json({
        mensagem: 'Cadastro realizado com sucesso e canal Slack criado!',
        nomeCanal: `#${nomeCanal}`,
      });
    } catch (erro) {
      console.error('Houve um erro no processo de cadastro/slack:', erro);

      if (erro.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ mensagem: 'Erro: CNPJ, CPF ou E-mail já cadastrado.' });
      }

      res.status(500).json({ mensagem: 'Erro interno do servidor.', erro: erro.message });
    }
  },
};

module.exports = usuarioController;
