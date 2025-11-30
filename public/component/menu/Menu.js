document.addEventListener('DOMContentLoaded', function () {
  const DASHBOARD_MAP = {
    ver_dash_monitoramento: { nome: 'Monitoramento Ativo', url: 'painel.html' },
    ver_dash_nathan: { nome: 'Análise Historica', url: 'analiseHistorica.html' },
    ver_dash_bruna: { nome: 'Análise de rede', url: 'analiseRede.html' },
    ver_dash_pedro: { nome: 'Análise de Parâmetros', url: 'dashPedro.html' },
    ver_dash_jhoel: { nome: 'Análise de Desempenho', url: 'análiseDesempenho.html' },
    ver_dash_dandara: { nome: 'Gestão de Risco', url: 'dashboardRiscoOperacional.html' },
    ver_dash_miguel: { nome: 'Gestão de Ativos', url: 'DashboardMiguel.html' },
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

        // ALTERAÇÃO: Adicionado data-target-url para mapeamento posterior na ativação
        htmlPaineis += `
                    <a class="${itemClass}" 
                       href="${dash.url}" 
                       id="dash_${permissao.substring(9)}"
                       data-target-url="${dash.url}"> 
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

  function ativarLinkAtual() {
    const pathCompleto = window.location.pathname;
    const nomeDoArquivo = pathCompleto.substring(pathCompleto.lastIndexOf('/') + 1) || 'home.html';
    const links = document.querySelectorAll(
      '.nav-item-fixed, .submenu-item, .offcanvas-link, .offcanvas-submenu-item, .nav-link-accordion-toggle, .offcanvas-accordion-toggle'
    );
    links.forEach(link => {
      link.classList.remove('active-link'); 
      const submenu = link.nextElementSibling;
      if (submenu && submenu.classList.contains('collapse') && submenu.classList.contains('show')) {
          submenu.classList.remove('show');
          link.setAttribute('aria-expanded', 'false');
      }
    });
    
    if (nomeDoArquivo === 'home.html' || nomeDoArquivo === '') {
        document.getElementById('menu_home')?.classList.add('active-link');
        document.getElementById('menu_home_mobile')?.classList.add('active-link');
        return;
    }
    links.forEach(link => {
      const href = link.getAttribute('href') || link.getAttribute('data-target-url');
      const hrefFileName = href ? href.substring(href.lastIndexOf('/') + 1) : null;
      
      if (hrefFileName === nomeDoArquivo) {
        
        link.classList.add('active-link');
        
        const isSubmenuItem = link.classList.contains('submenu-item') || link.classList.contains('offcanvas-submenu-item');
        
        if (isSubmenuItem) {
          const accordionParent = link.closest('.nav-item-accordion, .nav-item-accordion.mb-1');
          if (accordionParent) {
            const linkPai = accordionParent.querySelector('.nav-link-accordion-toggle, .offcanvas-accordion-toggle');
            const submenu = accordionParent.querySelector('.collapse');
            if (linkPai) {
                linkPai.classList.add('active-link');
            }
            if (submenu && !submenu.classList.contains('show')) {
                submenu.classList.add('show');
                linkPai?.setAttribute('aria-expanded', 'true');
            }
          }
        }
      }
    });
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
        document.getElementById('pc_slack').href = usuarioObjeto.LinkCanalSlack || "https://slack.com/"
        document.getElementById('slack_home')? document.getElementById('slack_home').href = usuarioObjeto.LinkCanalSlack || "https://slack.com/" : console.log("não home")

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
        ativarLinkAtual();
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