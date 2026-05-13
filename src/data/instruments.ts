export type Instrument = {
  symbol: string;
  name: string;
  category: "fx" | "indices" | "commodities" | "crypto" | "shares";
  base: number;
  digits: number;
  spread: number;
};

export const INSTRUMENTS: Instrument[] = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", category: "fx", base: 1.0865, digits: 4, spread: 0.0 },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", category: "fx", base: 1.2742, digits: 4, spread: 0.1 },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", category: "fx", base: 151.84, digits: 2, spread: 0.1 },
  { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", category: "fx", base: 0.6588, digits: 4, spread: 0.2 },
  { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", category: "fx", base: 1.3712, digits: 4, spread: 0.2 },
  { symbol: "EUR/GBP", name: "Euro / British Pound", category: "fx", base: 0.8526, digits: 4, spread: 0.3 },

  { symbol: "US500", name: "S&P 500", category: "indices", base: 5247.4, digits: 1, spread: 0.4 },
  { symbol: "US30", name: "Dow Jones", category: "indices", base: 39842, digits: 0, spread: 1.0 },
  { symbol: "NAS100", name: "NASDAQ 100", category: "indices", base: 18356, digits: 1, spread: 0.8 },
  { symbol: "GER40", name: "DAX 40", category: "indices", base: 18207, digits: 1, spread: 0.9 },
  { symbol: "UK100", name: "FTSE 100", category: "indices", base: 7942, digits: 1, spread: 0.7 },

  { symbol: "XAU/USD", name: "Gold", category: "commodities", base: 2384.5, digits: 2, spread: 0.15 },
  { symbol: "XAG/USD", name: "Silver", category: "commodities", base: 28.42, digits: 3, spread: 0.02 },
  { symbol: "USOIL", name: "WTI Crude Oil", category: "commodities", base: 81.32, digits: 2, spread: 0.03 },
  { symbol: "UKOIL", name: "Brent Crude Oil", category: "commodities", base: 85.18, digits: 2, spread: 0.03 },

  { symbol: "BTC/USD", name: "Bitcoin", category: "crypto", base: 64218, digits: 1, spread: 12 },
  { symbol: "ETH/USD", name: "Ethereum", category: "crypto", base: 3187.2, digits: 2, spread: 1.4 },
  { symbol: "SOL/USD", name: "Solana", category: "crypto", base: 142.8, digits: 2, spread: 0.4 },

  { symbol: "AAPL", name: "Apple Inc.", category: "shares", base: 187.42, digits: 2, spread: 0.03 },
  { symbol: "TSLA", name: "Tesla Inc.", category: "shares", base: 174.18, digits: 2, spread: 0.05 },
  { symbol: "NVDA", name: "NVIDIA Corp.", category: "shares", base: 924.6, digits: 2, spread: 0.08 },
];
