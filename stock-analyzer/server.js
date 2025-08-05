// server.js

const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;

// Importa as funções de análise do novo arquivo
const {
    calculateSMA,
    calculateRSI,
    optimizeParameters,
    identifySignals
} = require('./src/analysis'); // Caminho para o novo arquivo

// Configuração
app.use(express.static('public'));
app.use(express.json());

// Cache em memória para dados de ticker e parâmetros otimizados
const tickerDataCache = new Map();
const tickerOptimizedParamsCache = new Map(); // Cache para os parâmetros otimizados
const DATA_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos para dados brutos
const OPTIMIZATION_CACHE_DURATION = 60 * 60 * 1000; // 1 hora para parâmetros otimizados

// ATENÇÃO DE SEGURANÇA:
// A chave da API está diretamente no código.
// Para um projeto real ou que será versionado, RECOMENDA-SE FORTEMENTE
// o uso de variáveis de ambiente (ex: com a biblioteca 'dotenv').
const ALPHA_VANTAGE_API_KEY = 'WYHLWWW1KPV99XER'; // Substitua pela sua chave REAL

// Funções Auxiliares de Formatação e Sugestão (mantidas em server.js ou podem ser movidas para outra utils.js se quiser)
function formatTicker(ticker) {
    ticker = ticker.toUpperCase();

    // Tickers especiais e criptomoedas
    const specialTickers = {
        'BTC': 'BTC-USD',
        'ETH': 'ETH-USD',
        'XRP': 'XRP-USD', // Exemplo
        'DOGE': 'DOGE-USD', // Exemplo
        'MXRF11': 'MXRF11.SA',
        'BOVA11': 'BOVA11.SA',
        'IVVB11': 'IVVB11.SA',
        // Adicione outros tickers especiais conforme necessário
    };

    if (specialTickers[ticker]) return specialTickers[ticker];

    // Padrões genéricos
    if (/^\d{4}$/.test(ticker)) return `${ticker}.F`; // Futuros (genérico)
    if (/^[A-Z]{4}\d{1,2}$/.test(ticker)) return `${ticker}.SA`; // Ações brasileiras (ex: PETR4, ITUB3)
    if (/^[A-Z]{4}11$/.test(ticker)) return `${ticker}.SA`; // ETFs/FIIs brasileiros (ex: BOVA11)
    if (/^[A-Z]{3,4}$/.test(ticker)) {
        // Tenta identificar se é uma ação americana ou cripto de 3/4 letras
        // Isso é uma heurística e pode precisar de ajustes
        return ticker.length === 4 ? `${ticker}.SA` : `${ticker}-USD`; // Ação br ou cripto
    }
    return ticker; // Retorna como está se não encontrar padrão
}

function getTickerSuggestion(ticker) {
    ticker = ticker.toUpperCase();

    if (/^\d+$/.test(ticker)) return `Para futuros ou FIIs/ETFs, tente adicionar .F ou .SA (ex: ${ticker}.F ou ${ticker}.SA)`;
    if (/^[A-Z]{4}\d?$/.test(ticker)) return `Para ações brasileiras, adicione .SA (ex: ${ticker}.SA)`;
    if (/^[A-Z]{3}$/.test(ticker) || /^[A-Z]{4}$/.test(ticker)) return `Para criptomoedas, adicione -USD (ex: ${ticker}-USD), ou para ações americanas, use o ticker direto (ex: ${ticker})`;
    return 'Verifique se o ticker está correto e tente novamente, ou tente tickers conhecidos como PETR4, AAPL, BTC.';
}

// Funções de Busca de Dados de APIs
async function fetchYahooFinance(ticker, period) {
    const formattedTicker = formatTicker(ticker);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedTicker}?interval=1d&range=${period}`;

    try {
        const response = await axios.get(url, { timeout: 5000 });
        if (!response.data || !response.data.chart || !response.data.chart.result || response.data.chart.result.length === 0) {
            return null;
        }

        const data = response.data.chart.result[0];
        const closes = data.indicators.quote[0].close;
        const timestamps = data.timestamp;

        const validData = timestamps.map((ts, i) => ({ timestamp: ts, close: closes[i] }))
                                    .filter(item => item.close !== null && item.close !== undefined);

        const validTimestamps = validData.map(item => item.timestamp);
        const validCloses = validData.map(item => item.close);

        return {
            success: true,
            ticker,
            source: 'Yahoo Finance',
            timestamps: validTimestamps,
            closes: validCloses,
        };
    } catch (error) {
        console.warn(`Yahoo Finance falhou para ${ticker}: ${error.message}`);
        return null;
    }
}

async function fetchAlphaVantage(ticker) {
    const formattedTicker = formatTicker(ticker);
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${formattedTicker}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=full`;

    try {
        const response = await axios.get(url, { timeout: 5000 });

        if (!response.data || !response.data['Time Series (Daily)']) {
            if (response.data && response.data["Information"]) {
                console.warn(`Alpha Vantage API limit hit or error for ${ticker}: ${response.data["Information"]}`);
            }
            return null;
        }

        const timeSeries = response.data['Time Series (Daily)'];
        const dataPairs = [];

        for (const [date, values] of Object.entries(timeSeries)) {
            dataPairs.push({
                timestamp: new Date(date).getTime() / 1000,
                close: parseFloat(values['4. close'])
            });
        }

        dataPairs.sort((a, b) => a.timestamp - b.timestamp); // Ordena do mais antigo para o mais recente

        const orderedTimestamps = dataPairs.map(item => item.timestamp);
        const orderedCloses = dataPairs.map(item => item.close);

        return {
            success: true,
            ticker,
            source: 'Alpha Vantage',
            timestamps: orderedTimestamps,
            closes: orderedCloses,
        };
    } catch (error) {
        console.warn(`Alpha Vantage falhou para ${ticker}: ${error.message}`);
        return null;
    }
}

// Função principal para buscar dados da ação (com fallback)
async function fetchStockData(ticker, period) {
    // Tenta Yahoo Finance primeiro
    let data = await fetchYahooFinance(ticker, period);
    if (data) return data;

    // Fallback para Alpha Vantage
    // Nota: O Alpha Vantage não tem um parâmetro 'periodo' na URL para TIME_SERIES_DAILY.
    // Ele retorna o histórico completo, que será filtrado na rota /api/stock/:ticker
    data = await fetchAlphaVantage(ticker);
    if (data) return data;

    // Se nenhuma API retornar dados
    throw new Error('Não foi possível obter dados para este ativo.');
}

// NOVO: Função para obter a quantidade de dias para o período
function getDaysForPeriod(period) {
    switch (period) {
        case '1mo': return 30;
        case '3mo': return 90;
        case '6mo': return 180;
        case '1y': return 365;
        case '2y': return 730;
        case '5y': return 1825;
        default: return 365; // Padrão para 1 ano se o período for desconhecido
    }
}

// Rotas
app.get('/api/stock/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const period = req.query.period || '1y'; // Default para 1 ano

    try {
        // Verifica cache para dados brutos do ticker
        const cachedData = tickerDataCache.get(ticker);
        let stockData;

        if (cachedData && (Date.now() - cachedData.timestamp) < DATA_CACHE_DURATION) {
            console.log(`Retornando dados brutos de ${ticker} do cache.`);
            stockData = cachedData.data;
        } else {
            console.log(`Buscando dados brutos para ${ticker} (${period}).`);
            stockData = await fetchStockData(ticker, period);
            tickerDataCache.set(ticker, { data: stockData, timestamp: Date.now() });
        }

        // NOVO: Filtrar os dados para o período solicitado ANTES de calcular os indicadores
        const daysToFetch = getDaysForPeriod(period);
        const cutoffTimestamp = Math.floor((Date.now() - (daysToFetch * 24 * 60 * 60 * 1000)) / 1000); // Timestamp em segundos

        const filteredTimestamps = [];
        const filteredCloses = [];

        // Encontra o ponto de corte para o período
        let startIndex = 0;
        for (let i = 0; i < stockData.timestamps.length; i++) {
            if (stockData.timestamps[i] >= cutoffTimestamp) {
                startIndex = i;
                break;
            }
        }

        // Garante que o período "1mo" etc, não seja menor que o tamanho dos dados disponíveis
        // e que não retorne um array vazio se o start index for maior que o ultimo elemento
        const finalStartIndex = Math.max(0, startIndex);
        
        filteredTimestamps.push(...stockData.timestamps.slice(finalStartIndex));
        filteredCloses.push(...stockData.closes.slice(finalStartIndex));

        // Cria um novo objeto stockData com os dados filtrados para uso posterior
        const processedStockData = {
            ...stockData,
            timestamps: filteredTimestamps,
            closes: filteredCloses
        };

        // --- Parte de OTIMIZAÇÃO e CÁLCULO DE INDICADORES ---
        let optimizedParams = tickerOptimizedParamsCache.get(ticker);

        // Otimiza os parâmetros se não estiverem em cache ou se o cache expirou
        if (!optimizedParams || (Date.now() - optimizedParams.timestamp) > OPTIMIZATION_CACHE_DURATION) {
            console.log(`Otimizando parâmetros para ${ticker}.`);
            // Use uma porção dos dados para otimizar (ex: os últimos 180 dias de closes)
            // É importante usar os dados *brutos* ou uma janela maior para a otimização
            // A otimização atual já usa slice(-180), então está ok.
            optimizedParams = optimizeParameters(stockData.closes.slice(-180)); // Usa o stockData original, não o filtrado por período
            tickerOptimizedParamsCache.set(ticker, { data: optimizedParams, timestamp: Date.now() });
        } else {
            console.log(`Retornando parâmetros otimizados para ${ticker} do cache.`);
            optimizedParams = optimizedParams.data;
        }

        // Calcula os indicadores e sinais usando os parâmetros otimizados E os dados FILTRADOS
        // Note que estamos usando processedStockData aqui
        const sma1 = calculateSMA(processedStockData.closes, optimizedParams.sma1_period);
        const sma2 = calculateSMA(processedStockData.closes, optimizedParams.sma2_period);
        const rsi = calculateRSI(processedStockData.closes, 14); // Período do RSI fixo em 14 para o cálculo

        const signals = identifySignals(processedStockData.timestamps, processedStockData.closes, optimizedParams);

        res.json({
            ...processedStockData, // Agora com os timestamps e closes filtrados
            sma20: sma1, // Renomeado para SMA1 para refletir a otimização
            sma50: sma2, // Renomeado para SMA2 para refletir a otimização
            rsi: rsi,
            signals: signals,
            optimizedParams: optimizedParams // Opcional: envia os parâmetros otimizados para o frontend
        });

    } catch (error) {
        console.error('Erro na API para o ticker:', ticker, error.message);
        res.status(400).json({
            error: error.message,
            suggestion: getTickerSuggestion(ticker)
        });
    }
});

// Rota para servir o arquivo HTML principal
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Teste com (abra no navegador):');
    console.log(`- Ação brasileira: http://localhost:${PORT}/`);
    console.log(`- Criptomoeda: http://localhost:${PORT}/`);
    console.log(`- Ação americana: http://localhost:${PORT}/`);
    console.log('\nUse os exemplos na página para testar rapidamente.');
});