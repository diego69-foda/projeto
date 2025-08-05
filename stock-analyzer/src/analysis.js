// src/analysis.js

// Funções Auxiliares de Cálculo de Indicadores (movidas de server.js)
function calculateSMA(data, window) {
  return data.map((val, idx, arr) => {
    if (idx < window - 1) return null;
    const sum = arr.slice(idx - window + 1, idx + 1).reduce((a, b) => a + b);
    return sum / window;
  });
}

function movingAverage(data, period) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b);
    return sum / period;
  });
}

function calculateRSI(closes, period) {
  const deltas = closes.map((close, i) => i === 0 ? 0 : close - closes[i - 1]);
  const gains = deltas.map(d => d > 0 ? d : 0);
  const losses = deltas.map(d => d < 0 ? -d : 0);

  const avgGain = movingAverage(gains, period);
  const avgLoss = movingAverage(losses, period);

  return avgGain.map((gain, i) => {
    const loss = avgLoss[i];
    if (gain === null || loss === null) return null;
    if (loss === 0) return 100;
    const rs = gain / loss;
    return 100 - (100 / (1 + rs));
  });
}

// NOVO: Função de Backtesting (Simulação de estratégia)
function backtestStrategy(closes, sma1_period, sma2_period, rsi_buy_threshold, rsi_sell_threshold) {
    if (closes.length === 0) return { profit: 0, totalTrades: 0, winRate: 0 };

    const sma1 = calculateSMA(closes, sma1_period);
    const sma2 = calculateSMA(closes, sma2_period);
    const rsi = calculateRSI(closes, 14); // RSI period fixo em 14 para simplificar

    let portfolioValue = 1000; // Capital inicial
    let shares = 0; // Quantidade de ações
    let inPosition = false; // Flag: estamos comprados?
    let entryPrice = 0; // Preço da última compra
    let winCount = 0;
    let tradeCount = 0;

    // Encontra o primeiro índice onde todos os indicadores são calculáveis
    const startIndex = Math.max(
        sma1.findIndex(val => val !== null),
        sma2.findIndex(val => val !== null),
        rsi.findIndex(val => val !== null)
    );

    if (startIndex === -1 || startIndex >= closes.length - 1) {
        return { profit: 0, totalTrades: 0, winRate: 0, finalValue: 1000 }; // Não há dados suficientes
    }

    for (let i = startIndex; i < closes.length; i++) {
        const currentClose = closes[i];
        const currentSMA1 = sma1[i];
        const currentSMA2 = sma2[i];
        const currentRSI = rsi[i];

        if (currentSMA1 === null || currentSMA2 === null || currentRSI === null ||
            (i > 0 && (sma1[i-1] === null || sma2[i-1] === null))) {
            continue; // Garante que os valores de hoje e ontem (se aplicável) existam para as SMAs
        }

        // Condições de Compra
        // Golden Cross (SMA1 cruza SMA2 para cima) E RSI abaixo do limite de compra
        if (!inPosition && currentSMA1 > currentSMA2 && (i > 0 && sma1[i-1] <= sma2[i-1]) && currentRSI < rsi_buy_threshold) {
            shares = portfolioValue / currentClose; // Compra com todo o capital disponível
            entryPrice = currentClose;
            inPosition = true;
            tradeCount++;
        }
        // Condições de Venda
        // Death Cross (SMA1 cruza SMA2 para baixo) OU RSI acima do limite de venda
        else if (inPosition && ((currentSMA1 < currentSMA2 && (i > 0 && sma1[i-1] >= sma2[i-1])) || currentRSI > rsi_sell_threshold)) {
            portfolioValue = shares * currentClose; // Vende todas as ações
            inPosition = false;
            shares = 0;

            if (currentClose > entryPrice) {
                winCount++;
            }
        }
    }

    // Liquida a posição se ainda estiver comprado no final do período
    if (inPosition) {
        portfolioValue = shares * closes[closes.length - 1];
        if (closes[closes.length - 1] > entryPrice) {
            winCount++;
        }
    }

    const netProfit = (portfolioValue - 1000) / 1000; // Lucro percentual
    const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;

    return { profit: netProfit, totalTrades: tradeCount, winRate: winRate, finalValue: portfolioValue };
}

// NOVO: Função de Otimização de Parâmetros (Grid Search)
function optimizeParameters(closes) {
    let bestProfit = -Infinity;
    let bestParams = {
        sma1_period: 20,
        sma2_period: 50,
        rsi_buy_threshold: 30,
        rsi_sell_threshold: 70
    };

    // Ranges para os parâmetros a serem testados
    // Quanto maiores os ranges, mais lento o processo!
    const sma1_periods = [10, 15, 20, 25];
    const sma2_periods = [40, 50, 60, 75, 100];
    const rsi_buy_thresholds = [20, 25, 30, 35];
    const rsi_sell_thresholds = [65, 70, 75, 80];

    // console.log('Iniciando otimização de parâmetros...');
    let combinationsTested = 0;

    for (const s1 of sma1_periods) {
        for (const s2 of sma2_periods) {
            if (s1 >= s2) continue; // SMA menor deve ser sempre menor que SMA maior

            for (const rsiBuy of rsi_buy_thresholds) {
                for (const rsiSell of rsi_sell_thresholds) {
                    if (rsiBuy >= rsiSell) continue; // Limite de compra RSI deve ser menor que o de venda

                    combinationsTested++;
                    const result = backtestStrategy(closes, s1, s2, rsiBuy, rsiSell);

                    // Otimiza por lucro. Pode-se adicionar outras condições (ex: resultado.totalTrades > X)
                    if (result.profit > bestProfit) {
                        bestProfit = result.profit;
                        bestParams = {
                            sma1_period: s1,
                            sma2_period: s2,
                            rsi_buy_threshold: rsiBuy,
                            rsi_sell_threshold: rsiSell
                        };
                        // console.log(`Novo melhor: Lucro ${bestProfit.toFixed(2)}% com SMA(${s1}/${s2}), RSI(${rsiBuy}/${rsiSell})`);
                    }
                }
            }
        }
    }
    // console.log(`Otimização concluída. Combinações testadas: ${combinationsTested}`);
    // console.log(`Melhores parâmetros encontrados:`, bestParams, `com Lucro: ${bestProfit.toFixed(2)}%`);
    return bestParams;
}


// Função identifySignals MODIFICADA para usar os parâmetros otimizados
function identifySignals(timestamps, closes, optimizedParams) {
    const { sma1_period, sma2_period, rsi_buy_threshold, rsi_sell_threshold } = optimizedParams;

    const sma1 = calculateSMA(closes, sma1_period);
    const sma2 = calculateSMA(closes, sma2_period);
    const rsi = calculateRSI(closes, 14); // Período do RSI continua fixo em 14

    const signals = [];
    const startIndex = Math.max(
        sma1.findIndex(val => val !== null),
        sma2.findIndex(val => val !== null),
        rsi.findIndex(val => val !== null)
    );

    for (let i = Math.max(1, startIndex); i < closes.length; i++) {
        // Garante que os valores de hoje e ontem existam para as SMAs
        if (sma1[i] === null || sma2[i] === null || sma1[i - 1] === null || sma2[i - 1] === null || rsi[i] === null) {
            continue;
        }

        // Sinal de COMPRA (Golden Cross & RSI abaixo do limite de compra)
        // SMA1 cruza SMA2 de baixo para cima
        if (sma1[i] > sma2[i] && sma1[i - 1] <= sma2[i - 1] && rsi[i] < rsi_buy_threshold) {
            signals.push({
                type: 'COMPRA',
                date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
                price: closes[i],
                rsi: rsi[i]
            });
        }
        // Sinal de VENDA (Death Cross OU RSI acima do limite de venda)
        // SMA1 cruza SMA2 de cima para baixo OU RSI acima do limite de venda
        else if ((sma1[i] < sma2[i] && sma1[i - 1] >= sma2[i - 1]) || rsi[i] > rsi_sell_threshold) {
            signals.push({
                type: 'VENDA',
                date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
                price: closes[i],
                rsi: rsi[i]
            });
        }
    }
    return signals;
}

// Exporta as funções para que possam ser usadas em server.js
module.exports = {
    calculateSMA,
    calculateRSI,
    optimizeParameters,
    identifySignals
};