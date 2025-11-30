const usuarioModel = require('../models/CadastroModel');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

const BOT_USER_IDS = (process.env.BOT_PADRAO_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter((id) => id.length > 0);

const ADMINS_PADRAO_EMAILS = (process.env.ADMINS_PADRAO_EMAILS || '')
  .split(';')
  .map((email) => email.trim())
  .filter((email) => email.length > 0);

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

async function convidarMembrosParaCanal(idCanalSlack) {
  const urlInvite = 'https://slack.com/api/conversations.invite'; 

  let idsParaConvidar = [...BOT_USER_IDS]; 

  const buscarIdSlackPorEmail = async (email) => {
    try {
      const urlLookup = 'https://slack.com/api/users.lookupByEmail';
      const responseLookup = await axios.get(urlLookup, {
        params: { email: email },
        headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      });
      if (responseLookup.data.ok && responseLookup.data.user) {
        return responseLookup.data.user.id;
      } else {
        console.warn(`Aviso: Usuário Slack não encontrado para o e-mail: ${email}`);
        return null;
      }
    } catch (e) {
      console.error(`Erro ao buscar ID Slack para ${email}:`, e.message);
      return null;
    }
  }; 
  console.log(`Iniciando busca por ${ADMINS_PADRAO_EMAILS.length} Admins Padrão...`); 
  const idsAdminsPadrao = await Promise.all(ADMINS_PADRAO_EMAILS.map(buscarIdSlackPorEmail)); 
  idsParaConvidar = idsParaConvidar.concat(idsAdminsPadrao.filter((id) => id !== null));

  let todosOsMembros = [...new Set(idsParaConvidar)].filter((id) => id.length > 0);

  if (todosOsMembros.length === 0) {
    console.log('Nenhum membro (bot ou admin) para convidar. Finalizando processo de convite.');
    return;
  }

  console.log(`Convidando IDs: ${todosOsMembros.join(', ')} para o canal ${idCanalSlack}`); 

  try {
    const responseInvite = await axios.post(
      urlInvite,
      {
        channel: idCanalSlack,
        users: todosOsMembros.join(','),
      },
      {
        headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json' },
      },
    );

    if (responseInvite.data.ok) {
      console.log(`Sucesso! ${todosOsMembros.length} membros convidados para o canal.`);
    } else {
      console.error('Erro ao convidar membros:', responseInvite.data.error);
    }
  } catch (e) {
    console.error('Erro na requisição de convite:', e.message);
  }
}

async function gerenciarCanalSlack(nomeCanal) {
  const url = 'https://slack.com/api/conversations.create';
  try {
    const response = await axios.post(
      url,
      {
        name: nomeCanal,
        is_private: true,
      },
      {
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.data.ok) {
      console.error('Erro ao criar canal no Slack:', response.data.error);
      throw new Error(`Slack API Error: ${response.data.error}`);
    }

    const canal = response.data.channel;
    const idCanalSlack = canal.id;
    const linkCanalSlack = `https://app.slack.com/client/${canal.shared_team_ids[0] || 'TID_DO_WORKSPACE'}/${idCanalSlack}`;

    console.log(`Canal criado com sucesso. ID: ${idCanalSlack}`); 

    await convidarMembrosParaCanal(idCanalSlack);

    return {
      idCanalSlack: idCanalSlack,
      linkCanalSlack: linkCanalSlack,
    };
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
      // 1. Busca o usuário no BD
      const resultado = await usuarioModel.buscarPorEmail(email);
      if (resultado.length == 0) {
        return res.status(403).json({ mensagem: 'Email ou senha inválidos.' });
      }
      const usuarioEncontrado = resultado[0];
      
      // 2. Compara a senha
      const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);
      if (!senhaCorreta) {
        return res.status(403).json({ mensagem: 'Email ou senha inválidos.' });
      }

      // 3. ** CORREÇÃO CRÍTICA: SALVANDO O USUÁRIO NA SESSÃO **
      // Isso popula o req.session.usuario que estava faltando
      req.session.usuario = {
          idFuncionario: usuarioEncontrado.idFuncionario, 
          nome: usuarioEncontrado.nome,
          fkTipoUsuario: usuarioEncontrado.fkTipoUsuario,
          fkEmpresa: usuarioEncontrado.fkEmpresa // Adicionei fkEmpresa, se estiver disponível no resultado
      };

      // 4. Retorna para o Front-end
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

      const canalSlack = await gerenciarCanalSlack(nomeCanal);

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