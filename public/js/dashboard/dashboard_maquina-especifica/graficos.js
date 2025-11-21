document.addEventListener('DOMContentLoaded', function () {
        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });

        // ---------------------------------------------------------------------------------------------

        // --- Configuração do Gráfico de Linhas (Chart.js) para CPU, RAM e DISCO (Gráfico Principal) ---
        const ctx = document.getElementById('mainChart');

        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan/Fev', 'Mar/Abr', 'Mai/Jun', 'Jul/Ago', 'Set/Out', 'Nov/Dez'],
                    datasets: [
                        {
                            label: 'CPU (%)',
                            data: [65, 70, 75, 80, 85, 90],
                            borderColor: '#dc3545',
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            tension: 0.4,
                            fill: false,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                        },
                        {
                            label: 'RAM (%)',
                            data: [50, 55, 60, 65, 70, 75],
                            borderColor: '#007bff',
                            backgroundColor: 'rgba(0, 123, 255, 0.1)',
                            tension: 0.4,
                            fill: false,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                        },
                        {
                            label: 'DISCO (%)',
                            data: [30, 35, 40, 45, 50, 55],
                            borderColor: '#28a745',
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            tension: 0.4,
                            fill: false,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Utilização Média de Recursos (CPU, RAM, DISCO) ao Longo do Tempo',
                            font: {
                                size: 16
                            }
                        }
                    },
                    scales: {
                        y: {
                            min: 0,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Utilização Média (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Bimestre'
                            }
                        }
                    }
                }
            });
        }

        // --- Configuração do Gráfico de Barras (Chart.js) para Alertas por Componente ---
        const ctx2 = document.getElementById('componentAlertsChart');

        if (ctx2) {
            new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: ['RAM', 'CPU', 'DISCO'],
                    datasets: [{
                        label: 'Total de Alertas',
                        data: [220, 150, 80],
                        backgroundColor: [
                            'rgba(0, 123, 255, 0.7)',
                            'rgba(220, 53, 69, 0.7)',
                            'rgba(40, 167, 69, 0.7)'
                        ],
                        borderColor: [
                            '#007bff',
                            '#dc3545',
                            '#28a745'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                        title: {
                            display: true,
                            text: 'Total de Alertas por Componente (30 Dias)',
                            font: { size: 14 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Número de Alertas'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Componente'
                            }
                        }
                    }
                }
            });
        }
    });