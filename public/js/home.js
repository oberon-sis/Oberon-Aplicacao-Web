const API_BASE_URL = '/api/maquinas';
let fkEmpresa = -1;

document.addEventListener('DOMContentLoaded', () => {
  const usuarioString = sessionStorage.getItem('usuario');
  const elementoNome = document.getElementById('nome-exibicao');

  if (usuarioString && elementoNome) {
    try {
      const usuarioObj = JSON.parse(usuarioString);
      const nomeUsuario = usuarioObj.nome;

      if (nomeUsuario) {
        elementoNome.textContent = 'Olá, ' + nomeUsuario + '!';
      } else {
        elementoNome.textContent = 'Olá!';
      }
    } catch (error) {
      console.error('Erro ao analisar dados do usuário na sessão:', error);
      elementoNome.textContent = 'Olá!';
    }
  } else if (elementoNome) {
    elementoNome.textContent = 'Olá!';
  }

  iniciarPagina();
});

async function iniciarPagina() {
  const usuarioString = sessionStorage.getItem('usuario');

  if (!usuarioString) {
    console.error('Usuário não encontrado na sessão');
    showErrorMessage('Sessão expirada. Por favor, faça login novamente.');
    return;
  }

  try {
    const usuarioObjeto = JSON.parse(usuarioString);
    fkEmpresa = usuarioObjeto.fkEmpresa;

    if (!fkEmpresa || fkEmpresa === -1) {
      console.error('fkEmpresa inválido:', fkEmpresa);
      showErrorMessage('Erro ao identificar empresa do usuário.');
      return;
    }

    console.log('fkEmpresa carregado:', fkEmpresa);

    await loadTopCriticalMachines(fkEmpresa);
  } catch (e) {
    console.error('Erro ao processar dados de usuário na sessão:', e);
    showErrorMessage('Erro ao carregar dados do usuário.');
  }
}

function getStatusClass(status) {
  status = status.toUpperCase();
  if (status === 'CRÍTICO') return 'danger';
  if (status === 'ATENÇÃO') return 'warning';
  if (status === 'NORMAL') return 'success';
  if (status === 'OCIOSO') return 'info';

  return 'secondary';
}

function createMachineCard(machine) {
  const statusApi = machine.status.toUpperCase();

  let borderColor = getStatusClass(statusApi);
  let statusTexto = statusApi;

  if (statusApi === 'NORMAL') statusTexto = 'NORMAL (Aceitável)';
  if (statusApi === 'OCIOSO') statusTexto = 'OCIOSO (Baixo Uso)';

  const totalAlertas = machine.total_alertas || 0;
  const alertsBadge =
    totalAlertas > 0 ? `<span class="badge bg-danger">+${totalAlertas}</span>` : '';

  const piorCasoText =
    machine.pior_caso_metric && machine.pior_caso_value > 0
      ? `Pior Caso: ${machine.pior_caso_metric} ${machine.pior_caso_value}%`
      : `Uso Estável / Desconectada`;

  return `
    <div class="col-md-4 shadow_div">
      <div class="card border-0 border-start border-5 border-${borderColor}">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-center mb-2 etiquetas">
            <span class="fw-bold">${machine.nome || `Máquina ID ${machine.id}`}</span>
            <div class="div_etiquetas">
              <span class="badge bg-success">on-line</span>
              <span class="badge bg-${borderColor}">${statusTexto}</span>
              ${alertsBadge}
            </div>
          </div>

          <p class="mb-1 small text-${borderColor}">
            ${totalAlertas > 0 ? `Total de Alertas: ${totalAlertas}` : 'Monitoramento Estável'}
          </p>
          <p class="fw-bold mb-2">
            ${piorCasoText}
          </p>

          <a href="painelEspecifico.html?machine=${machine.id}" class="btn btn-sm btn-${borderColor} text-white w-100">
            Ver Detalhes
          </a>
        </div>
      </div>
    </div>
  `;
}

async function loadTopCriticalMachines(fkEmpresa) {
  const container = document.getElementById('top-maquinas-criticas-container');

  if (!container) {
    console.error('Container não encontrado');
    return;
  }

  container.innerHTML =
    '<div class="col-12 text-center text-muted p-4">Carregando máquinas críticas...</div>';

  try {
    console.log('Chamando API com fkEmpresa:', fkEmpresa);

    const response = await fetch(`${API_BASE_URL}/top-criticas?fkEmpresa=${fkEmpresa}`);

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }

    const machines = await response.json();
    console.log('Dados recebidos:', machines);

    if (!Array.isArray(machines) || machines.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center" role="alert">
            <i class="fas fa-info-circle me-2"></i>
            Nenhuma máquina em <strong>Alerta</strong> ou <strong>Crítico</strong> nas últimas 24 horas.
          </div>
        </div>
      `;
      return;
    }
    container.innerHTML = '';
    machines.forEach((machine) => {
      const cardHtml = createMachineCard(machine);
      container.innerHTML += cardHtml;
    });
  } catch (error) {
    console.error('Erro ao carregar top máquinas:', error);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Erro ao conectar ou processar dados: ${error.message}
        </div>
      </div>
    `;
  }
}

function showErrorMessage(message) {
  const container = document.getElementById('top-maquinas-criticas-container');
  if (container) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${message}
        </div>
      </div>
    `;
  }
}
