const usuarioModel = require('../models/CadastroModel');
const bcrypt = require('bcryptjs');


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

  finalizarCadastro(req, res) {
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

    usuarioModel
      .cadastrar(empresa, usuario)
      .then((resultado) => {
        res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!' });
      })
      .catch((erro) => {
        console.error('Houve um erro ao realizar o cadastro:', erro);
        if (erro.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ mensagem: 'Erro: CNPJ, CPF ou E-mail já cadastrado.' });
        }
        res.status(500).json({ mensagem: 'Erro interno do servidor.', erro: erro.message });
      });
  },

  getMenu(req, res) {
    const idUsuario = req.params.idUsuario;
    if (idUsuario == undefined) {
      return res.status(400).send('Seu idUsuario está undefined!');
    }
    usuarioModel
      .getMenu(idUsuario)
      .then((resultado) => {
        if (resultado.length === 0) {
          return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }
        const permissoesDoBanco = resultado[0].permissoes;
        const permissoesArray = permissoesDoBanco.split(';');
        const menu = {
          alertaSuportePC:
            gerarLinkHTML(modulos.home) +
            (permissoesArray.includes('ver_alertas') ? gerarLinkHTML(modulos.alertas) : '') +
            (permissoesArray.includes('ver_suporte') ? gerarLinkHTML(modulos.suporte) : ''),
          painelPC: permissoesArray.includes('ver_paineis')
            ? gerarDropdownHTML(modulos.paineis, false)
            : '',
          gestaoAreaPC: gerarSecaoGestaoHTML(permissoesArray, false),
          alertaSuporteMobile:
            gerarLinkHTML(modulos.home) +
            (permissoesArray.includes('ver_alertas') ? gerarLinkHTML(modulos.alertas) : '') +
            (permissoesArray.includes('ver_suporte') ? gerarLinkHTML(modulos.suporte) : ''),
          painelMobile: permissoesArray.includes('ver_paineis')
            ? gerarDropdownHTML(modulos.paineis, true)
            : '',
          gestaoAreaMobile: gerarSecaoGestaoHTML(permissoesArray, true),
        };
        res.status(200).json(menu);
      })
      .catch((erro) => {
        console.error(
          'Houve um erro ao realizar a procura de permissões! Erro:',
          erro.sqlMessage || erro,
        );
        res.status(500).json(erro.sqlMessage || 'Erro interno do servidor.');
      });
  },
};

module.exports = usuarioController;
