
export interface PricePoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  sma20?: number;
  ema20?: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
  predicted?: number;
}

/**
 * Calculates Simple Moving Average
 */
export function calculateSMA(data: number[], period: number): (number | undefined)[] {
  const sma: (number | undefined)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(undefined);
      continue;
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

/**
 * Calculates Relative Strength Index
 */
export function calculateRSI(data: number[], period: number = 14): (number | undefined)[] {
  const rsi: (number | undefined)[] = [];
  let gains: number[] = [];
  let losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(undefined);
      continue;
    }
    
    if (i > period) {
      avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
    }

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }
  return rsi;
}

/**
 * Calculates MACD
 */
export function calculateMACD(data: number[]): { macd: (number | undefined)[], signal: (number | undefined)[], histogram: (number | undefined)[] } {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  
  const macdLine: (number | undefined)[] = data.map((_, i) => {
    if (ema12[i] !== undefined && ema26[i] !== undefined) {
      return (ema12[i] as number) - (ema26[i] as number);
    }
    return undefined;
  });

  const validMACD = macdLine.filter(v => v !== undefined) as number[];
  const signalLineRaw = calculateEMA(validMACD, 9);
  
  const signalLine: (number | undefined)[] = [];
  let signalIdx = 0;
  for (let i = 0; i < data.length; i++) {
    if (macdLine[i] === undefined || signalIdx >= signalLineRaw.length) {
      signalLine.push(undefined);
    } else {
      signalLine.push(signalLineRaw[signalIdx++]);
    }
  }

  const histogram = macdLine.map((m, i) => {
    if (m !== undefined && signalLine[i] !== undefined) {
      return m - (signalLine[i] as number);
    }
    return undefined;
  });

  return { macd: macdLine, signal: signalLine, histogram };
}

function calculateEMA(data: number[], period: number): (number | undefined)[] {
  const k = 2 / (period + 1);
  const ema: (number | undefined)[] = [];
  let prevEma: number | undefined = undefined;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      prevEma = data[i];
      ema.push(prevEma);
      continue;
    }
    prevEma = data[i] * k + (prevEma as number) * (1 - k);
    ema.push(prevEma);
  }
  return ema;
}

/**
 * Simulates a historical price trend for a stock
 */
export function generateHistoricalData(basePrice: number, volatility: number = 0.02, points: number = 100): PricePoint[] {
  const data: PricePoint[] = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const change = currentPrice * volatility * (Math.random() - 0.48); // Slight upward bias
    const open = currentPrice;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.5 * open);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.5 * open);
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    data.push({
      date: date.toISOString().split('T')[0],
      open,
      close,
      high,
      low,
      volume
    });
    currentPrice = close;
  }

  // Calculate indicators
  const closes = data.map(d => d.close);
  const sma20 = calculateSMA(closes, 20);
  const rsi = calculateRSI(closes, 14);
  const { macd, signal, histogram } = calculateMACD(closes);

  return data.map((d, i) => ({
    ...d,
    sma20: sma20[i],
    rsi: rsi[i],
    macd: macd[i],
    signal: signal[i],
    histogram: histogram[i]
  }));
}

/**
 * Simulates ML Prediction (LSTM-like behavior)
 */
export function generatePredictions(lastPrice: number, trend: number, horizon: number = 90): PricePoint[] {
  const predictions: PricePoint[] = [];
  let currentPrice = lastPrice;
  const now = new Date();

  for (let i = 1; i <= horizon; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // ML logic: trend continuation with noise
    const drift = trend / 30; // normalized daily drift
    const volatility = 0.015;
    const change = currentPrice * (drift + volatility * (Math.random() - 0.5));
    currentPrice += change;

    predictions.push({
      date: date.toISOString().split('T')[0],
      close: currentPrice,
      open: currentPrice,
      high: currentPrice,
      low: currentPrice,
      volume: 0,
      predicted: currentPrice
    });
  }

  return predictions;
}
