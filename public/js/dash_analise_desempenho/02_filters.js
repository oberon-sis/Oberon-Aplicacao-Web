async function buscar_dados_kpi_tabela(idEmpresa, dataInicio, idMaquina) {
  const resposta = await fetch('/api/desempenho/procurar_dados_pagina', {
    method: 'GET',
    headers: {
      'data-inicio': dataInicio,
      'id-empresa': idEmpresa,
      'id-maquina': idMaquina || '',
    },
  });
  if (!resposta.ok) throw new Error(`Falha no fetch KPI/Tabela: ${resposta.statusText}`);

  const dados = await resposta.json();
  
  // Atualiza mockData global
  mockData.kpis = dados.dados_kpis.kpis;
  mockData.topMaquinas = dados.dados_ranking;
  
  return dados;
}

async function buscar_dados_grafico(payload) {
  const resposta = await fetch('/api/desempenho/grafico', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resposta.ok) {
      throw new Error(`Erro na requisição do Gráfico: ${resposta.status} ${resposta.statusText}`);
  }
  
  const dados_grafico = await resposta.json();

  mockData.agrupamento = dados_grafico.agrupamento;
  mockData.analise_tipo = dados_grafico.analise_tipo;
  mockData.graficoData = dados_grafico.graficoData;
  mockData.iaMetricas = dados_grafico.iaMetricas;
  mockData.tipo_de_modelo = dados_grafico.tipo_de_modelo;

  return dados_grafico;
}


function setDatasIniciais() {
    popularSelect('selectMetricaPrincipal', METRICAS);
    popularSelect('selectComponente', COMPONENTES);
    popularSelect('selectVariavelRelacionada', CORRELACAO_VARS);
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
    if (tipo === 'Correlação' || tipo === 'correlacao') chaveTempo = 'correlacao';
    else if (tipo === 'Previsões' || tipo === 'previsao') chaveTempo = 'previsao';
    else if (tipo === 'Comparar' || tipo === 'comparar') chaveTempo = 'comparar';

    const options = TEMPO_OPCOES[chaveTempo]; 
    
    if (!options) {
        console.error(`Chave '${chaveTempo}' não encontrada em TEMPO_OPCOES.`);
        return;
    }
    popularSelect('selectTempo', options.map(opt => ({ value: opt.value, label: opt.label })));
}

async function carregarListaDeMaquinas() {
    const idEmpresa = usuarioObjeto ? usuarioObjeto.fkEmpresa : ID_EMPRESA; 
    const resposta = await fetch('/api/desempenho/procurar_maquinas', {
        method: 'GET', headers: { 'id-empresa': idEmpresa},
    });

    if (!resposta.ok) {
        console.warn(`Erro ao carregar máquinas: ${resposta.statusText}`);
        return;
    }
    const dados_das_maquinas = await resposta.json(); 
    listaDeMaquinas = dados_das_maquinas;
    popularDropdownMaquinas(dados_das_maquinas);
}

function popularDropdownMaquinas(maquinas) {
    const dropdownUl = document.querySelector('#specific-machine-dropdown-group ul');
    dropdownUl.innerHTML = ''; 

    maquinas.forEach(maq => {
        console.log("===filtro maquina")
        const li = `<li><a class="dropdown-item" href="#" onclick="filtrar_maquina('${maq.nome}', ${maq.idMaquina})">${maq.nome}</a></li>`;
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

        if(!maquinaSelecionada.id && listaDeMaquinas.length > 0) {
             maquinaSelecionada.nome = listaDeMaquinas[0].nome;
             maquinaSelecionada.id = listaDeMaquinas[0].id;
        }
    } else {
        dropdownMaquinaEspecifica.style.display = 'none';
        maquinaSelecionada = { nome: 'Todas as Máquinas', id: null };
    }
    updateDynamicFilterDisplay();
    renderizarDados
}

function filtrar_maquina(nome, id) {
    document.querySelector('#specific-machine-dropdown-group button').innerText = nome;
    maquinaSelecionada = { nome, id };
    updateDynamicFilterDisplay();
    aplicarFiltro()
}

function toggleFilterArrow(element) {
    const icon = element.querySelector('i');
    icon.classList.toggle('bi-caret-down-fill');
    icon.classList.toggle('bi-caret-up-fill');
}

function toggleFilterFields() {
    const tipoGrafico = document.getElementById('selectTipoGrafico').value;
    const divComponente = document.getElementById('divComponente');
    const divVariavelRelacionada = document.getElementById('divVariavelRelacionada');
    const divDetalhesPrevisao = document.getElementById('divDetalhesPrevisao');
    const labelMetrica = document.getElementById('labelMetricaPrincipal');
    
    popularTempoSelect(tipoGrafico); 
    
    divVariavelRelacionada.style.display = 'none';
    divDetalhesPrevisao.style.display = 'none';

    if (tipoGrafico === 'correlacao') {
        popularSelect('selectMetricaPrincipal', METRICAS.filter(m => ['Uptime', 'DownTime'].includes(m.value)));
        popularSelect('selectVariavelRelacionada', CORRELACAO_VARS);
        labelMetrica.innerText = 'Métrica Principal (Eixo Y)';
    } else {
        popularSelect('selectMetricaPrincipal', METRICAS); 
        labelMetrica.innerText = 'Métrica a analisar';
    }
    
    if (tipoGrafico === 'previsao') {
        divDetalhesPrevisao.style.display = 'block';
    } else if (tipoGrafico === 'correlacao') {
        divVariavelRelacionada.style.display = 'block';
    }
    
    const metrica = document.getElementById('selectMetricaPrincipal').value;
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

    let textoTipo = '', textoTempo = '', textoAgrupamento = '', textoDetalhe = '';

    if (tipoGrafico === 'comparar') {
        const tempoLabel = TEMPO_OPCOES.comparar.find(o => o.value === tempo)?.label || 'Período';
        textoTipo = `Análise de Tendência de ${metrica}`;
        textoTempo = `Comparando: ${tempoLabel}`;
        textoAgrupamento = `agrupado por [Automático]`; 
    } else if (tipoGrafico === 'previsao') {
        const tempoLabel = TEMPO_OPCOES.previsao.find(o => o.value === tempo)?.label || 'Período';
        textoTipo = `Previsão de ${metrica}`;
        textoTempo = `Projeção: ${tempoLabel}`;
        textoAgrupamento = `(Histórico auto)`;
    } else if (tipoGrafico === 'correlacao') {
        const tempoLabel = TEMPO_OPCOES.correlacao.find(o => o.value === tempo)?.label || 'Período';
        const variavelLabel = CORRELACAO_VARS.find(v => v.value === variavelRelacionada)?.label || 'Variável X';
        textoTipo = `Correlação entre ${metrica} e ${variavelLabel}`;
        textoTempo = `Período: ${tempoLabel}`;
    }
    
    if (componente && componente !== 'TODOS' && METRICAS.find(m => m.value === metrica)?.isAlert) {
        textoDetalhe += ` (${componente})`;
    }

    const displayText = `${textoTipo}, ${textoTempo} ${textoAgrupamento}${textoDetalhe}`;
    const displayElement = document.querySelector('.filtragem').nextElementSibling;
    if (displayElement) {
        displayElement.innerHTML = `Filtro atual: ${displayText}`;
    }
}
const titulosGrafico = {
    comparacao: "Evolução Temporal de Desempenho",
    previsao:   "Análise Preditiva (Próximos Períodos)",
    correlacao: "Correlação Cruzada de Métricas"
};


async function aplicarFiltro() {
    const tipoGrafico = document.getElementById('selectTipoGrafico').value;
    const metricaPrincipal = document.getElementById('selectMetricaPrincipal').value;
    const tempoSelecionado = document.getElementById('selectTempo').value; 
    const variavelRelacionada = document.getElementById('selectVariavelRelacionada')?.value;
    const componente = document.getElementById('selectComponente')?.value;
    const elementoTitulo = document.getElementById("titulo_grafico")

    elementoTitulo.innerText = titulosGrafico[tipoGrafico];
    
    if (tipoGrafico === 'correlacao' && metricaPrincipal === variavelRelacionada) {
        alert("Para Correlação, as métricas devem ser diferentes.");
        return;
    }

    let dataInicioConsulta = tempoSelecionado;
    let dataFinalConsulta = null;
    if (tipoGrafico === 'previsao' || tipoGrafico === 'correlacao') {
             const jsonDate = JSON.parse(tempoSelecionado);
             console.log("json aqui")
             console.log(jsonDate)
             dataInicioConsulta = jsonDate.data_inicio_historico; 
             dataFinalConsulta = jsonDate.data_fim_previsao; 
             console.log(dataFinalConsulta)
             console.log(dataFinalConsulta)
    }
    console.log(tipoGrafico)
    console.log("-===========")
    const payloadGrafico = {
        tipoAnalise: tipoGrafico,
        dataInicio: dataInicioConsulta, 
        metricaAnalisar: metricaPrincipal, 
        variavelRelacionada: (tipoGrafico === 'correlacao' ? variavelRelacionada : null),
        fkEmpresa: ID_EMPRESA, 
        fkMaquina: maquinaSelecionada.id,
        componente: (tipoGrafico === 'correlacao'? componenteSelecionado: null),
        dataPrevisao: (tipoGrafico === 'comparar' ? null: dataFinalConsulta), 
    };

    console.log(payloadGrafico)

    toggleSkeleton(true);

    try {
        await buscar_dados_grafico(payloadGrafico);
        
        let dataTabela = dataInicioConsulta;
        if(tipoGrafico === 'previsao') dataTabela = getOptionValue('MES', 'comparar'); 

        await buscar_dados_kpi_tabela(ID_EMPRESA, dataTabela, maquinaSelecionada.id);

        updateDynamicFilterDisplay();
        renderizarDados(mockData); 

    } catch (e) {
        console.error('Falha ao aplicar filtro:', e);
        alert('Erro ao buscar dados. Verifique o console.');
    } finally {
        toggleSkeleton(false);
    }
}

function iniciarDashboard() {
    popularSelect('selectTipoGrafico', [
        { value: 'comparar', label: 'Comparação – ótimo para ver se está aumentando ou diminuindo.' },
        { value: 'previsao', label: 'Previsões – use para prever dados futuros relacionadas.' },
        { value: 'correlacao', label: 'Correlação – use para comparar duas variáveis e entender se estão relacionadas.' }
    ]);
    
    setDatasIniciais(); 
    carregarListaDeMaquinas();
    toggleFilterFields(); 
}