const usuarioModel = require('../models/CadastroModel');
const { modulos } = require('../utils/menuData');
const bcrypt = require('bcryptjs');
function gerarLinkHTML(item) {
  return `<a class="nav-link rounded py-2 mb-1 d-flex align-items-center linha" href="${item.link}">
                <img src="../assets/svg/${item.icone}" alt="" class="icone_nav">
                ${item.titulo}
            </a>`;
}
function gerarDropdownHTML(item, isMobile) {
  const idDropdown = isMobile ? 'dropdownMenuLinkOffcanvas' : 'dropdownMenuLink';
  const dropdownHtml = item.dropdownItens
    .map((dItem) => `<li><a class="dropdown-item" href="#">${dItem}</a></li>`)
    .join('');
  return `
        <div class="dropdown">
            <a class="nav-link rounded py-2 mb-1 d-flex align-items-center dropdown-toggle linha" href="#"
                role="button" id="${idDropdown}" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="../assets/svg/${item.icone}" alt="" class="icone_nav">
                ${item.titulo}
            </a>
            <ul class="dropdown-menu dropdown-menu-dark w-100" aria-labelledby="${idDropdown}">
                ${dropdownHtml}
            </ul>
        </div>`;
}

function gerarSecaoGestaoHTML(permissoesArray) {
  let htmlGestao = '';
  const linksGestao = ['usuarios', 'maquinas', 'empresa'];
  const temPermissaoGestao = linksGestao.some((linkId) =>
    permissoesArray.includes(modulos[linkId].permissao),
  );

  if (temPermissaoGestao) {
    linksGestao.forEach((linkId) => {
      if (permissoesArray.includes(modulos[linkId].permissao)) {
        htmlGestao += gerarLinkHTML(modulos[linkId]);
      }
    });
    return `
            <div class="mt-4">
                <h6 class="text-uppercase text-secondary mb-3 small">Gestão</h6>
                <div class="nav flex-column">
                    ${htmlGestao}
                </div>
            </div>`;
  }
  return '';
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
