// dash_analise_desemPENHO/02_filters.js 

function setDatasIniciais() {
    popularSelect('selectMetricaPrincipal', METRICAS);
    popularSelect('selectComponente', COMPONENTES);
    popularSelect('selectVariavelRelacionada', CORRELACAO_VARS);
    
    toggleFilterFields(); 
}

function popularSelect(id, options) {
    const select = document.getElementById(id);
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '';
    
    let valueRestored = false;
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.label;
        if (option.value === currentValue) {
            opt.selected = true;
            valueRestored = true;
        }
        select.appendChild(opt);
    });
    
    if (!valueRestored && options.length > 0) {
        select.value = options[0].value;
    }
}

function popularTempoSelect(tipo) {
    let chaveTempo = tipo;
    
    // Mapeamento das chaves do HTML (agora sem acento) para as chaves do objeto
    if (tipo === 'Correlação' || tipo === 'Correlacao') {
        chaveTempo = 'Correlacao';
    } else if (tipo === 'Previsões' || tipo === 'Previsoes') {
        chaveTempo = 'Previsoes';
    } else if (tipo === 'Tendência' || tipo === 'Tendencia') {
        chaveTempo = 'Tendencia';
    }

    const options = TEMPO_OPCOES[chaveTempo]; 
    
    if (!options) {
        console.error(`Chave '${chaveTempo}' não encontrada em TEMPO_OPCOES.`);
        document.getElementById('selectTempo').innerHTML = '<option value="">Opções indisponíveis</option>';
        return;
    }
    
    popularSelect('selectTempo', options.map(opt => ({ value: opt.value, label: opt.label })));
}



async function carregarListaDeMaquinas() {
    const idEmpresa = usuarioObjeto.fkEmpresa
    const resposta = await fetch('/api/desempenho/procurar_maquinas', {
        method: 'GET', headers: { 'id-empresa': idEmpresa},
    });

    if (!resposta.ok) {
        throw new Error(`Erro ao carregar máquinas: ${resposta.statusText}`);
    }
    const dados_das_maquinas = await resposta.json(); 
    listaDeMaquinas = dados_das_maquinas;

    popularDropdownMaquinas(dados_das_maquinas);
}

function popularDropdownMaquinas(maquinas) {
    const dropdownUl = document.querySelector('#specific-machine-dropdown-group ul');
    dropdownUl.innerHTML = ''; 

    maquinas.forEach(maq => {
        const li = `<li><a class="dropdown-item" href="#" onclick="filtrar_maquina('${maq.nome}', ${maq.id})">${maq.nome}</a></li>`;
        dropdownUl.insertAdjacentHTML('beforeend', li);
    });

    if (maquinas.length > 0) {
        document.querySelector('#specific-machine-dropdown-group button').innerText = maquinas[0].nome;
        maquinaSelecionada.nome = maquinas[0].nome;
        maquinaSelecionada.id = maquinas[0].id;
    }
}

function selecionarFiltroMaquina(filtro) {
    const btnTodasMaquinas = document.querySelector('#machine-filter-group button');
    const dropdownMaquinaEspecifica = document.getElementById('specific-machine-dropdown-group');

    btnTodasMaquinas.innerText = filtro;

    if (filtro === 'Máquina Específica') {
        dropdownMaquinaEspecifica.style.display = 'block';
        const primeiroNome = listaDeMaquinas.length > 0 ? listaDeMaquinas[0].nome : 'Nenhuma';
        const primeiroId = listaDeMaquinas.length > 0 ? listaDeMaquinas[0].id : null;
        maquinaSelecionada = { nome: primeiroNome, id: primeiroId };
    } else {
        dropdownMaquinaEspecifica.style.display = 'none';
        maquinaSelecionada = { nome: 'Todas as Máquinas', id: null };
    }
    updateDynamicFilterDisplay();
}

function filtrar_maquina(nome, id) {
    document.querySelector('#specific-machine-dropdown-group button').innerText = nome;
    maquinaSelecionada = { nome, id };
    updateDynamicFilterDisplay();
}


// --- Funções de Lógica e Toggle (Visuais) ---

function toggleFilterArrow(element) {
    const icon = element.querySelector('i');
    if (icon.classList.contains('bi-caret-down-fill')) {
        icon.classList.remove('bi-caret-down-fill');
        icon.classList.add('bi-caret-up-fill');
    } else {
        icon.classList.remove('bi-caret-up-fill');
        icon.classList.add('bi-caret-down-fill');
    }
}

//  Função central de controle de visibilidade dos campos de filtro.
function toggleFilterFields() {
    const tipoGrafico = document.getElementById('selectTipoGrafico').value;
    const divComponente = document.getElementById('divComponente');
    const divVariavelRelacionada = document.getElementById('divVariavelRelacionada');
    const divDetalhesPrevisao = document.getElementById('divDetalhesPrevisao');
    const labelMetrica = document.getElementById('labelMetricaPrincipal');
    
    // 1. Popula o Select de Tempo e reseta a visibilidade
    popularTempoSelect(tipoGrafico); 
    divVariavelRelacionada.style.display = 'none';
    divDetalhesPrevisao.style.display = 'none';

    // 2. Popula Métricas e Variáveis Relacionadas (Primeiro, para setar os valores)
    if (tipoGrafico === 'Correlacao') {
        popularSelect('selectMetricaPrincipal', METRICAS.filter(m => ['Uptime', 'DownTime'].includes(m.value)));
        popularSelect('selectVariavelRelacionada', CORRELACAO_VARS);
    } else {
        popularSelect('selectMetricaPrincipal', METRICAS); 
    }
    
    // 3. Lógica Condicional Específica e Leitura da Métrica ATUAL
    const metrica = document.getElementById('selectMetricaPrincipal').value;
    labelMetrica.innerText = 'Métrica a analisar';
    
    if (tipoGrafico === 'Previsoes') {
        divDetalhesPrevisao.style.display = 'block';
        
        // Detalhes de Previsão dinâmicos (MOCK)
        document.getElementById('periodoHistorico').innerText = '01/01/2024 → 30/06/2025 (18 meses de histórico)';
        document.getElementById('periodoPrevisto').innerText = '01/07/2025 → 30/09/2025';

    } else if (tipoGrafico === 'Correlacao') {
        divVariavelRelacionada.style.display = 'block';
        labelMetrica.innerText = 'Métrica Principal (Eixo Y)';
    }
    
    // 4. Componente (Dependente do valor DA MÉTRICA ATUAL)
    const isAlertMetric = METRICAS.find(m => m.value === metrica)?.isAlert;
    divComponente.style.display = isAlertMetric ? 'block' : 'none';
    
    if (isAlertMetric) {
        const allComponents = [{ value: 'TODOS', label: 'Todos os Componentes', selected: true }, ...COMPONENTES];
        popularSelect('selectComponente', allComponents);
    }
    
    updateDynamicFilterDisplay();
    
}

function updateDynamicFilterDisplay() {
    const tipoGrafico = document.getElementById('selectTipoGrafico').value;
    const metrica = document.getElementById('selectMetricaPrincipal').value;
    const tempo = document.getElementById('selectTempo').value;
    const variavelRelacionada = document.getElementById('selectVariavelRelacionada')?.value;
    const componente = document.getElementById('selectComponente')?.value;

    let textoTipo = '';
    let textoTempo = '';
    let textoAgrupamento = '';
    let textoDetalhe = '';

    // A. Constrói o texto do Tipo
    if (tipoGrafico === 'Tendencia') {
        const tempoLabel = TEMPO_OPCOES.Tendencia.find(o => o.value === tempo)?.label || 'Período não definido';
        textoTipo = `Análise de Tendência da métrica ${metrica}`;
        textoTempo = `Comparando: ${tempoLabel}`;
        textoAgrupamento = `agrupado por [Automático]`; 
    } else if (tipoGrafico === 'Previsoes') {
        const tempoLabel = TEMPO_OPCOES.Previsoes.find(o => o.value === tempo)?.label || 'Período não definido';
        textoTipo = `Previsão da métrica ${metrica}`;
        textoTempo = `Projeção: ${tempoLabel}`;
        textoAgrupamento = `(Histórico usado automaticamente)`;
        const periodoPrevisto = document.getElementById('periodoPrevisto')?.innerText || '...';
        textoDetalhe = `<br><span class="text-secondary small"> Prevendo de ${periodoPrevisto}</span>`;
    } else if (tipoGrafico === 'Correlacao') {
        const tempoLabel = TEMPO_OPCOES.Correlacao.find(o => o.value === tempo)?.label || 'Período não definido';
        const variavelLabel = CORRELACAO_VARS.find(v => v.value === variavelRelacionada)?.label || 'Variável não definida';
        textoTipo = `Correlação entre ${metrica} (Y) e ${variavelLabel} (X)`;
        textoTempo = `No período de: ${tempoLabel}`;
        textoAgrupamento = '';
    }
    
    // B. Adiciona Componente se Alerta estiver selecionado
    if (componente && componente !== 'TODOS' && METRICAS.find(m => m.value === metrica)?.isAlert) {
        textoDetalhe += ` e filtrado pelo componente ${componente}`;
    }

    const displayText = `${textoTipo}${textoTempo ? `, ${textoTempo}` : ''} ${textoAgrupamento}${textoDetalhe}`;
    
    const displayElement = document.querySelector('.filtragem').nextElementSibling;
    if (displayElement) {
        displayElement.innerHTML = `Filtro atual: ${displayText}`;
    }
}


// --- Função Principal: Aplicação e Construção do Payload ---

async function aplicarFiltro() {
    const tipoGrafico = document.getElementById('selectTipoGrafico').value;
    const metricaPrincipal = document.getElementById('selectMetricaPrincipal').value;
    const tempoSelecionado = document.getElementById('selectTempo').value; 
    const variavelRelacionada = document.getElementById('selectVariavelRelacionada')?.value;
    const componente = document.getElementById('selectComponente')?.value;
    
    if (tipoGrafico === 'Correlacao' && metricaPrincipal === variavelRelacionada) {
        alert("Para o gráfico de Correlação, a Métrica Principal (Eixo Y) e a Variável Relacionada (Eixo X) não podem ser as mesmas.");
        return;
    }

    //  Define os parâmetros de consulta (Data e Máquina)
    let dataInicioConsulta = tempoSelecionado; 
    let idMaquinaConsulta = maquinaSelecionada.id; 
    let idEmpresaConsulta = ID_EMPRESA

    if (tipoGrafico === 'Previsoes') {
         dataInicioConsulta = getOptionValue('MES', 'Tendencia'); 
    }
    
    // showLoader(); 

    try {
        console.log(`Parâmetros: Empresa=${idEmpresaConsulta}, Data Início=${dataInicioConsulta}, Máquina=${idMaquinaConsulta}`);

        const dados = await buscar_dados_kpi_tabela(idEmpresaConsulta, dataInicioConsulta, idMaquinaConsulta);
        
        mockData.kpis = dados.dados_kpis.kpis;
        mockData.topMaquinas = dados.dados_ranking;
        
        updateDynamicFilterDisplay();

        renderizarDados(mockData); 

    } catch (e) {
        console.error('Falha ao aplicar filtro e buscar dados:', e);
        
        updateDynamicFilterDisplay();
        renderizarDados(mockData); 
    } finally {
        // hideLoader();
    }
}


function iniciarDashboard() {
    popularSelect('selectTipoGrafico', [
        { value: 'Tendencia', label: 'Tendência – ótimo para ver se está aumentando ou diminuindo.' },
        { value: 'Previsoes', label: 'Previsões – use para prever dados futuros relacionadas.' },
        { value: 'Correlacao', label: 'Correlação – use para comparar duas variáveis e entender se estão relacionadas.' }
    ]);
    
    setDatasIniciais(); 
    carregarListaDeMaquinas(); 
    
    toggleFilterFields(); 
}