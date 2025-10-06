// // ===========================================
// // CONFIGURAÇÕES GLOBAIS
// // ===========================================

// // 🚨 ATENÇÃO: Substitua pela URL base correta da sua API!
// // O fetch automático do browser adiciona o protocolo e host (ex: http://localhost:8080)
// // Se você está usando rotas relativas (ex: "/gerenciamentoUsuario/cadastrar"),
// // vamos usar uma URL base vazia para manter a consistência, exceto na listagem
// // onde precisamos do nome da rota completa.

// // Ajuste a rota de listagem conforme a sua configuração no Express:
// const API_LISTAGEM_USUARIOS_PATH = "/gerenciamentoUsuario/listarFuncionarios";
// const ITENS_POR_PAGINA = 14; // DEVE ser o mesmo LIMIT usado no seu Model!

// // Variável FIXA (MOCKADA) MANTIDA CONFORME SOLICITADO
// const ID_FUNCIONARIO_GERENTE_MOCK = 6; 

// // Elementos do DOM
// const tabelaConteudo = document.getElementById('Conteudo_real'); // Seu tbody para os dados reais
// const esqueletoCarregamento = document.getElementById('Estrutura_esqueleto_carregamento');
// const barraBusca = document.querySelector('.input-group input'); 
// const containerPaginacao = document.querySelector('.pagination');

// let currentPage = 1;
// let currentSearch = '';

// // ===========================================
// // FUNÇÕES AUXILIARES DE LISTAGEM
// // ===========================================

// /**
//  * Exibe ou oculta o efeito de carregamento (skeleton).
//  * @param {boolean} show - Se deve exibir (true) ou ocultar (false).
//  */
// function toggleLoading(show) {
//     if (show) {
//         // Exibe o skeleton apenas se houver um elemento para ele
//         if (esqueletoCarregamento) esqueletoCarregamento.style.display = 'contents'; 
//         if (tabelaConteudo) tabelaConteudo.innerHTML = ''; // Limpa a tabela real
//     } else {
//         if (esqueletoCarregamento) esqueletoCarregamento.style.display = 'none'; // Oculta o skeleton
//     }
// }

// /**
//  * Cria o HTML de uma linha (<tr>) da tabela para um funcionário.
//  * @param {Object} usuario - O objeto do usuário (funcionário).
//  * @returns {string} O HTML da linha.
//  */
// function createTableRow(usuario) {
//     return `
//         <tr>
//             <td>${usuario.id.toString().padStart(3, '0')}</td>
//             <td><i class="bi bi-person-circle me-2"></i>${usuario.nome}</td>
//             <td>${usuario.cpf || 'N/A'}</td>
//             <td>${usuario.email}</td>
//             <td>${usuario.funcao}</td>
//             <td>
//                 <span class="opcao_crud text-primary" data-bs-toggle="modal" onclick="getUsuariobyID(${usuario.id})"
//                     data-bs-target="#modalAtualizarMaquina">
//                     <img src="../assets/svg/atualizar_blue.svg" alt="">
//                     Atualizar
//                 </span>
//             </td>
//             <td>
//                 <span class="opcao_crud text-danger" onclick="ExcluirUsuario(${usuario.id}, '${usuario.nome}')">
//                     <img src="../assets/svg/excluir_red.svg" alt="">
//                     Excluir
//                 </span>
//             </td>
//         </tr>
//     `;
// }

// /**
//  * Renderiza o conteúdo da tabela.
//  * @param {Array} lista - Array de objetos de funcionários.
//  */
// function renderTable(lista) {
//     toggleLoading(false);
//     if (!tabelaConteudo) return; // Garante que o elemento existe

//     if (lista.length === 0) {
//         tabelaConteudo.innerHTML = '<tr><td colspan="7" class="text-center py-4">Nenhum usuário encontrado.</td></tr>';
//         return;
//     }
//     const html = lista.map(createTableRow).join('');
//     tabelaConteudo.innerHTML = html;
// }


// // ===========================================
// // FUNÇÃO PRINCIPAL: BUSCA DE DADOS (LISTAGEM PAGINADA)
// // ===========================================

// /**
//  * Busca a lista de usuários na API e renderiza a tabela e paginação.
//  * @param {number} page - A página a ser carregada.
//  * @param {string} search - O termo de busca.
//  */
// window.fetchUsuarios = async function (page = 1, search = '') {
//     // A função é exportada globalmente para ser usada na paginação (onclick)
    
//     toggleLoading(true); 
//     currentPage = page;
//     currentSearch = search;

//     // Constrói a URL para a sua rota de listagem
//     let url = `/gerenciamentoUsuario/listarFuncionarios?page=${page}&limit=${ITENS_POR_PAGINA}`;
//     if (search) {
//         url += `&busca=${encodeURIComponent(search)}`;
//     }

//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`Erro de rede: ${response.status}`);
//         }
        
//         // A API retorna { data: [], totalPages: N, currentPage: N }
//         const result = await response.json();
        
//         // Renderiza a tabela e a paginação
//         renderTable(result.data);
//         renderPagination(result.totalPages, result.currentPage);

//     } catch (error) {
//         console.error("Erro ao buscar usuários:", error);
//         toggleLoading(false);
//         if (tabelaConteudo) {
//              tabelaConteudo.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Falha ao carregar dados. Verifique a API.</td></tr>';
//         }
//     }
// }

// // ===========================================
// // LÓGICA DE PAGINAÇÃO
// // ===========================================

// /**
//  * Cria a estrutura de paginação.
//  * @param {number} totalPages - Número total de páginas.
//  * @param {number} activePage - A página atual.
//  */
// function renderPagination(totalPages, activePage) {
//     if (!containerPaginacao) return; // Garante que o elemento existe
    
//     let html = '';
//     const maxVisiblePages = 5;

//     // Botão "Anterior"
//     html += `
//         <li class="page-item ${activePage <= 1 ? 'disabled' : ''}">
//             <a class="page-link" href="#" onclick="fetchUsuarios(${activePage - 1}, currentSearch)">Anterior</a>
//         </li>
//     `;

//     // Lógica para mostrar links de página
//     let startPage = Math.max(1, activePage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//     if (endPage - startPage + 1 < maxVisiblePages) {
//         startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }
    
//     // Links numéricos
//     for (let i = startPage; i <= endPage; i++) {
//         html += `
//             <li class="page-item ${i === activePage ? 'active active_pagina' : ''}">
//                 <a class="page-link" href="#" onclick="fetchUsuarios(${i}, currentSearch)">${i}</a>
//             </li>
//         `;
//     }

//     // Botão "Seguinte"
//     html += `
//         <li class="page-item ${activePage >= totalPages ? 'disabled' : ''}">
//             <a class="page-link" href="#" onclick="fetchUsuarios(${activePage + 1}, currentSearch)">Seguinte</a>
//         </li>
//     `;

//     containerPaginacao.innerHTML = `<ul class="pagination pagination-sm">${html}</ul>`;
// }


// // ===========================================
// // LÓGICA DE BUSCA/FILTRO
// // ===========================================

// function debounce(func, delay) {
//     let timeoutId;
//     return (...args) => {
//         clearTimeout(timeoutId);
//         timeoutId = setTimeout(() => {
//             func.apply(this, args);
//         }, delay);
//     };
// }

// const handleSearch = debounce(() => {
//     const termoBusca = barraBusca ? barraBusca.value.trim() : '';
//     fetchUsuarios(1, termoBusca); // Sempre busca na primeira página (1)
// }, 500); 

// if (barraBusca) {
//     barraBusca.addEventListener('input', handleSearch);
// }


// // ===========================================
// // SUAS FUNÇÕES (CRUD existentes)
// // ===========================================


// // CADASTRO
// function cadastrar() {
//     // ... (Sua lógica de Cadastro) ...
//     var nome = document.getElementById('nome_input').value;
//     var email = document.getElementById('email_input').value;
//     var cpf = document.getElementById('cpf_input').value;
//     var senha = document.getElementById('senha_input').value;
//     var fkTipoUsuario = document.getElementById('tipo_usuario_select').value;
//     var idFuncionario = 5; // administrador logado

//     if (!nome || !email || !cpf || !senha || !fkTipoUsuario) {
//         exibirErro("Erro de Validação", "Preencha todos os campos corretamente!");
//         return;
//     }

//     fetch("/gerenciamentoUsuario/cadastrar", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//             nomeServer: nome,
//             cpfServer: cpf,
//             emailServer: email,
//             fkTipoUsuarioServer: fkTipoUsuario,
//             senhaServer: senha,
//             idFuncionarioServer: idFuncionario
//         }),
//     })
//         .then(res => {
//             if (res.ok) {
//                  exibirSucesso("Cadastro Sucesso", "Cadastro realizado com sucesso!");
//                  fetchUsuarios(currentPage, currentSearch); // Recarrega a lista
//                  // Fechar a modal aqui, se necessário
//             }
//             else res.json().then(json => exibirErro("Erro no Cadastro", `Erro: ${json.message || json}`));
//         })
//         .catch(err => exibirErro("Erro de Rede", "Não foi possível conectar ao servidor: " + err));
// }


// // BUSCA TIPOS DE USUÁRIO (para o SELECT)
// function getTipoUsuario() {
//     var select = document.getElementById('tipo_usuario_select');
//     // Se a select para atualização não estiver na página, pegue a outra
//     if (!select) select = document.getElementById('tipo_usuario_select_upd'); 
//     if (!select) return; // Sai se não encontrar o select

//     fetch("/gerenciamentoUsuario/getTipoUsuario")
//         .then(res => {
//             if (res.status === 204) {
//                 select.innerHTML = '<option value="" disabled selected>Nenhum tipo cadastrado</option>';
//                 throw new Error("Nenhum tipo de usuário encontrado.");
//             }
//             if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
//             return res.json();
//         })
//         .then(tipos => {
//             select.innerHTML = '<option value="" disabled selected>Selecione a Função</option>';
//             tipos.forEach(tipo => {
//                 const option = document.createElement('option');
//                 option.value = tipo.idTipoUsuario;
//                 option.text = tipo.nomeTipo;
//                 select.appendChild(option);
//             });
//         })
//         .catch(erro => {
//             console.error("Falha ao carregar tipos de usuário:", erro);
//             select.innerHTML = '<option value="" disabled selected>Erro ao carregar</option>';
//         });
// }


// // BUSCA DADOS DO USUÁRIO POR ID (Para Modals de Atualização)
// window.getUsuariobyID = function (idFuncionario) {
//     // A função é exportada globalmente para ser usada no onclick da tabela
    
//     // Garante que o select de tipos de usuário está populado antes de tentar selecionar o valor
//     getTipoUsuario(); 

//     fetch(`/gerenciamentoUsuario/getUsuariobyID/${idFuncionario}`)
//         .then(res => {
//             if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
//             return res.json();
//         })
//         .then(dados => {
//             if (dados.length === 0) {
//                 exibirErro("Erro de Busca", "Usuário não encontrado!");
//                 return;
//             }

//             var usuario = dados[0];

//             // Preenche os dados atuais
//             document.getElementById("nome_atual").innerText = usuario.nome;
//             document.getElementById("email_atual").innerText = usuario.email;
//             document.getElementById("tipoUsuario_atual").innerText = usuario.tipoUsuario;

//             // Preenche os inputs de atualização
//             document.getElementById("ipt_nome").value = usuario.nome;
//             document.getElementById("ipt_email").value = usuario.email;
//             document.getElementById("ipt_senha").value = usuario.senha || "";

//             // O botão 'Finalizar' precisa saber qual ID salvar
//             document.getElementById("btnAvancarUpd").setAttribute('onclick', `salvarEdicao(${idFuncionario})`);

//             // Seleciona o tipo de usuário no Select (Usa o 'intervalo' para esperar o load)
//             var selectTipo = document.getElementById("tipo_usuario_select");
//             if (selectTipo) {
//                 const intervalo = setInterval(() => {
//                     if (selectTipo.options.length > 1) { // Verifica se já carregou os tipos
//                         selectTipo.value = usuario.fkTipoUsuario;
//                         clearInterval(intervalo);
//                     }
//                 }, 100);
//             }
//         })
//         .catch(error => exibirErro("Erro de Busca", `Falha ao buscar dados do usuário: ${error.message}`));
// }


// // SALVAR EDIÇÃO
// window.salvarEdicao = function (idFuncionario) {
//     // A função é exportada globalmente para ser usada no onclick do modal
    
//     var nome = document.getElementById("ipt_nome").value;
//     var email = document.getElementById("ipt_email").value;
//     var senha = document.getElementById("ipt_senha").value;
//     var fkTipoUsuario = document.getElementById("tipo_usuario_select").value;

//     if (!nome || !email || !fkTipoUsuario) {
//         exibirErro("Erro de Validação", "Preencha todos os campos obrigatórios!");
//         return;
//     }

//     var bodyData = {
//         idFuncionarioServer: idFuncionario,
//         nomeServer: nome,
//         emailServer: email,
//         senhaServer: senha,
//         fkTipoUsuarioServer: fkTipoUsuario
//     };

//     fetch("/gerenciamentoUsuario/salvarEdicao", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(bodyData)
//     }) 
//     .then(res => {
//         if (res.ok) {
//             exibirSucesso("Edição Salva", "Alterações salvas com sucesso!");
//             fetchUsuarios(currentPage, currentSearch); // Recarrega a lista
//             // Você deve fechar a modal aqui, se usar JS do Bootstrap
//         } else {
//             res.json().then(json => exibirErro("Erro ao Salvar", `Erro: ${json.erro || json.message}`));
//         }
//     })
//     .catch(err => exibirErro("Erro de Rede", "Não foi possível conectar ao servidor: " + err));
// }


// // EXCLUSÃO
// window.ExcluirUsuario = function (idFuncionario) {
//     // Sua lógica de exclusão com SweetAlert e validação de senha
//     // ... (O código é o mesmo que você forneceu) ...

//     Swal.fire({
//         title: 'Excluir Usuário',
//         html: `
//             <div class="form-group text-left mb-3">
//             <p class="text-muted mb-3">Para confirmar a exclusão do Usuário, por favor, confirme com sua senha:</p>
//             <label for="swal-input-senha" class="form-label font-weight-bold">Senha do Gerente</label>
//             <input type="password" id="swal-input-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
//             </div>
//             <div class="form-group text-left">
//             <label for="swal-input-confirmar-senha" class="form-label font-weight-bold">Confirmar Senha</label>
//             <input type="password" id="swal-input-confirmar-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
//             </div>
//         `,
//         // ... (configurações do SweetAlert) ...
//         icon: 'warning',
//         iconColor: '#ffc107',
//         showCancelButton: true,
//         confirmButtonText: 'Excluir',
//         cancelButtonText: 'Cancelar',
//         focusConfirm: false,
//         buttonsStyling: false,
//         customClass: {
//             confirmButton: 'btn btn-danger btn-lg mx-2',
//             cancelButton: 'btn btn-secondary btn-lg mx-2',
//             popup: 'shadow-lg',
//             input: 'form-control'
//         },
//         preConfirm: () => {
//             const senha = Swal.getPopup().querySelector('#swal-input-senha').value;
//             const confirmarSenha = Swal.getPopup().querySelector('#swal-input-confirmar-senha').value;

//             if (!senha || !confirmarSenha) {
//                 Swal.showValidationMessage('Por favor, preencha ambos os campos de senha.');
//                 return false;
//             }
//             if (senha !== confirmarSenha) {
//                 Swal.showValidationMessage('As senhas digitadas não são iguais.');
//                 return false;
//             }
//             return { senha: senha };
//         }
//     })
//     .then((resultadoSwal) => { 
//         if (resultadoSwal.isConfirmed) {
//             const idFuncionarioGerente = ID_FUNCIONARIO_GERENTE_MOCK; 
//             const senhaGerente = resultadoSwal.value.senha; 

//             return fetch(`/gerenciamentoUsuario/ExcluirUsuario/${idFuncionario}`, {
//                 method: "DELETE",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     idGerente: idFuncionarioGerente,
//                     senha: senhaGerente
//                 })
//             })
//             .then(res => {
//                 if (res.ok) {
//                     exibirSucesso('Exclusão Concluída', 'O Usuário foi excluído com sucesso.');
//                     fetchUsuarios(currentPage, currentSearch); // Recarrega a lista
//                 } else {
//                     res.text().then(mensagemErro => {
//                         exibirErro('Erro na Exclusão', mensagemErro || 'Erro desconhecido ao tentar excluir.');
//                     });
//                 }
//             })
//             .catch(err => {
//                 exibirErro('Erro de Rede', 'Não foi possível conectar ao servidor: ' + err);
//             });
//         }
//     });
// }


// // Funções auxiliares para SweetAlert
// function exibirSucesso(titulo, texto) {
//     Swal.fire({
//         title: titulo,
//         text: texto,
//         icon: 'success',
//         confirmButtonColor: '#0C8186',
//         confirmButtonText: 'OK'
//     });
// }

// function exibirErro(titulo, texto) {
//     Swal.fire({
//         title: titulo,
//         text: texto,
//         icon: 'error',
//         confirmButtonColor: '#0C8186',
//         confirmButtonText: 'OK'
//     });
// }

// // ===========================================
// // INICIALIZAÇÃO DA PÁGINA
// // ===========================================

// document.addEventListener("DOMContentLoaded", function () {
//     // 1. Carrega os tipos de usuário (necessário para as modais de cadastro/edição)
//     getTipoUsuario();
    
//     // 2. Inicia o carregamento da lista de funcionários na página 1
//     fetchUsuarios(1, ''); 
// });