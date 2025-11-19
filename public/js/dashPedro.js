document.addEventListener('DOMContentLoaded', function () {
        const popoverTriggerList = [].slice.call(
          document.querySelectorAll('[data-bs-toggle="popover"]'),
        );
        popoverTriggerList.map(function (popoverTriggerEl) {
          return new bootstrap.Popover(popoverTriggerEl);
        });
      });

      const dadosCPU = [
        45, 48, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 35, 40, 50, 54, 57,
        61, 64, 67, 71, 74, 77, 83,
      ];

      function calcularBoxPlot(dados) {
        const sorted = [...dados].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const median = sorted[Math.floor(sorted.length * 0.5)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        return { min, q1, median, q3, max };
      }

      const ctx = document.getElementById('boxPlotChart');
      const boxPlotData = calcularBoxPlot(dadosCPU);

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [''],
          datasets: [
            {
              label: 'Box Plot',
              data: [0],
              backgroundColor: 'transparent',
              borderColor: 'transparent',
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
              enabled: true,
              callbacks: {
                title: () => 'Estatísticas de CPU',
                label: function (context) {
                  return [
                    `Mínimo: ${boxPlotData.min}%`,
                    `Q1: ${boxPlotData.q1}%`,
                    `Mediana: ${boxPlotData.median}%`,
                    `Q3: ${boxPlotData.q3}%`,
                    `Máximo: ${boxPlotData.max}%`,
                  ];
                },
              },
            },
          },
          scales: {
            x: {
              min: 0,
              max: 100,
              title: {
                display: true,
                text: 'Uso de CPU (%)',
                font: { size: 14 },
              },
              grid: { display: true, color: '#e0e0e0' },
              ticks: {
                stepSize: 10,
                callback: function (value) {
                  return value + '%';
                },
              },
            },
            y: {
              display: false,
              grid: { display: false },
            },
          },
          layout: {
            padding: { top: 30, bottom: 30, left: 20, right: 20 },
          },
        },
        plugins: [
          {
            id: 'boxPlotDrawer',
            afterDatasetsDraw(chart) {
              const ctx = chart.ctx;
              const xScale = chart.scales.x;
              const chartArea = chart.chartArea;

              const yCenter = (chartArea.top + chartArea.bottom) / 2;
              const boxHeight = 60;

              const xMin = xScale.getPixelForValue(boxPlotData.min);
              const xQ1 = xScale.getPixelForValue(boxPlotData.q1);
              const xMedian = xScale.getPixelForValue(boxPlotData.median);
              const xQ3 = xScale.getPixelForValue(boxPlotData.q3);
              const xMax = xScale.getPixelForValue(boxPlotData.max);

              ctx.save();

              ctx.strokeStyle = '#2c3e50';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(xMin, yCenter);
              ctx.lineTo(xQ1, yCenter);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(xQ3, yCenter);
              ctx.lineTo(xMax, yCenter);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(xMin, yCenter - boxHeight / 3);
              ctx.lineTo(xMin, yCenter + boxHeight / 3);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(xMax, yCenter - boxHeight / 3);
              ctx.lineTo(xMax, yCenter + boxHeight / 3);
              ctx.stroke();

              const boxWidth = xQ3 - xQ1;
              ctx.fillStyle = 'rgba(186, 220, 218, 0.6)';
              ctx.strokeStyle = '#2c3e50';
              ctx.lineWidth = 2.5;
              ctx.fillRect(xQ1, yCenter - boxHeight / 2, boxWidth, boxHeight);
              ctx.strokeRect(xQ1, yCenter - boxHeight / 2, boxWidth, boxHeight);

              ctx.strokeStyle = '#e74c3c';
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              ctx.moveTo(xMedian, yCenter - boxHeight / 2);
              ctx.lineTo(xMedian, yCenter + boxHeight / 2);
              ctx.stroke();

              const iqr = boxPlotData.q3 - boxPlotData.q1;
              const lowerFence = boxPlotData.q1 - 1.5 * iqr;
              const upperFence = boxPlotData.q3 + 1.5 * iqr;

              ctx.fillStyle = '#34495e';
              dadosCPU.forEach((val) => {
                if (val < lowerFence || val > upperFence) {
                  const xOutlier = xScale.getPixelForValue(val);
                  ctx.beginPath();
                  ctx.arc(xOutlier, yCenter, 5, 0, Math.PI * 2);
                  ctx.fill();
                }
              });

              ctx.fillStyle = '#2c3e50';
              ctx.font = 'bold 11px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(`Min: ${boxPlotData.min}%`, xMin, yCenter - boxHeight / 2 - 10);
              ctx.fillText(`Q1: ${boxPlotData.q1}%`, xQ1, yCenter + boxHeight / 2 + 20);
              ctx.fillText(`Med: ${boxPlotData.median}%`, xMedian, yCenter - boxHeight / 2 - 10);
              ctx.fillText(`Q3: ${boxPlotData.q3}%`, xQ3, yCenter + boxHeight / 2 + 20);
              ctx.fillText(`Max: ${boxPlotData.max}%`, xMax, yCenter - boxHeight / 2 - 10);

              ctx.restore();
            },
          },
        ],
      });

      document.querySelectorAll('.componente-item').forEach((item) => {
        item.addEventListener('click', function (e) {
          e.preventDefault();
          const componente = this.getAttribute('data-componente');
          document.getElementById('valor_pesquisa_componente').textContent = this.textContent;
          console.log('Componente selecionado:', componente);
        });
      });