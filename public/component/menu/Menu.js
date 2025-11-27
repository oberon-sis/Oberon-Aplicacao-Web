document.addEventListener('DOMContentLoaded', function () {
  const DASHBOARD_MAP = {
    ver_dash_monitoramento: { nome: 'Monitoramento Ativo', url: 'painel.html' },
    ver_dash_historico: { nome: 'Análise Histórica', url: 'painelEspecifico.html' },
    ver_dash_pedro: { nome: 'Análise de Parâmetros', url: 'dashPedro.html' },
    ver_dash_jhoel: { nome: 'Análise de Desempenho', url: 'análiseDesempenho.html' },
    ver_dash_dandara: { nome: 'Gestão de Risco', url: 'dashboardRiscoOperacional.html' },
    ver_dash_miguel: { nome: 'Gestão de Ativos', url: 'DashboardMiguel.html' },
    ver_dash_bruna: { nome: 'Risco de Componentes', url: 'riscoComponente.html' },
    ver_dash_nathan: { nome: 'Dashboard Nathan', url: 'dashNathan.html' },
  };

  function ocultarElementoSeNaoPermitido(id, isPermitido) {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.style.display = isPermitido ? '' : 'none';
    }
  }

  function construirPaineis(permissoes, containerId, isMobile) {
    const container = document.getElementById(containerId);
    if (!container) return false;

    let htmlPaineis = '';
    let paineisGerados = 0;

    for (const permissao in DASHBOARD_MAP) {
      if (permissoes.includes(permissao)) {
        const dash = DASHBOARD_MAP[permissao];

        const itemClass = isMobile ? 'offcanvas-submenu-item' : 'submenu-item';

        htmlPaineis += `
                    <a class="${itemClass}" href="${dash.url}" id="dash_${permissao.substring(9)}">
                        <span class="nav-text-fixed">${dash.nome}</span>
                    </a>
                `;
        paineisGerados++;
      }
    }

    container.innerHTML = htmlPaineis;
    return paineisGerados > 0;
  }

  function renderizarMenuPorPermissao(permissoesStringLimpa) {
    const permissoes = permissoesStringLimpa ? permissoesStringLimpa.split(';') : [];

    const paineisDesktopGerados = construirPaineis(permissoes, 'submenuPainel', false);
    const paineisMobileGerados = construirPaineis(permissoes, 'submenuPainelMobile', true);

    const verContainerPaineis =
      permissoes.includes('ver_paineis') && (paineisDesktopGerados || paineisMobileGerados);

    const podeVerAlertas = permissoes.includes('ver_alertas');
    const podeVerSuporte = permissoes.includes('ver_suporte');
    const podeGerirUsuarios = permissoes.includes('gerir_usuarios');
    const podeGerirMaquinas = permissoes.includes('gerir_maquinas');
    const podeGerirEmpresa = permissoes.includes('gerir_empresa');
    const podeVerAuditoria = podeGerirUsuarios || podeGerirMaquinas;

    ocultarElementoSeNaoPermitido('menu_paineis_container', verContainerPaineis);

    ocultarElementoSeNaoPermitido('menu_alertas', podeVerAlertas);
    ocultarElementoSeNaoPermitido('menu_suporte_desktop', podeVerSuporte);

    ocultarElementoSeNaoPermitido('menu_usuarios', podeGerirUsuarios);
    ocultarElementoSeNaoPermitido('menu_maquinas', podeGerirMaquinas);
    ocultarElementoSeNaoPermitido('nmenu_auditoria', podeVerAuditoria);
    const podeVerSecaoGestao = podeGerirUsuarios || podeGerirMaquinas || podeVerAuditoria;
    ocultarElementoSeNaoPermitido('menu_gestao', podeVerSecaoGestao);

    ocultarElementoSeNaoPermitido('menu_empresa', podeGerirEmpresa);
    ocultarElementoSeNaoPermitido('menu_admin', podeGerirEmpresa);

    ocultarElementoSeNaoPermitido('menu_paineis_container_mobile', verContainerPaineis);
    ocultarElementoSeNaoPermitido('menu_alertas_mobile', podeVerAlertas);
    ocultarElementoSeNaoPermitido('menu_suporte_mobile', podeVerSuporte);

    ocultarElementoSeNaoPermitido('menu_usuarios_mobile', podeGerirUsuarios);
    ocultarElementoSeNaoPermitido('menu_maquinas_mobile', podeGerirMaquinas);
    ocultarElementoSeNaoPermitido('nmenu_auditoria_mobile', podeVerAuditoria);
    ocultarElementoSeNaoPermitido('menu_empresa_mobile', podeGerirEmpresa);

    const gestaoMobile = document.getElementById('gestaoAreaMobile');
    if (gestaoMobile) {
      gestaoMobile.style.display = podeVerSecaoGestao ? '' : 'none';
    }
    const adminMobile = document.getElementById('adminAreaMobile');
    if (adminMobile) {
      adminMobile.style.display = podeGerirEmpresa ? '' : 'none';
    }
  }

  fetch('../component/menu/MenuEsqueleto.html')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar o esqueleto do menu.');
      }
      return response.text();
    })
    .then((html) => {
      document.getElementById('menu-container').innerHTML = html;

      const usuarioString = sessionStorage.getItem('usuario');
      let permissoesUsuario = null;

      if (usuarioString) {
        const usuarioObjeto = JSON.parse(usuarioString);

        document.getElementById('nome_de_usuario').innerHTML = usuarioObjeto.nome || 'Usuário';
        document.getElementById('email_de_usaurio').innerHTML =
          usuarioObjeto.email || '(Sem e-mail)';

        permissoesUsuario = usuarioObjeto.permissoes;

        if (!permissoesUsuario) {
          const tipo = usuarioObjeto.fkTipoUsuario;
          console.warn(`Permissões não encontradas. Mapeando para fkTipoUsuario: ${tipo}`);

          const permissoesPadrao = 'ver_dash_monitoramento;ver_dash_historico;';
          let permissoesEspecificas = '';

          switch (tipo) {
            case 1002:
              permissoesEspecificas =
                'editar_info;ver_paineis;ver_alertas;ver_suporte;gerir_usuarios;gerir_maquinas;gerir_empresa;ver_dash_pedro;ver_dash_jhoel;ver_dash_dandara;ver_dash_miguel;ver_dash_nathan;ver_dash_bruna';
              break;

            case 1001:
              permissoesEspecificas =
                'editar_info;ver_paineis;ver_alertas;ver_suporte;gerir_usuarios;gerir_maquinas;ver_dash_pedro;ver_dash_jhoel;ver_dash_nathan;ver_dash_bruna';
              break;

            case 1000:
              permissoesEspecificas =
                'editar_info;ver_paineis;ver_alertas;ver_suporte;ver_dash_nathan;ver_dash_bruna';
              break;

            default:
              console.error(`fkTipoUsuario ${tipo} não reconhecido.`);
              permissoesEspecificas = '';
              break;
          }
          permissoesUsuario = permissoesPadrao + permissoesEspecificas;
        }
      }

      const permissoesLimpa = (permissoesUsuario || '')
        .replace(/\s/g, '')
        .replace(/;{2,}/g, ';')
        .replace(/(^;)|(;$)/g, '');

      setTimeout(() => {
        renderizarMenuPorPermissao(permissoesLimpa);
      }, 50);
    })
    .catch((error) => {
      console.error('Falha ao carregar o menu:', error);
      const menuContainer = document.getElementById('menu-container');
      if (menuContainer) {
        menuContainer.innerHTML =
          '<p class="text-danger p-4">Não foi possível carregar o menu.</p>';
      }
    });
});
