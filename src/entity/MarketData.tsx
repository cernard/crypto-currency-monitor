export default interface MarketData {
  base: string;
  quote: string;
  exchange: string;
  currentPrice: number;
  purchasePrice: number;
  amount: number;
  changePercent?: number;
  kData?: any;
  symbol: string;
}
