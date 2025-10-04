const ID_GERENTE = 5;
const ID_FUNCIONARIO_GERENTE_MOCK = 6;
const limitePorPagina = 14;

let paginaAtual = 1;
let valor_parametro = "nome";
let termo = "";

const parametroOberon = {
  cpu: 80,
  ram: 10,
  disco: 20,
  rede: 30,
};
const parametroEmpresa = {
  cpu: 90,
  ram: 5,
  disco: 10,
  rede: 15,
};

let ipt_nome_cad, ipt_modelo_cad, ipt_mac_cad;
let ipt_cpu_cad, ipt_ram_cad, ipt_disco_cad, ipt_rede_cad;
let ipt_pesquisa;

function mudar_icone_on(id_da_img) {
  const icone = document.getElementById(id_da_img);
  if (!icone) return;
  if (!icone.dataset.srcNormal) {
    icone.dataset.srcNormal = icone.src;
  }
  const srcHover = icone.dataset.hoverSrc;
  icone.src = srcHover;
}

function mudar_icone_lv(id_da_img) {
  const icone = document.getElementById(id_da_img);
  if (!icone) return;
  const srcNormal = icone.dataset.srcNormal;
  icone.src = srcNormal;
}

function exibirSucesso(titulo, texto) {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: "success",
    confirmButtonColor: "#0C8186",
    confirmButtonText: "OK",
  });
}

function exibirErro(titulo, texto) {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: "error",
    confirmButtonColor: "#0C8186",
    confirmButtonText: "OK",
  });
}

function debounce(func, delay = 250) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function buscarEFiltrar(termoDeBusca) {
  const termoFiltrado = termoDeBusca.trim();
  carregarMaquinas(paginaAtual, valor_parametro, termoFiltrado);
}

const buscarDebounced = debounce(buscarEFiltrar, 400);

function getTermo() {
  termo = ipt_pesquisa.value;
}

function atualizar_parametro_lista(valor) {
  let span_txt = document.getElementById("valor_pesquisa");
  let texto = "";

  if (valor == 1) {
    texto = "Nome";
    valor_parametro = "nome";
  } else if (valor == 2) {
    texto = "Hostname";
    valor_parametro = "hostname";
  } else if (valor == 3) {
    texto = "Mac Address";
    valor_parametro = "macAddress";
  } else if (valor == 4) {
    texto = "IP";
    valor_parametro = "ip";
  }

  span_txt.innerHTML = texto;
  carregarMaquinas(1, valor_parametro, termo);
}

function navigateSteps(
  direction,
  step1,
  step2,
  btnAvancar,
  btnVoltar,
  btnCadastrar
) {
  if (direction === "next") {
    step1.style.display = "none";
    btnAvancar.style.display = "none";
    step2.style.display = "block";
    btnVoltar.style.display = "inline-block";
    btnCadastrar.style.display = "inline-block";
  } else if (direction === "prev") {
    step2.style.display = "none";
    btnVoltar.style.display = "none";
    btnCadastrar.style.display = "none";
    step1.style.display = "block";
    btnAvancar.style.display = "inline-block";
  }
}

function navigateStepsUpd(
  direction,
  step1Upd,
  step2Upd,
  btnAvancarUpd,
  btnVoltarUpd,
  btnCadastrarUpd,
  dadosAtuaisIdentificacao,
  dadosAtuaisAlertas
) {
  if (direction === "next") {
    step1Upd.style.display = "none";
    btnAvancarUpd.style.display = "none";
    step2Upd.style.display = "block";
    btnVoltarUpd.style.display = "inline-block";
    btnCadastrarUpd.style.display = "inline-block";
    dadosAtuaisIdentificacao.style.display = "none";
    dadosAtuaisAlertas.style.display = "block";
  } else if (direction === "prev") {
    step2Upd.style.display = "none";
    btnVoltarUpd.style.display = "none";
    btnCadastrarUpd.style.display = "none";
    step1Upd.style.display = "block";
    btnAvancarUpd.style.display = "inline-block";
    dadosAtuaisIdentificacao.style.display = "block";
    dadosAtuaisAlertas.style.display = "none";
  }
}

function toggleParametros(
  checkboxEmpresa,
  checkboxOberon,
  paramsContainer,
  paramInputs
) {
  const isDisabled = checkboxEmpresa.checked || checkboxOberon.checked;

  let dataSource = null;
  if (checkboxOberon.checked) {
    dataSource = parametroOberon;
  } else if (checkboxEmpresa.checked) {
    dataSource = parametroEmpresa;
  }

  paramInputs.forEach((input) => {
    const inputId = input.id;
    let valor = "";

    if (dataSource) {
      if (inputId.includes("cpu")) valor = dataSource.cpu;
      else if (inputId.includes("ram")) valor = dataSource.ram;
      else if (inputId.includes("disco")) valor = dataSource.disco;
      else if (inputId.includes("rede")) valor = dataSource.rede;
    }

    input.value = valor !== undefined ? valor : "";

    input.disabled = isDisabled;
    input.classList.toggle("text-muted", isDisabled);
  });

  if (paramsContainer)
    paramsContainer.classList.toggle("text-muted", isDisabled);
}

function salvarParametrosEmpresa(event, configModal) {
  event.preventDefault();

  // const cpuLimite = document.getElementById('ipt_cpu_config').value;
  // const ramLimite = document.getElementById('ipt_ram_config').value;

  configModal.hide();
  Swal.fire({
    title: "Configuração Salva!",
    text: "Os Parâmetros Padrão da Empresa foram atualizados com sucesso.",
    icon: "success",
    confirmButtonColor: "#0C8186",
    confirmButtonText: "OK",
  }).then((result) => {});
}

function excluir_maquina(idMaquina) {
  Swal.fire({
    title: "Excluir Máquina",
    html: `
      <div class="form-group text-left mb-3">
        <p class="text-muted mb-3">Para confirmar a exclusão da Máquina, por favor, confirme abaixo</p>
        <label for="swal-input-senha" class="form-label font-weight-bold">Senha</label>
        <input type="password" id="swal-input-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
      </div>
      <div class="form-group text-left">
        <label for="swal-input-confirmar-senha" class="form-label font-weight-bold">Confirmar Senha</label>
        <input type="password" id="swal-input-confirmar-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
      </div>
    `,
    icon: "warning",
    iconColor: "#ffc107",
    showCancelButton: true,
    confirmButtonText: "Excluir",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    buttonsStyling: false,
    customClass: {
      confirmButton: "btn btn-danger btn-lg mx-2",
      cancelButton: "btn btn-secondary btn-lg mx-2",
      popup: "shadow-lg",
      input: "form-control",
    },
    preConfirm: () => {
      const senha = Swal.getPopup().querySelector("#swal-input-senha").value;
      const confirmarSenha = Swal.getPopup().querySelector(
        "#swal-input-confirmar-senha"
      ).value;
      if (!senha || !confirmarSenha) {
        Swal.showValidationMessage(
          "Por favor, preencha ambos os campos de senha."
        );
        return false;
      }
      if (senha !== confirmarSenha) {
        Swal.showValidationMessage("As senhas digitadas não são iguais.");
        return false;
      }
      return { senha: senha };
    },
  }).then((resultadoSwal) => {
    if (resultadoSwal.isConfirmed) {
      const idFuncionarioGerente = ID_FUNCIONARIO_GERENTE_MOCK;
      const senhaGerente = resultadoSwal.value.senha;
      console.log(senhaGerente);
      return fetch(`/maquinas/excluirMaquina/${idMaquina}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idGerente: idFuncionarioGerente,
          senha: senhaGerente,
        }),
      })
        .then((res) => {
          if (res.ok) {
            exibirSucesso(
              "Exclusão Concluída",
              "A Máquina foi excluída com sucesso."
            );
            carregarMaquinas(paginaAtual, valor_parametro, termo);
          } else {
            res.text().then((mensagemErro) => {
              exibirErro(
                "Erro na Exclusão",
                mensagemErro || "Erro desconhecido ao tentar excluir."
              );
            });
          }
        })
        .catch((err) => {
          exibirErro(
            "Erro de Rede",
            "Não foi possível conectar ao servidor: " + err
          );
        });
    } else if (resultadoSwal.dismiss === Swal.DismissReason.cancel) {
      exibirErro(
        "Exclusão Cancelada",
        "A exclusão da Máquina foi cancelada pelo usuário."
      );
    }
  });
}

async function carregarMaquinas(pagina, valor_parametro, termoDePesquisa) {
  getTermo();
  document.getElementById("Conteudo_real").style.display = "none";
  document.getElementById("Estrutura_esqueleto_carregamento").style.display =
    "1";
  let pesquisa = termoDePesquisa;
  if (!ID_GERENTE) {
    alert("Erro: ID do gerente não encontrado. Faça login novamente.");
    return;
  }
  paginaAtual = pagina;
  try {
    const response = await fetch(
      `/maquinas/listarMaquinas?idGerente=${ID_GERENTE}&pagina=${paginaAtual}&limite=${limitePorPagina}&valorParametro=${valor_parametro}&termoDePesquisa=${pesquisa}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const erro = await response.text();
      throw new Error(`Erro na API: ${erro}`);
    }
    const data = await response.json();
    renderizarTabela(data.dados);
    renderizarPaginacao(data.totalPaginas, data.paginaAtual);
  } catch (error) {
    console.error("Falha ao carregar máquinas:", error); // Assumindo que Conteudo_real é definido
    const elementoTabela = document.getElementById("Conteudo_real");
    const elementoPaginacao = document.getElementById("paginazacao");
    elementoTabela.innerHTML = `<tr><td colspan="9" style="text-align:center;">Erro ao carregar dados: ${error.message}</td></tr>`;
    if (elementoPaginacao) elementoPaginacao.innerHTML = "";
  }
}

function renderizarTabela(maquinas) {
  let html = "";
  const elementoTabela = document.getElementById("Conteudo_real");

  if (maquinas.length === 0) {
    html =
      '<tr><td colspan="9" style="text-align:center;">Nenhuma máquina encontrada.</td></tr>';
  } else {
    maquinas.forEach((m) => {
      html += `
                <tr data-id-maquina="${m.idMaquina}">
                    <td>${m.idMaquina}</td>
                    <td><i class="bi bi-person-circle me-2"></i>${m.nome}</td>
                    <td>${m.hostname}</td>
                    <td>${m.modelo}</td>
                    <td>${m.status}</td>
                    <td>${m.sistemaOperacional}</td>
                    <td>${m.macAddress}</td>
                    <td>${m.ip}</td>
                    <td><span class="opcao_crud text-primary" data-bs-toggle="modal"
                                data-bs-target="#modalAtualizarMaquina"
                                onClick="getDadosById(${m.idMaquina})"
                                >
                                <img src="../assets/svg/atualizar_blue.svg" alt="">
                                Atualizar
                                
                                <i class="bi bi-arrow-clockwise"></i>
                        </span>
                    </td>
                    <td><span class="opcao_crud text-danger" onclick="excluir_maquina(${m.idMaquina})">
                                <img src="../assets/svg/excluir_red.svg" alt="">
                                Excluir
                                <i class="bi bi-trash"></i></span>
                    </td>
                </tr>
            `;
    });
  }
  setTimeout(() => {
    document.getElementById("Estrutura_esqueleto_carregamento").style.display =
      "none";
    elementoTabela.innerHTML = html;
  }, 500);
  elementoTabela.style.display = "";
}

function getDadosById(idMaquina) {
  alert(idMaquina);
}

function renderizarPaginacao(totalPaginas, paginaAtual) {
  const elementoPaginacao = document.getElementById("paginazacao");
  if (!elementoPaginacao) return;
  const elementoPaginacao_ul = elementoPaginacao.querySelector("ul");
  if (!elementoPaginacao_ul) {
    elementoPaginacao.innerHTML = `<ul class="pagination pagination-sm"></ul>`;
    elementoPaginacao_ul = elementoPaginacao.querySelector("ul");
  }

  let htmlLista = "";

  const desabilitarAnterior = paginaAtual === 1 ? "disabled" : "";
  const paginaAnterior = paginaAtual - 1;
  htmlLista += `
        <li class="page-item ${desabilitarAnterior}">
            <a class="page-link" onclick="carregarMaquinas(${paginaAnterior}, '${valor_parametro}', '${termo}'); return false;">Anterior</a>
        </li>
    `;

  for (let i = 1; i <= totalPaginas; i++) {
    const ativo = i === paginaAtual ? "active_pagina" : "";

    if (
      i === 1 ||
      i === totalPaginas ||
      (i >= paginaAtual - 2 && i <= paginaAtual + 2)
    ) {
      htmlLista += `
                <li class="page-item ${ativo}">
                    <a class="page-link" onclick="carregarMaquinas(${i}, '${valor_parametro}', '${termo}'); return false;">${i}</a>
                </li>
            `;
    } else if (i === paginaAtual - 3 || i === paginaAtual + 3) {
      htmlLista += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
    }
  }

  const desabilitarSeguinte = paginaAtual === totalPaginas ? "disabled" : "";
  const paginaSeguinte = paginaAtual + 1;
  htmlLista += `
        <li class="page-item ${desabilitarSeguinte}">
            <a class="page-link" onclick="carregarMaquinas(${paginaSeguinte}, '${valor_parametro}', '${termo}'); return false;">Seguinte</a>
        </li>
    `;

  elementoPaginacao_ul.innerHTML = htmlLista;
}

function getOrigemLimite(checkboxEmpresa, checkboxOberon) {
  if (checkboxEmpresa.checked) {
    return "EMPRESA";
  } else if (checkboxOberon.checked) {
    return "OBERON";
  }
  return "ESPECIFICO";
}
async function atualizarMaquina() {}

async function cadastrarMaquina() {
  const nome = ipt_nome_cad ? ipt_nome_cad.value : "";
  const modelo = ipt_modelo_cad ? ipt_modelo_cad.value : "";
  const macAddress = ipt_mac_cad ? ipt_mac_cad.value : "";

  const checkboxEmpresa = document.getElementById("alertaEmpresa");
  const checkboxOberon = document.getElementById("alertaOberon");

  const cpuLimite = ipt_cpu_cad ? ipt_cpu_cad.value : "";
  const ramLimite = ipt_ram_cad ? ipt_ram_cad.value : "";
  const discoLimite = ipt_disco_cad ? ipt_disco_cad.value : "";
  const redeLimite = ipt_rede_cad ? ipt_rede_cad.value : "";

  if (!nome || !macAddress) {
    exibirErro(
      "Campos Obrigatórios",
      "Por favor, preencha o nome e o Mac Address da máquina."
    );
    return;
  }

  const origemParametro = getOrigemLimite(checkboxEmpresa, checkboxOberon);

  if (origemParametro === "ESPECIFICO") {
    if (!cpuLimite || !ramLimite || !discoLimite || !redeLimite) {
      exibirErro(
        "Limites Faltando",
        "Por favor, defina todos os limites de alerta individualmente."
      );
      return;
    }
  }

  const dadosMaquina = {
    idFuncionario: ID_GERENTE,
    nome,
    modelo,
    macAddress,
    origemParametro,

    limites:
      origemParametro === "ESPECIFICO"
        ? [
            { tipo: "CPU", limite: parseFloat(cpuLimite) },
            { tipo: "RAM", limite: parseFloat(ramLimite) },
            { tipo: "Disco Duro", limite: parseFloat(discoLimite) },
            { tipo: "PlacaRede", limite: parseFloat(redeLimite) },
          ]
        : [],
  };

  try {
    const response = await fetch("/maquinas/cadastrarMaquina", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosMaquina),
    });

    if (response.ok) {
      exibirSucesso(
        "Cadastro Concluído",
        `A máquina ${nome} foi cadastrada com sucesso!`
      );
      carregarMaquinas(1, valor_parametro, termo);
    } else {
      const erro = await response.text();
      exibirErro(
        "Erro no Cadastro",
        erro || "Erro desconhecido ao cadastrar a máquina."
      );
    }
  } catch (error) {
    console.error("Erro de rede ao cadastrar:", error);
    exibirErro(
      "Erro de Rede",
      "Não foi possível conectar ao servidor para cadastrar."
    );
  }
}

document.addEventListener("DOMContentLoaded", function () {
  ipt_pesquisa = document.getElementById("ipt_pesquisa");

  ipt_nome_cad = document.getElementById("ipt_nome_cad");
  ipt_modelo_cad = document.getElementById("ipt_modelo_cad");
  ipt_mac_cad = document.getElementById("ipt_mac_cad");
  ipt_cpu_cad = document.getElementById("ipt_cpu_cad");
  ipt_ram_cad = document.getElementById("ipt_ram_cad");
  ipt_disco_cad = document.getElementById("ipt_disco_cad");
  ipt_rede_cad = document.getElementById("ipt_rede_cad");

  const formConfig = document.getElementById("formConfigParametros");
  const modalElementConfig = document.getElementById("modalConfigParametros");

  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  const btnAvancar = document.getElementById("btnAvancar");
  const btnVoltar = document.getElementById("btnVoltar");
  const btnCadastrar = document.getElementById("btnCadastrar");

  const step1Upd = document.getElementById("step-update-1");
  const step2Upd = document.getElementById("step-update-2");
  const btnAvancarUpd = document.getElementById("btnAvancarUpd");
  const btnVoltarUpd = document.getElementById("btnVoltarUpd");
  const btnAtualizar = document.getElementById("btnCadastrarUpd");

  const checkboxEmpresa = document.getElementById("alertaEmpresa");
  const checkboxOberon = document.getElementById("alertaOberon");
  const paramsContainer = document.getElementById("parametrizacaoIndividual");
  const paramInputs = [
    ipt_cpu_cad,
    ipt_ram_cad,
    ipt_disco_cad,
    ipt_rede_cad,
  ].filter(Boolean);

  const dadosAtuaisIdentificacao = document.getElementById(
    "dadosAtuaisIdentificacao"
  );
  const dadosAtuaisAlertas = document.getElementById("dadosAtuaisAlertas");
  const checkboxEmpresaUpd = document.getElementById("alertaEmpresaUpd");
  const checkboxOberonUpd = document.getElementById("alertaOberonUpd");
  const paramsContainerUpd = document.getElementById(
    "parametrizacaoIndividualUpd"
  );
  const paramInputsUpd = paramsContainerUpd
    ? paramsContainerUpd.querySelectorAll("input")
    : [];
  const modalElementUpd = document.getElementById("modalAtualizarMaquina");

  const modalAjuda = document.getElementById("modalMacHelp");
  const btnAbrir = document.getElementById("btnOpenMacHelp");
  const btnFecharX = document.getElementById("btnCloseMacHelp");
  const btnFechar = document.getElementById("btnFecharMacHelp");

  if (ID_GERENTE) {
    carregarMaquinas(1, "nome", "");
  } else {
    alert("Sessão inválida. Por favor, faça login.");
  }

  if (btnAbrir)
    btnAbrir.addEventListener("click", () => {
      modalAjuda.style.display = "block";
    });
  if (btnFecharX)
    btnFecharX.addEventListener("click", () => {
      modalAjuda.style.display = "none";
    });
  if (btnFechar)
    btnFechar.addEventListener("click", () => {
      modalAjuda.style.display = "none";
    });
  if (modalAjuda) {
    modalAjuda.addEventListener("click", function (event) {
      if (event.target === modalAjuda) modalAjuda.style.display = "none";
    });
  }
  const tabElms = document.querySelectorAll("#macTab button");
  tabElms.forEach(function (tabElm) {
    new bootstrap.Tab(tabElm);
  });

  if (checkboxEmpresa && checkboxOberon) {
    const handleCheckboxChange = (event) => {
      const clickedCheckbox = event.target;
      if (clickedCheckbox.checked) {
        if (clickedCheckbox.id === "alertaEmpresa") {
          checkboxOberon.checked = false;
        } else if (clickedCheckbox.id === "alertaOberon") {
          checkboxEmpresa.checked = false;
        }
      }
      toggleParametros(
        checkboxEmpresa,
        checkboxOberon,
        paramsContainer,
        paramInputs
      );
    };
    checkboxEmpresa.addEventListener("change", handleCheckboxChange);
    checkboxOberon.addEventListener("change", handleCheckboxChange);
    toggleParametros(
      checkboxEmpresa,
      checkboxOberon,
      paramsContainer,
      paramInputs
    );
  }
  if (btnAvancar)
    btnAvancar.addEventListener("click", () =>
      navigateSteps("next", step1, step2, btnAvancar, btnVoltar, btnCadastrar)
    );
  if (btnVoltar)
    btnVoltar.addEventListener("click", () =>
      navigateSteps("prev", step1, step2, btnAvancar, btnVoltar, btnCadastrar)
    );

  if (btnCadastrar) {
    btnCadastrar.addEventListener("click", cadastrarMaquina);
  }

  if (checkboxEmpresaUpd && checkboxOberonUpd) {
    const handleCheckboxChangeUpd = (event) => {
      const clickedCheckbox = event.target;
      if (clickedCheckbox.checked) {
        if (clickedCheckbox.id === "alertaEmpresaUpd") {
          checkboxOberonUpd.checked = false;
        } else if (clickedCheckbox.id === "alertaOberonUpd") {
          checkboxEmpresaUpd.checked = false;
        }
      }
      toggleParametros(
        checkboxEmpresaUpd,
        checkboxOberonUpd,
        paramsContainerUpd,
        paramInputsUpd
      );
    };
    checkboxEmpresaUpd.addEventListener("change", handleCheckboxChangeUpd);
    checkboxOberonUpd.addEventListener("change", handleCheckboxChangeUpd);
    toggleParametros(
      checkboxEmpresaUpd,
      checkboxOberonUpd,
      paramsContainerUpd,
      paramInputsUpd
    );
  }
  if (btnAvancarUpd)
    btnAvancarUpd.addEventListener("click", () =>
      navigateStepsUpd(
        "next",
        step1Upd,
        step2Upd,
        btnAvancarUpd,
        btnVoltarUpd,
        btnAtualizar,
        dadosAtuaisIdentificacao,
        dadosAtuaisAlertas
      )
    );
  if (btnVoltarUpd)
    btnVoltarUpd.addEventListener("click", () =>
      navigateStepsUpd(
        "prev",
        step1Upd,
        step2Upd,
        btnAvancarUpd,
        btnVoltarUpd,
        btnAtualizar,
        dadosAtuaisIdentificacao,
        dadosAtuaisAlertas
      )
    );

  if (modalElementUpd) {
    modalElementUpd.addEventListener("show.bs.modal", function (event) {
      navigateStepsUpd(
        "prev",
        step1Upd,
        step2Upd,
        btnAvancarUpd,
        btnVoltarUpd,
        btnAtualizar,
        dadosAtuaisIdentificacao,
        dadosAtuaisAlertas
      );
      toggleParametros(
        checkboxEmpresaUpd,
        checkboxOberonUpd,
        paramsContainerUpd,
        paramInputsUpd
      );
    });
  }

  if (btnAtualizar) {
    btnAtualizar.addEventListener("click", atualizarMaquina);
  }

  if (formConfig && modalElementConfig) {
    const configModal = new bootstrap.Modal(modalElementConfig);
    formConfig.addEventListener("submit", (event) =>
      salvarParametrosEmpresa(event, configModal)
    );
  }

  if (ipt_pesquisa) {
    ipt_pesquisa.addEventListener("input", (event) => {
      if (event.target.value == "") {
        valor_parametro = "nome";
        termo = "";
      }
      buscarDebounced(event.target.value);
    });
  }
});
