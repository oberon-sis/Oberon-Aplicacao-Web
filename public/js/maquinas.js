// const ID_GERENTE = sessionStorage.getItem('idUsuario'); 
const ID_GERENTE = 5;
let paginaAtual = 1;
const limitePorPagina = 14;
let termo =  ''


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

const ID_FUNCIONARIO_GERENTE_MOCK = 6;

function excluir_maquina(idMaquina) {
    Swal.fire({
        title: 'Excluir Máquina',
        html: `
      <div class="form-group text-left mb-3">
        <p class="text-muted mb-3">Para confirmar a exclusão da Máquina, por favor, confirme abaixo</p>
        <label for="swal-input-senha" class="form-label font-weight-bold">Senha</label>
        <input type="password" id="swal-input-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
      </div>
      <div class="form-group text-left">
        <label for="swal-input-confirmar-senha" class="form-label font-weight-bold">Confirmar Senha</label>
        <input type="password" id="swal-input-confirmar-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
      </div>
    `,
        icon: 'warning',
        iconColor: '#ffc107',

        showCancelButton: true,
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',

        focusConfirm: false,

        buttonsStyling: false,
        customClass: {
            confirmButton: 'btn btn-danger btn-lg mx-2',
            cancelButton: 'btn btn-secondary btn-lg mx-2',
            popup: 'shadow-lg',
            input: 'form-control'
        },
        preConfirm: () => {
            const senha = Swal.getPopup().querySelector('#swal-input-senha').value;
            const confirmarSenha = Swal.getPopup().querySelector('#swal-input-confirmar-senha').value;

            if (!senha || !confirmarSenha) {
                Swal.showValidationMessage('Por favor, preencha ambos os campos de senha.');
                return false;
            }

            if (senha !== confirmarSenha) {
                Swal.showValidationMessage('As senhas digitadas não são iguais.');
                return false;
            }

            return { senha: senha };
        }
    })
        .then((resultadoSwal) => {

            if (resultadoSwal.isConfirmed) {

                const idFuncionarioGerente = ID_FUNCIONARIO_GERENTE_MOCK;
                const senhaGerente = resultadoSwal.value.senha;
                console.log(senhaGerente)

                return fetch(`/maquinas/excluirMaquina/${idMaquina}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        idGerente: idFuncionarioGerente,
                        senha: senhaGerente
                    })
                })
                    .then(res => {
                        console.log("=====================")
                        console.log(res)
                        console.log("=====================")
                        if (res.ok) {
                            exibirSucesso('Exclusão Concluída', 'A Máquina foi excluída com sucesso.');
                            carregarMaquinas(paginaAtual,valor_parametro,  termo)
                        } else {
                            res.text().then(mensagemErro => {
                                exibirErro('Erro na Exclusão', mensagemErro || 'Erro desconhecido ao tentar excluir.');
                            });
                        }
                    })
                    .catch(err => {
                        exibirErro('Erro de Rede', 'Não foi possível conectar ao servidor: ' + err);
                    });

            } else if (resultadoSwal.dismiss === Swal.DismissReason.cancel) {
                exibirErro('Exclusão Cancelada', 'A exclusão da Máquina foi cancelada pelo usuário.');
            }

        });
}

function exibirSucesso(titulo, texto) {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: 'success',
        confirmButtonColor: '#0C8186',
        confirmButtonText: 'OK'
    });
}

function exibirErro(titulo, texto) {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: 'error',
        confirmButtonColor: '#0C8186',
        confirmButtonText: 'OK'
    });
}



document.addEventListener('DOMContentLoaded', function cadastrarMaquina() {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const btnAvancar = document.getElementById('btnAvancar');
    const btnVoltar = document.getElementById('btnVoltar');
    const btnCadastrar = document.getElementById('btnCadastrar');

    const checkboxEmpresa = document.getElementById('alertaEmpresa');
    const checkboxOberon = document.getElementById('alertaOberon');
    const paramsContainer = document.getElementById('parametrizacaoIndividual');
    const paramInputs = paramsContainer.querySelectorAll('input');
    function toggleParametros() {
        const isDisabled = checkboxEmpresa.checked || checkboxOberon.checked;

        paramInputs.forEach(input => {
            input.disabled = isDisabled;
            input.classList.toggle('text-muted', isDisabled);
        });
        paramsContainer.classList.toggle('text-muted', isDisabled);
    }

    function handleCheckboxChange(event) {
        const clickedCheckbox = event.target;

        if (clickedCheckbox.checked) {
            if (clickedCheckbox.id === 'alertaEmpresa') {
                checkboxOberon.checked = false;
            } else if (clickedCheckbox.id === 'alertaOberon') {
                checkboxEmpresa.checked = false;
            }
        }

        toggleParametros();
    }

    function navigateSteps(direction) {
        if (direction === 'next') {
            step1.style.display = 'none';
            btnAvancar.style.display = 'none';

            step2.style.display = 'block';
            btnVoltar.style.display = 'inline-block';
            btnCadastrar.style.display = 'inline-block';
        } else if (direction === 'prev') {
            step2.style.display = 'none';
            btnVoltar.style.display = 'none';
            btnCadastrar.style.display = 'none';

            step1.style.display = 'block';
            btnAvancar.style.display = 'inline-block';
        }
    }

    checkboxEmpresa.addEventListener('change', handleCheckboxChange);
    checkboxOberon.addEventListener('change', handleCheckboxChange);
    btnAvancar.addEventListener('click', () => navigateSteps('next'));
    btnVoltar.addEventListener('click', () => navigateSteps('prev'));
    toggleParametros();
});

document.addEventListener('DOMContentLoaded', function () {
    const step1 = document.getElementById('step-update-1');
    const step2 = document.getElementById('step-update-2');

    const btnAvancar = document.getElementById('btnAvancarUpd');
    const btnVoltar = document.getElementById('btnVoltarUpd');
    const btnCadastrar = document.getElementById('btnCadastrarUpd');

    const dadosAtuaisIdentificacao = document.getElementById('dadosAtuaisIdentificacao');
    const dadosAtuaisAlertas = document.getElementById('dadosAtuaisAlertas');

    const checkboxEmpresa = document.getElementById('alertaEmpresaUpd');
    const checkboxOberon = document.getElementById('alertaOberonUpd');
    const paramsContainer = document.getElementById('parametrizacaoIndividualUpd');
    const paramInputs = paramsContainer.querySelectorAll('input');


    function toggleParametros() {
        const isDisabled = checkboxEmpresa.checked || checkboxOberon.checked;
        paramInputs.forEach(input => {
            input.disabled = isDisabled;
        });
        paramsContainer.classList.toggle('text-muted', isDisabled);
    }

    function handleCheckboxChange(event) {
        const clickedCheckbox = event.target;
        if (clickedCheckbox.checked) {
            if (clickedCheckbox.id === 'alertaEmpresaUpd') {
                checkboxOberon.checked = false;
            } else if (clickedCheckbox.id === 'alertaOberonUpd') {
                checkboxEmpresa.checked = false;
            }
        }
        toggleParametros();
    }

    function navigateSteps(direction) {
        if (direction === 'next') {
            step1.style.display = 'none';
            btnAvancar.style.display = 'none';

            step2.style.display = 'block';
            btnVoltar.style.display = 'inline-block';
            btnCadastrar.style.display = 'inline-block';

            dadosAtuaisIdentificacao.style.display = 'none';
            dadosAtuaisAlertas.style.display = 'block';

        } else if (direction === 'prev') {
            step2.style.display = 'none';
            btnVoltar.style.display = 'none';
            btnCadastrar.style.display = 'none';

            step1.style.display = 'block';
            btnAvancar.style.display = 'inline-block';

            dadosAtuaisIdentificacao.style.display = 'block';
            dadosAtuaisAlertas.style.display = 'none';
        }
    }

    checkboxEmpresa.addEventListener('change', handleCheckboxChange);
    checkboxOberon.addEventListener('change', handleCheckboxChange);

    btnAvancar.addEventListener('click', () => navigateSteps('next'));
    btnVoltar.addEventListener('click', () => navigateSteps('prev'));

    const modalElement = document.getElementById('modalAtualizarMaquina');
    modalElement.addEventListener('show.bs.modal', function (event) {

        navigateSteps('prev');
        toggleParametros();

        // care
    });

    toggleParametros();
});


document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formConfigParametros');
    const modalElement = document.getElementById('modalConfigParametros');
    const configModal = new bootstrap.Modal(modalElement);
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        configModal.hide();
        Swal.fire({
            title: 'Configuração Salva!',
            text: 'Os Parâmetros Padrão da Empresa foram atualizados com sucesso.',
            icon: 'success',
            confirmButtonColor: '#0C8186',
            confirmButtonText: 'OK'
        }).then((result) => {
        });
    });
});


var valor_parametro = ''


async function carregarMaquinas(pagina, valor_parametro,  termoDePesquisa) {
    getTermo()
    document.getElementById("Conteudo_real").style.display="none"
    document.getElementById("Estrutura_esqueleto_carregamento").style.display="1"
    var pesquisa= termoDePesquisa

    if (!ID_GERENTE) {
        alert("Erro: ID do gerente não encontrado. Faça login novamente.");
        return;
    }

    paginaAtual = pagina;

    try {
        const response = await fetch(`/maquinas/listarMaquinas?idGerente=${ID_GERENTE}&pagina=${paginaAtual}&limite=${limitePorPagina}&valorParametro=${valor_parametro}&termoDePesquisa=${pesquisa}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const erro = await response.text();
            throw new Error(`Erro na API: ${erro}`);
        }

        const data = await response.json();
        // alert("deu certo")
        renderizarTabela(data.dados);
        renderizarPaginacao(data.totalPaginas, data.paginaAtual); 

    } catch (error) {
        console.error('Falha ao carregar máquinas:', error);
        elementoTabela.innerHTML = `<tr><td colspan="9" style="text-align:center;">Erro ao carregar dados: ${error.message}</td></tr>`;
        elementoPaginacao.innerHTML = '';
    }
}


function renderizarTabela(maquinas) {
    let html = '';
    if (maquinas.length === 0) {
        html = '<tr><td colspan="9" style="text-align:center;">Nenhuma máquina encontrada.</td></tr>';
    } else {
        maquinas.forEach(m => {
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
        document.getElementById("Estrutura_esqueleto_carregamento").style.display="none"
        document.getElementById("Conteudo_real").innerHTML = html;
    }, 500);
    document.getElementById("Conteudo_real").style.display=""

}
function getDadosById(idMaquina) {
    alert(idMaquina)
}


function renderizarPaginacao(totalPaginas, paginaAtual) {
    const elementoPaginacao = document.getElementById('paginazacao'); 

    let htmlLista = '';
    
    const desabilitarAnterior = paginaAtual === 1 ? 'disabled' : '';
    const paginaAnterior = paginaAtual - 1;
    htmlLista += `
        <li class="page-item ${desabilitarAnterior}">
            <a class="page-link"  onclick="carregarMaquinas(${paginaAtual}, ${valor_parametro}, ${termo})"; return false;">Anterior</a>
        </li>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        const ativo = i === paginaAtual ? 'active_pagina' : '';
        
        if (i === 1 || i === totalPaginas || (i >= paginaAtual - 2 && i <= paginaAtual + 2)) {
            htmlLista += `
                <li class="page-item ${ativo}">
                    <a class="page-link"  onclick="carregarMaquinas(${i}, ${valor_parametro}, ${termo})"; return false;">${i}</a>
                </li>
            `;
        } 
        else if ((i === paginaAtual - 3) || (i === paginaAtual + 3)) {
            htmlLista += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }

    const desabilitarSeguinte = paginaAtual === totalPaginas ? 'disabled' : '';
    const paginaSeguinte = paginaAtual + 1;
    htmlLista += `
        <li class="page-item ${desabilitarSeguinte}">
            <a class="page-link" onclick="carregarMaquinas(${paginaAtual}, ${paginaSeguinte}, ${termo})"; return false;">Seguinte</a>
        </li>
    `;

    elementoPaginacao.innerHTML = `
        <ul class="pagination pagination-sm">
            ${htmlLista}
        </ul>
    `;
}

window.onload = function () {
    if (ID_GERENTE) {
        carregarMaquinas(1,'nome',  ''); 
    } else {
        alert("Sessão inválida. Por favor, faça login.");
    }
};



function atualizar_parametro_lista(valor) {
    var span_txt =  document.getElementById('valor_pesquisa')
    var texto = ''
    
    if (valor == 1) {
        texto = 'Nome'
        valor_parametro = 'nome'
    } if (valor == 2) {
        texto = 'Hostname'
        valor_parametro = 'hostname'
    }if (valor == 3) {
        texto = 'Mac Address'
        valor_parametro = 'macAddres'
    }if (valor == 4) {
        texto = 'IP'
        valor_parametro = 'ip'
    }
    alert(valor_parametro)
    span_txt.innerHTML = texto
}

function debounce(func, delay = 400) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
function buscarEFiltrar(termoDeBusca) {
    const termo = termoDeBusca.trim();
    carregarMaquinas(paginaAtual, valor_parametro, termo);
}

const buscarDebounced = debounce(buscarEFiltrar, 400); 

document.addEventListener('DOMContentLoaded', function() {
    const inputElement = document.getElementById('ipt_pesquisa');
    inputElement.addEventListener('input', (event) => {
        if (event.target.value == '') {
            valor_parametro = ''
        }
        buscarDebounced(event.target.value);
    });
});
function getTermo() {
    const inputElement = document.getElementById('ipt_pesquisa').value;
    termo = inputElement
}