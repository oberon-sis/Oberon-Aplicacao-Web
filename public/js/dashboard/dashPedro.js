document.addEventListener('DOMContentLoaded', function () {
  if (typeof Chart !== 'undefined') {
    console.log('Chart.js carregado com sucesso.');
  } else {
    console.error('Chart.js não foi carregado!');
  }

  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  var idEmpresa = null;

  try {
    const usuarioJson = sessionStorage.getItem('usuario');
    if (!usuarioJson) {
      console.error('ERRO: Nenhum usuário encontrado no sessionStorage!');
      alert('Erro: Você não está logado. Redirecionando para o login...');
      window.location.href = '/login.html';
      return;
    }
    const usuario = JSON.parse(usuarioJson);
    idEmpresa = usuario.fkEmpresa || usuario.idEmpresa || usuario.ID_EMPRESA || usuario.empresa?.id;
    if (!idEmpresa) {
      console.error('ERRO: ID da empresa não encontrado no objeto usuario!');
      alert('Erro: Não foi possível identificar sua empresa. Entre em contato com o suporte.');
      return;
    }
    console.log('ID da Empresa encontrado:', idEmpresa);
  } catch (error) {
    console.error('ERRO ao processar dados do usuário:', error);
    alert('Erro ao processar login. Faça login novamente.');
    window.location.href = '/login.html';
    return;
  }

  var componenteAtual = document
    .getElementById('valor_pesquisa_componente')
    .textContent.toUpperCase();

  var parametrosAtuais = {
    aceitavel: null,
    atencao: null,
    critico: null,
  };

  var boxPlotChartInstance = null;
  var distributionChartInstance = null;

  const mediaUsoEl = document.getElementById('mediaUso');
  const desvioPadraoEl = document.getElementById('desvioPadrao');
  const medianaEl = document.getElementById('mediana');
  const totalAlertasEl = document.getElementById('totalAlertas');
  const percCriticasEl = document.getElementById('percMaquinasCriticas');
  const quartil1El = document.getElementById('quartil1');
  const quartil3El = document.getElementById('quartil3');
  const percentil90El = document.getElementById('percentil90');
  const paramCriticoEl = document.getElementById('paramCritico');
  const paramAtencaoEl = document.getElementById('paramAtencao');
  const paramNormalEl = document.getElementById('paramNormal');
  const paramOciosoEl = document.getElementById('paramOcioso');
  const tituloBoxPlotEl = document.getElementById('tituloBoxPlot');

  function calcularEstatisticas(dadosBrutos) {
    if (!dadosBrutos || dadosBrutos.length === 0) {
      return { mediana: null, q1: null, q3: null, p90: null, min: null, max: null, outliers: [] };
    }

    const sorted = [...dadosBrutos].sort((a, b) => a - b);
    const n = sorted.length;

    const quantile = (arr, p) => {
      if (n === 0) return null;
      if (n === 1) return arr[0];
      const index = p * (n - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      if (lower === upper) return arr[lower];
      return arr[lower] * (1 - weight) + arr[upper] * weight;
    };

    const q1 = quantile(sorted, 0.25);
    const median = quantile(sorted, 0.5);
    const q3 = quantile(sorted, 0.75);
    const p90 = quantile(sorted, 0.9);
    const iqr = q3 - q1;
    const limiteInferior = q1 - 1.5 * iqr;
    const limiteSuperior = q3 + 1.5 * iqr;
    const outliers = [];
    let minimo = null;
    let maximo = null;

    sorted.forEach((valor) => {
      if (valor < limiteInferior || valor > limiteSuperior) {
        outliers.push(valor);
      } else {
        if (minimo === null || valor < minimo) minimo = valor;
        if (maximo === null || valor > maximo) maximo = valor;
      }
    });

    if (minimo === null) minimo = sorted[0];
    if (maximo === null) maximo = sorted[n - 1];

    return {
      q1: q1,
      mediana: median,
      q3: q3,
      p90: p90,
      min: minimo,
      max: maximo,
      outliers: outliers,
    };
  }

  function atualizarKpis(kpisAgregados, estatisticas) {
    const media = parseFloat(kpisAgregados.media);
    const desvioPadrao = parseFloat(kpisAgregados.desvioPadrao);
    const percCriticoOcioso = parseFloat(kpisAgregados.percCriticoOcioso);
    const totalAlertas =
      kpisAgregados.totalAlertas !== null ? parseInt(kpisAgregados.totalAlertas) : 0;
    const mediana = estatisticas.mediana;
    const unidade = '%';

    var corMedia = 'inherit';
    if (media < parametrosAtuais.aceitavel) {
      corMedia = '#3498db';
    } else if (media >= parametrosAtuais.aceitavel && media < parametrosAtuais.atencao) {
      corMedia = '#27ae60';
    } else if (media >= parametrosAtuais.atencao && media < parametrosAtuais.critico) {
      corMedia = '#f39c12';
    } else if (media >= parametrosAtuais.critico) {
      corMedia = '#e74c3c';
    }

    mediaUsoEl.textContent = `${media || 0}${unidade}`;
    mediaUsoEl.style.color = corMedia;
    mediaUsoEl.style.fontWeight = 'bold';

    var corMediana = 'inherit';
    if (mediana !== null) {
      if (mediana < parametrosAtuais.aceitavel) {
        corMediana = '#3498db';
      } else if (mediana >= parametrosAtuais.aceitavel && mediana < parametrosAtuais.atencao) {
        corMediana = '#27ae60';
      } else if (mediana >= parametrosAtuais.atencao && mediana < parametrosAtuais.critico) {
        corMediana = '#f39c12';
      } else if (mediana >= parametrosAtuais.critico) {
        corMediana = '#e74c3c';
      }
    }

    medianaEl.textContent = `${mediana ? mediana.toFixed(2) : 'N/A'}${unidade}`;
    medianaEl.style.color = corMediana;
    medianaEl.style.fontWeight = 'bold';

    var corDesvioPadrao = 'inherit';
    if (desvioPadrao < 10) {
      corDesvioPadrao = '#27ae60';
    } else if (desvioPadrao >= 10 && desvioPadrao < 20) {
      corDesvioPadrao = '#f39c12';
    } else if (desvioPadrao >= 20) {
      corDesvioPadrao = '#e74c3c';
    }

    desvioPadraoEl.textContent = `${desvioPadrao || 0}${unidade}`;
    desvioPadraoEl.style.color = corDesvioPadrao;
    desvioPadraoEl.style.fontWeight = 'bold';

    var corAlertas = 'inherit';
    if (totalAlertas > 25) {
      corAlertas = '#e74c3c';
    } else if (totalAlertas > 15) {
      corAlertas = '#f39c12';
    } else {
      corAlertas = '#27ae60';
    }

    totalAlertasEl.textContent = totalAlertas;
    totalAlertasEl.style.color = corAlertas;
    totalAlertasEl.style.fontWeight = 'bold';
    percCriticasEl.textContent = `${percCriticoOcioso ? percCriticoOcioso.toFixed(1) : 'N/A'}%`;
    quartil1El.textContent = `${estatisticas.q1 ? estatisticas.q1.toFixed(2) : 'N/A'}${unidade}`;
    quartil3El.textContent = `${estatisticas.q3 ? estatisticas.q3.toFixed(2) : 'N/A'}${unidade}`;
    percentil90El.textContent = `${estatisticas.p90 ? estatisticas.p90.toFixed(2) : 'N/A'}${unidade}`;
  }

  function atualizarBoxPlot(estatisticas) {
    tituloBoxPlotEl.textContent = `Box Plot do Uso Típico de ${componenteAtual}`;
    if (!estatisticas.q1 || !estatisticas.q3 || estatisticas.min === null) {
      if (boxPlotChartInstance) {
        boxPlotChartInstance.destroy();
      }
      const canvas = document.getElementById('boxPlotChart');
      if (canvas) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      }
      console.warn('Dados insuficientes para o BoxPlot.');
      return;
    }
    if (boxPlotChartInstance) {
      boxPlotChartInstance.destroy();
    }
    const ctx = document.getElementById('boxPlotChart').getContext('2d');
    const maxScale = 100;
    const unidade = '%';
    boxPlotChartInstance = new Chart(ctx, {
      type: 'boxplot',
      data: {
        labels: [componenteAtual],
        datasets: [
          {
            label: `Distribuição de ${componenteAtual}`,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 2,
            outlierColor: '#e74c3c',
            outlierBackgroundColor: '#e74c3c',
            outlierRadius: 4,
            itemRadius: 0,
            itemStyle: 'circle',
            itemBackgroundColor: '#2c3e50',
            data: [
              {
                min: estatisticas.min,
                q1: estatisticas.q1,
                median: estatisticas.mediana,
                q3: estatisticas.q3,
                max: estatisticas.max,
                outliers: estatisticas.outliers,
              },
            ],
            minStats: 'min',
            maxStats: 'max',
            coef: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              title: () => `Estatísticas de ${componenteAtual}`,
              label: function (context) {
                const datapoint = context.raw;
                let linhas = [
                  `Mínimo: ${datapoint.min.toFixed(2)}${unidade}`,
                  `Q1 (25%): ${datapoint.q1.toFixed(2)}${unidade}`,
                  `Mediana: ${datapoint.median.toFixed(2)}${unidade}`,
                  `Q3 (75%): ${datapoint.q3.toFixed(2)}${unidade}`,
                  `Máximo: ${datapoint.max.toFixed(2)}${unidade}`,
                  `IQR: ${(datapoint.q3 - datapoint.q1).toFixed(2)}${unidade}`,
                ];
                if (datapoint.outliers && datapoint.outliers.length > 0) {
                  linhas.push('---');
                  linhas.push(`Valores de Outliers: ${datapoint.outliers.join(', ')}`);
                }
                return linhas;
              },
            },
          },
          title: {
            display: true,
            text: 'Distribuição Estatística dos Dados',
            font: { size: 14, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: maxScale,
            title: {
              display: true,
              text: `Uso de ${componenteAtual} (${unidade})`,
              font: { size: 13, weight: 'bold' },
            },
            grid: { display: true, color: 'rgba(0, 0, 0, 0.1)' },
            ticks: {
              stepSize: 10,
              callback: function (value) {
                return value + unidade;
              },
            },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 12, weight: 'bold' } },
          },
        },
      },
    });
  }

  function atualizarDistribuicaoAlertas(data) {
    const labels = data.map((item) => item.label);
    const criticoData = data.map((item) => item.critico);
    const atencaoData = data.map((item) => item.atencao);
    const ociosoData = data.map((item) => item.ocioso);
    if (distributionChartInstance) {
      distributionChartInstance.destroy();
    }
    const ctxDistribution = document.getElementById('distributionChart');
    if (ctxDistribution) {
      distributionChartInstance = new Chart(ctxDistribution, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['N/A'],
          datasets: [
            {
              label: 'Crítico',
              data: criticoData,
              backgroundColor: '#e74c3c',
              borderColor: '#c0392b',
              borderWidth: 1,
            },
            {
              label: 'Atenção',
              data: atencaoData,
              backgroundColor: '#f39c12',
              borderColor: '#d68910',
              borderWidth: 1,
            },
            {
              label: 'Ocioso',
              data: ociosoData,
              backgroundColor: '#3498db',
              borderColor: '#2980b9',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true },
          },
        },
      });
    }
  }

  function atualizarParametros(parametros) {
    var limiteCritico = 'N/A';
    var limiteAtencao = 'N/A';
    var limiteAceitavel = 'N/A';

    parametros.forEach((param) => {
      const limiteNum = parseFloat(param.limite_atual);
      const unidade = componenteAtual === 'REDE' ? '%' : '%';
      const limiteFormatado = `${limiteNum}${unidade}`;
      if (param.identificador === 'CRÍTICO') {
        limiteCritico = `≥ ${limiteFormatado}`;
        parametrosAtuais.critico = limiteNum;
      } else if (param.identificador === 'ATENÇÃO') {
        limiteAtencao = `≥ ${limiteFormatado}`;
        parametrosAtuais.atencao = limiteNum;
      } else if (param.identificador === 'ACEITÁVEL') {
        limiteAceitavel = limiteFormatado;
        parametrosAtuais.aceitavel = limiteNum;
      }
    });
    const limiteAtencaoNum = parseFloat(limiteAtencao.replace(/[^\d.]/g, ''));
    const limiteAceitavelNum = parseFloat(limiteAceitavel.replace(/[^\d.]/g, ''));
    const unidade = componenteAtual === 'REDE' ? '%' : '%';
    const paramNormalText =
      limiteAceitavelNum && limiteAtencaoNum
        ? `${limiteAceitavelNum}${unidade} - ${limiteAtencaoNum}${unidade}`
        : 'N/A';
    const paramOciosoText = limiteAceitavelNum ? `< ${limiteAceitavelNum}${unidade}` : 'N/A';
    paramCriticoEl.textContent = limiteCritico;
    paramAtencaoEl.textContent = limiteAtencao;
    paramNormalEl.textContent = paramNormalText;
    paramOciosoEl.textContent = paramOciosoText;
    document.querySelector(`#containerDefinicaoParametros h6.small`).textContent =
      `Parâmetros Atuais - ${componenteAtual}:`;
  }

  function buscarERenderizarDados(componente) {
    componenteAtual = componente.toUpperCase();
    const url = `/dashboardParametros/dados/${idEmpresa}/${componenteAtual}`;
    mediaUsoEl.textContent = '...';
    desvioPadraoEl.textContent = '...';
    medianaEl.textContent = '...';
    totalAlertasEl.textContent = '...';
    percCriticasEl.textContent = '...';
    quartil1El.textContent = '...';
    quartil3El.textContent = '...';
    percentil90El.textContent = '...';

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro de rede: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Dados recebidos da API:', data);
        const valores = data.dadosBrutos || [];
        const estatisticasCalculadas = calcularEstatisticas(valores);
        atualizarParametros(data.parametros || []);
        atualizarKpis(data.kpisAgregados, estatisticasCalculadas);
        atualizarBoxPlot(estatisticasCalculadas);
        atualizarDistribuicaoAlertas(data.distAlertas || []);
      })
      .catch((error) => {
        console.error('Erro ao carregar dados do dashboard:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
      });
  }

  document.querySelectorAll('.componente-item').forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const novoComponente = this.getAttribute('data-componente');
      document.getElementById('valor_pesquisa_componente').textContent =
        novoComponente.toUpperCase();
      buscarERenderizarDados(novoComponente);
    });
  });

  const modalParametros = new bootstrap.Modal(document.getElementById('modalDefinirParametros'));
  const btnDefinirParametros = document.getElementById('btnDefinirParametros');
  const btnSalvarParametros = document.getElementById('btnSalvarParametros');
  const formParametros = document.getElementById('formParametros');
  const alertaFeedback = document.getElementById('alertaFeedback');
  const modalComponenteNome = document.getElementById('modalComponenteNome');
  const modalComponenteTexto = document.getElementById('modalComponenteTexto');
  const modalUnidade = document.getElementById('modalUnidade');
  const inputAceitavel = document.getElementById('inputAceitavel');
  const inputAtencao = document.getElementById('inputAtencao');
  const inputCritico = document.getElementById('inputCritico');
  const unidadeAceitavel = document.getElementById('unidadeAceitavel');
  const unidadeAtencao = document.getElementById('unidadeAtencao');
  const unidadeCritico = document.getElementById('unidadeCritico');
  const resumoAceitavel = document.getElementById('resumoAceitavel');
  const resumoAceitavel2 = document.getElementById('resumoAceitavel2');
  const resumoAtencao = document.getElementById('resumoAtencao');
  const resumoAtencao2 = document.getElementById('resumoAtencao2');
  const resumoCritico = document.getElementById('resumoCritico');
  const resumoCritico2 = document.getElementById('resumoCritico2');

  function atualizarResumo() {
    const unidade = '%';
    const aceitavel = inputAceitavel.value || '--';
    const atencao = inputAtencao.value || '--';
    const critico = inputCritico.value || '--';
    resumoAceitavel.textContent = aceitavel + unidade;
    resumoAceitavel2.textContent = aceitavel + unidade;
    resumoAtencao.textContent = atencao + unidade;
    resumoAtencao2.textContent = atencao + unidade;
    resumoCritico.textContent = critico + unidade;
    resumoCritico2.textContent = critico + unidade;
  }

  inputAceitavel.addEventListener('input', atualizarResumo);
  inputAtencao.addEventListener('input', atualizarResumo);
  inputCritico.addEventListener('input', atualizarResumo);

  btnDefinirParametros.addEventListener('click', function () {
    modalComponenteNome.textContent = componenteAtual;
    modalComponenteTexto.textContent = componenteAtual;
    const unidade = '%';
    const maxValue = 100;
    modalUnidade.textContent = `porcentagem (${unidade})`;
    unidadeAceitavel.textContent = unidade;
    unidadeAtencao.textContent = unidade;
    unidadeCritico.textContent = unidade;
    inputAceitavel.max = maxValue;
    inputAtencao.max = maxValue;
    inputCritico.max = maxValue;
    const paramAceitavelText = paramNormalEl.textContent.split('-')[0].trim();
    const paramAtencaoText = paramAtencaoEl.textContent.replace('≥', '').trim();
    const paramCriticoText = paramCriticoEl.textContent.replace('≥', '').trim();
    inputAceitavel.value = parseFloat(paramAceitavelText) || '';
    inputAtencao.value = parseFloat(paramAtencaoText) || '';
    inputCritico.value = parseFloat(paramCriticoText) || '';
    atualizarResumo();
    alertaFeedback.classList.add('d-none');
    alertaFeedback.classList.remove('alert-success', 'alert-danger');
    modalParametros.show();
  });

  btnSalvarParametros.addEventListener('click', async function () {
    if (!formParametros.checkValidity()) {
      formParametros.reportValidity();
      return;
    }
    const aceitavel = parseFloat(inputAceitavel.value);
    const atencao = parseFloat(inputAtencao.value);
    const critico = parseFloat(inputCritico.value);
    if (aceitavel >= atencao) {
      mostrarAlerta('Erro: O limite Aceitável deve ser menor que o limite de Atenção.', 'danger');
      return;
    }
    if (atencao >= critico) {
      mostrarAlerta('Erro: O limite de Atenção deve ser menor que o limite Crítico.', 'danger');
      return;
    }
    btnSalvarParametros.disabled = true;
    btnSalvarParametros.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';
    try {
      const response = await fetch('/dashboardParametros/atualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEmpresa: idEmpresa,
          componente: componenteAtual,
          limiteAceitavel: aceitavel,
          limiteAtencao: atencao,
          limiteCritico: critico,
          tipoAplicacao: document.querySelector('input[name="tipoAplicacao"]:checked').value,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        mostrarAlerta('Parâmetros atualizados com sucesso!', 'success');
        setTimeout(() => {
          const modalElement = document.getElementById('modalDefinirParametros');
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) {
            modalInstance.hide();
          }
          modalElement.addEventListener(
            'hidden.bs.modal',
            function handler() {
              modalElement.removeEventListener('hidden.bs.modal', handler);
              buscarERenderizarDados(componenteAtual);
            },
            { once: true },
          );
        }, 800);
      } else {
        mostrarAlerta(
          `Erro: ${data.message || 'Não foi possível salvar os parâmetros.'}`,
          'danger',
        );
        btnSalvarParametros.disabled = false;
        btnSalvarParametros.innerHTML = '<i class="bi bi-check-circle me-1"></i>Salvar Parâmetros';
      }
    } catch (error) {
      console.error('Erro ao salvar parâmetros:', error);
      mostrarAlerta('Erro de conexão. Tente novamente.', 'danger');
      btnSalvarParametros.disabled = false;
      btnSalvarParametros.innerHTML = '<i class="bi bi-check-circle me-1"></i>Salvar Parâmetros';
    }
  });

  function mostrarAlerta(mensagem, tipo) {
    alertaFeedback.textContent = mensagem;
    alertaFeedback.classList.remove('d-none', 'alert-success', 'alert-danger');
    alertaFeedback.classList.add(`alert-${tipo}`);
  }

  document
    .getElementById('modalDefinirParametros')
    .addEventListener('hidden.bs.modal', function () {
      btnSalvarParametros.disabled = false;
      btnSalvarParametros.innerHTML = '<i class="bi bi-check-circle me-1"></i>Salvar Parâmetros';
    });

  const INTERVALO_ATUALIZACAO = 3600000; 
  setInterval(function() {
      if (componenteAtual) {
          console.log(`Atualizando dados automaticamente para: ${componenteAtual}...`);
          buscarERenderizarDados(componenteAtual);
      }
  }, INTERVALO_ATUALIZACAO);

  buscarERenderizarDados(componenteAtual);
});
