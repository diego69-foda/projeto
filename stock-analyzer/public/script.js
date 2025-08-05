document.addEventListener('DOMContentLoaded', () => {
  // Elementos da DOM
  const elements = {
    tickerInput: document.getElementById('tickerInput'),
    periodSelect: document.getElementById('periodSelect'),
    searchButton: document.getElementById('searchButton'),
    stockTitle: document.getElementById('stockTitle'),
    stockMeta: document.getElementById('stockMeta'),
    signalsTable: document.getElementById('signalsTable'),
    chartCtx: document.getElementById('stockChart').getContext('2d'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    errorContainer: document.getElementById('errorContainer'),
    tickerExamplesContainer: null
  };

  // Variáveis de estado
  let stockChart = null;
  let currentTimeout = null;
  let currentTicker = '';

  // Inicialização
  function init() {
    setupEventListeners();
    showWelcomeMessage();
  }

  // Configura listeners
  function setupEventListeners() {
    elements.tickerInput.addEventListener('input', handleTickerInput);
    
    elements.searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        const ticker = elements.tickerInput.value.trim();
        if (ticker.length >= 3) {
            currentTicker = ticker;
            fetchStockData(currentTicker, elements.periodSelect.value);
        } else {
            showError('Por favor, digite um ticker com pelo menos 3 caracteres.');
        }
    });

    elements.tickerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        elements.searchButton.click();
      }
    });

    elements.periodSelect.addEventListener('change', () => {
      if (currentTicker) {
        fetchStockData(currentTicker, elements.periodSelect.value);
      }
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'SPAN' && e.target.dataset.ticker) {
            setTicker(e.target.dataset.ticker);
        }
    });

    elements.tickerInput.focus();
  }

  // Manipula input do ticker (apenas para feedback visual)
  function handleTickerInput() {
    clearTimeout(currentTimeout);
    const ticker = elements.tickerInput.value.trim();
    
    if (ticker.length === 0) {
      showWelcomeMessage();
    } else {
      hideError();
      hideAllContent();
      elements.stockTitle.textContent = 'Digite o ticker e clique em Buscar...';
      currentTimeout = setTimeout(() => {}, 500);
    }
  }

  // Busca dados da ação
  async function fetchStockData(ticker, period) {
    showLoading();
    try {
      const response = await fetch(`/api/stock/${encodeURIComponent(ticker)}?period=${period}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw { message: errorData.error || 'Erro ao buscar dados', suggestion: errorData.suggestion };
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw { message: data.error || 'Dados inválidos recebidos', suggestion: data.suggestion };
      }
      
      updateUI(data);
    } catch (error) {
      showError(error.message || 'Ocorreu um erro inesperado.', error.suggestion);
      console.error('Error fetching stock data:', error);
    }
  }

  // Atualiza a UI com os dados
  function updateUI(data) {
    hideLoading();
    hideError();
    updateStockInfo(data);
    renderChart(data);
    renderSignals(data.signals);
  }

  // Atualiza informações da ação
  function updateStockInfo(data) {
    const lastClose = data.closes[data.closes.length - 1];
    const lastDate = new Date(data.timestamps[data.timestamps.length - 1] * 1000).toLocaleDateString('pt-BR');
    const currency = data.ticker.includes('-USD') ? 'US$' : 'R$';
    
    elements.stockTitle.innerHTML = `
      ${data.ticker} <span class="price">${currency} ${lastClose.toFixed(2)}</span>
      <span class="source">Fonte: ${data.source}</span>
    `;
    
    // Pega os valores mais recentes dos indicadores (agora SMA1 e SMA2)
    const latestSma1 = data.sma20[data.sma20.length - 1]; // SMA1 é o que era SMA20
    const latestSma2 = data.sma50[data.sma50.length - 1]; // SMA2 é o que era SMA50
    const latestRsi = data.rsi[data.rsi.length - 1];

    let optimizedParamsHtml = '';
    if (data.optimizedParams) {
        optimizedParamsHtml = `
            <dt>SMA Curta:</dt>
            <dd>${data.optimizedParams.sma1_period}</dd>
            <dt>SMA Longa:</dt>
            <dd>${data.optimizedParams.sma2_period}</dd>
            <dt>RSI Compra:</dt>
            <dd>${data.optimizedParams.rsi_buy_threshold}</dd>
            <dt>RSI Venda:</dt>
            <dd>${data.optimizedParams.rsi_sell_threshold}</dd>
        `;
    }

    elements.stockMeta.innerHTML = `
      <dl>
        <dt>Data:</dt>
        <dd>${lastDate}</dd>

        <dt>Período:</dt>
        <dd>${getPeriodName(elements.periodSelect.value)}</dd>

        <dt>SMA Curta (Opt.):</dt>
        <dd>${latestSma1?.toFixed(2) || 'N/A'}</dd>

        <dt>SMA Longa (Opt.):</dt>
        <dd>${latestSma2?.toFixed(2) || 'N/A'}</dd>

        <dt>RSI (14):</dt>
        <dd class="meta-value ${getRsiClass(latestRsi)}">
          ${latestRsi?.toFixed(2) || 'N/A'}
        </dd>
        ${optimizedParamsHtml}
      </dl>
    `;
  }

  // Renderiza o gráfico
  function renderChart(data) {
    const chartDataPoints = data.timestamps.map((t, i) => ({ x: new Date(t * 1000), y: data.closes[i] }));
    const sma1DataPoints = data.timestamps.map((t, i) => ({ x: new Date(t * 1000), y: data.sma20[i] }))
                               .filter(point => point.y !== null && point.y !== undefined);
    const sma2DataPoints = data.timestamps.map((t, i) => ({ x: new Date(t * 1000), y: data.sma50[i] }))
                               .filter(point => point.y !== null && point.y !== undefined);

    const isCrypto = data.ticker.includes('-USD');
    const currency = isCrypto ? 'US$' : 'R$' ;
    
    if (stockChart) {
      stockChart.destroy();
    }
    
    stockChart = new Chart(elements.chartCtx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Preço',
            data: chartDataPoints,
            borderColor: isCrypto ? '#8e44ad' : '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            borderWidth: 2,
            tension: 0.1,
            fill: true,
            pointRadius: 0
          },
          {
            label: `SMA Curta (${data.optimizedParams ? data.optimizedParams.sma1_period : 'N/A'})`,
            data: sma1DataPoints,
            borderColor: '#3498db',
            borderWidth: 1,
            pointRadius: 0,
            fill: false
          },
          {
            label: `SMA Longa (${data.optimizedParams ? data.optimizedParams.sma2_period : 'N/A'})`,
            data: sma2DataPoints,
            borderColor: '#e67e22',
            borderWidth: 1,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month',
              tooltipFormat: 'dd/MM/yyyy',
              displayFormats: {
                month: 'MMM yyyy'
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: `Preço (${currency})`
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.raw && typeof context.raw.y === 'number') {
                    return `${context.dataset.label}: ${currency} ${context.raw.y.toFixed(2)}`;
                }
                return `${context.dataset.label}: ${currency} ${context.parsed.y.toFixed(2)}`;
              }
            }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
  }

  // Renderiza os sinais como uma tabela semântica
  function renderSignals(signals) {
    if (!signals || signals.length === 0) {
      elements.signalsTable.innerHTML = `
        <div class="no-signals">
          Nenhum sinal de compra ou venda identificado no período selecionado
        </div>
      `;
      return;
    }
    
    const sortedSignals = [...signals].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = `
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Preço</th>
              <th>Sinal</th>
              <th>RSI</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    sortedSignals.slice(0, 15).forEach(signal => {
      const signalClass = signal.type === 'COMPRA' ? 'buy' : 'sell';
      const price = signal.price.toFixed(2);
      const rsi = signal.rsi.toFixed(1);
      const formattedDate = signal.date.split('-').reverse().join('/');
      
      html += `
        <tr class="${signalClass}">
          <td data-label="Data:">${formattedDate}</td>
          <td data-label="Preço:">${price}</td>
          <td data-label="Sinal:"><span class="signal-type ${signalClass}">${signal.type}</span></td>
          <td data-label="RSI:"><span class="signal-rsi ${getRsiClass(rsi)}">${rsi}</span></td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    elements.signalsTable.innerHTML = html;
  }

  // *** Funções de Gerenciamento de UI ***

  function hideAllContent() {
    elements.stockTitle.innerHTML = '';
    elements.stockMeta.innerHTML = '';
    elements.signalsTable.innerHTML = '';
    if (stockChart) {
      stockChart.destroy();
      stockChart = null;
    }
  }

  function showLoading() {
    hideAllContent();
    hideError();
    elements.loadingIndicator.style.display = 'block';
    elements.stockTitle.textContent = 'Buscando dados... Por favor, aguarde.';
  }

  function hideLoading() {
    elements.loadingIndicator.style.display = 'none';
  }

  function showError(message, suggestion = null) {
    hideLoading();
    hideAllContent();
    elements.errorContainer.style.display = 'block';
    elements.errorContainer.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        ${suggestion ? `<p><strong>Sugestão:</strong> ${suggestion}</p>` : ''}
        <div class="suggestions">
          <p>Tente também:</p>
          <ul>
            <li>Verificar a grafia do ticker</li>
            <li>Usar a formatação padrão (ex: PETR4, BTC, AAPL)</li>
            <li>Selecionar outro período de tempo</li>
            <li>Verificar sua conexão com a internet</li>
          </ul>
        </div>
      </div>
    `;
  }

  function hideError() {
    elements.errorContainer.style.display = 'none';
  }

  function showWelcomeMessage() {
    hideLoading();
    hideError();
    hideAllContent();
    
    elements.stockTitle.innerHTML = 'Bem-vindo ao Stock Analyzer Pro';
    elements.stockMeta.innerHTML = `
      <div class="welcome-message">
        <p>Digite o ticker da ação ou criptomoeda que deseja analisar no campo acima e clique em "Buscar".</p>
        <p>Você pode selecionar o período de análise desejado.</p>
        <div class="examples" id="tickerExamples">
          <p>Exemplos rápidos:</p>
          <div>
            <span tabindex="0" data-ticker="PETR4">PETR4 (BR)</span>
            <span tabindex="0" data-ticker="MXRF11">MXRF11 (BR)</span>
            <span tabindex="0" data-ticker="BTC">BTC (Crypto)</span>
            <span tabindex="0" data-ticker="AAPL">AAPL (EUA)</span>
            <span tabindex="0" data-ticker="MSFT">MSFT (EUA)</span>
          </div>
        </div>
      </div>
    `;
    elements.tickerExamplesContainer = document.getElementById('tickerExamples');
  }

  // Funções auxiliares

  function getPeriodName(periodValue) {
    const selectedOption = elements.periodSelect.querySelector(`option[value="${periodValue}"]`);
    return selectedOption ? selectedOption.textContent : periodValue;
  }

  function getRsiClass(rsiValue) {
    if (rsiValue === null || rsiValue === undefined) return '';
    if (rsiValue > 70) return 'overbought';
    if (rsiValue < 30) return 'oversold';
    return '';
  }

  window.setTicker = function(ticker) {
    elements.tickerInput.value = ticker;
    elements.searchButton.click();
  };

  init();
});