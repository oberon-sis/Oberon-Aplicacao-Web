/**
 * Componente de Notificação Simples
 * Injeta o ícone e a lista de alertas no elemento <header>
 */
class NotificationComponent {
  constructor(headerSelector = 'header', maxAlerts = 8) {
    this.headerElement = document.querySelector(headerSelector);
    this.maxAlerts = maxAlerts;
    this.STORAGE_KEY = 'notification_read_status'; // Chave para o localStorage
    this.readStatus = this.loadReadStatus(); // Carrega o status do localStorage
    this.alerts = []; // Para armazenar os dados brutos

    if (!this.headerElement) {
      console.error(`O elemento <header> com o seletor '${headerSelector}' não foi encontrado.`);
      return;
    }

    this.init();
  }

  /**
   * Carrega os IDs das notificações já lidas do localStorage.
   */
  loadReadStatus() {
    try {
      const status = localStorage.getItem(this.STORAGE_KEY);
      return status ? new Set(JSON.parse(status)) : new Set();
    } catch (e) {
      console.error('Erro ao carregar readStatus do localStorage', e);
      return new Set();
    }
  }

  /**
   * Salva o estado atual de notificações lidas no localStorage.
   */
  saveReadStatus() {
    try {
      // Converte o Set para Array para armazenar
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(this.readStatus)));
    } catch (e) {
      console.error('Erro ao salvar readStatus no localStorage', e);
    }
  }

  /**
   * Simula uma chamada fetch para obter os alertas de hardware.
   */
  async fetchAlerts() {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockData = [
      {
        id: 1,
        maquina: 'Máquina - 001',
        tipo: 'Crítico',
        mensagem: 'CPU atingiu 98% de uso.',
        timestamp: '10 min atrás',
      },
      {
        id: 2,
        maquina: 'Máquina - 004',
        tipo: 'Alerta',
        mensagem: 'RAM em 85% de uso. Considere reiniciar.',
        timestamp: '2h atrás',
      },
      {
        id: 3,
        maquina: 'Máquina - 006',
        tipo: 'Atenção',
        mensagem: 'Disco em 90% da capacidade.',
        timestamp: 'Ontem',
      },
      {
        id: 4,
        maquina: 'Máquina - 012',
        tipo: 'Crítico',
        mensagem: 'Rede desconectada por 5 minutos.',
        timestamp: '3 dias atrás',
      },
      {
        id: 5,
        maquina: 'Máquina - 002',
        tipo: 'Alerta',
        mensagem: 'Temperatura da CPU acima do limite.',
        timestamp: '4 dias atrás',
      },
      {
        id: 6,
        maquina: 'Máquina - 009',
        tipo: 'Atenção',
        mensagem: 'Baixa latência de rede detectada.',
        timestamp: '5 dias atrás',
      },
      {
        id: 7,
        maquina: 'Máquina - 005',
        tipo: 'Alerta',
        mensagem: 'RAM em 75% de uso.',
        timestamp: '1 semana atrás',
      },
      {
        id: 8,
        maquina: 'Máquina - 015',
        tipo: 'Crítico',
        mensagem: 'Falha no disco primário.',
        timestamp: '1 semana atrás',
      },
    ];

    // Armazena todos os alertas para uso posterior e limita a exibição
    this.alerts = mockData;
    return mockData.slice(0, this.maxAlerts);
  }

  /**
   * Gera o HTML para os itens da lista de alertas de hardware.
   */
  renderAlerts(alerts) {
    if (alerts.length === 0) {
      return '<li class="no-alerts">Nenhuma notificação nova.</li>';
    }

    return alerts
      .map((alert) => {
        // Verifica se a notificação foi lida
        const isRead = this.readStatus.has(alert.id);
        const readClass = isRead ? 'alert-read' : 'alert-unread';

        return `<li class="alert-item alert-${alert.tipo.toLowerCase()} ${readClass}" data-id="${alert.id}">
                <div class="alert-info">
                    <span class="alert-machine">${alert.maquina} - [${alert.tipo}]</span>
                    <span class="alert-message">${alert.mensagem}</span>
                </div>
                <span class="alert-timestamp">${alert.timestamp}</span>
            </li>`;
      })
      .join('');
  }

  /**
   * Marca todas as notificações exibidas como lidas.
   */
  markAllAsRead() {
    this.alerts.forEach((alert) => {
      this.readStatus.add(alert.id);
    });
    this.saveReadStatus();
    this.updateUI();
  }

  /**
   * Atualiza a UI (badge e lista) após uma mudança de estado (lida/não lida).
   */
  updateUI() {
    const unreadCount = this.alerts.filter((alert) => !this.readStatus.has(alert.id)).length;

    // Atualiza o Badge
    if (unreadCount > 0) {
      this.badgeElement.textContent = unreadCount;
      this.badgeElement.classList.remove('hidden');
    } else {
      this.badgeElement.classList.add('hidden');
    }

    // Re-renderiza a lista para atualizar a classe
    this.listElement.innerHTML = this.renderAlerts(this.alerts.slice(0, this.maxAlerts));
  }

  async init() {
    const alerts = await this.fetchAlerts();
    const initialUnreadCount = alerts.filter((alert) => !this.readStatus.has(alert.id)).length;

    // 1. Injeta a estrutura base no header
    this.headerElement.insertAdjacentHTML('beforeend', this.getComponentHTML(initialUnreadCount));

    // 2. Obtém as referências DOM
    this.root = document.getElementById('notification-component-root');
    this.iconButton = this.root.querySelector('.notification-icon-btn');
    this.badgeElement = document.getElementById('notification-badge');
    this.listContainer = document.getElementById('notification-list-container');
    this.listElement = document.getElementById('notification-list');
    const markAsReadButton = this.root.querySelector('#mark-all-read'); // Novo botão

    // 3. Adiciona listeners
    this.iconButton.addEventListener('click', () => {
      const isHidden = this.listContainer.classList.toggle('hidden');
      this.iconButton.setAttribute('aria-expanded', isHidden ? 'true' : 'false');

      // Ação principal: marcar como lido ao abrir o pop-up
      if (!isHidden) {
        this.markAllAsRead();
      }
    });

    if (markAsReadButton) {
      markAsReadButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.markAllAsRead();
      });
    }

    // 4. Renderiza e atualiza a UI
    try {
      this.updateUI();
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      this.listElement.innerHTML = '<li class="error-alert">Erro ao carregar.</li>';
    }
  }

  /**
   * Cria a estrutura HTML básica do componente (ícone e container).
   * Nota: O contador do badge será atualizado dinamicamente.
   */
  getComponentHTML(count) {
    const badgeClass = count > 0 ? '' : 'hidden';

    return `
            <div class="notification-component" id="notification-component-root">
                <button class="notification-icon-btn" aria-expanded="false" aria-controls="notification-list-container" id="botao_notificao">
                    <img src="../assets/svg/notificao_vazia.svg">
                    <span class="notification-badge ${badgeClass}" id="notification-badge">${count}</span>
                </button>
                
                <div class="notification-list-container hidden" id="notification-list-container">
                    <div class="notification-header">
                        <h4>Notificações (${this.maxAlerts} recentes)</h4>
                        <a href="#" id="mark-all-read" class="mark-all-read-link">Marcar todas como lidas</a>
                    </div>
                    <ul class="notification-list" id="notification-list">
                        </ul>
                    <div class="notification-footer">
                        <a href="/alertas.html" class="view-all-link">Ver todas</a>
                    </div>
                </div>
            </div>
        `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Para fins de teste, você pode limpar o localStorage no console: localStorage.removeItem('notification_read_status')
  new NotificationComponent();
});
