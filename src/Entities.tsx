class Currency {
  pair: Pair;
  avgPrice: number;
  kData: KData;
  priceChangePrecentIn24H: string;
  volume: number;
  symbol: string;

  constructor(pair: Pair, avgPrice: number = 0, kData: KData = new KData, priceChangePrecentIn24H: string = '', volume: number = 0, symbol: string = '$') {
    this.pair = pair;
    this.avgPrice = avgPrice;
    this.kData = kData;
    this.priceChangePrecentIn24H = priceChangePrecentIn24H;
    this.volume = volume;
    this.symbol = symbol;
  }

  // Format the price for the various of currencies
  static simplelyPrice(price: number = 0) {
    if (price == undefined) return 0;
    // if price more than 1000, don't care decimals
    if (price >= 1000) return price.toFixed(0);

    // otherwise, keep decimals to the latest different number.
    let fixedIndex = 1;
    const priceStr = price.toString();
    const startIndex = priceStr.indexOf('.') + 1;
    // always true normally
    if (startIndex < priceStr.length) {
        let lastChar: string = priceStr[startIndex];
        let multiple = 1;
        for (let i = startIndex; priceStr.length && i < priceStr.length; i++) {
            if (lastChar !== priceStr[i]) {
                fixedIndex = multiple;
                break;
            } else {
                multiple++;
            }
        }
    }
    return Math.floor(price * Math.pow(10, fixedIndex)) / Math.pow(10, fixedIndex);
  }

}

class KData {
  x: string[];
  y: number[];

  constructor(x: string[] = [], y: number[] = []) {
    this.x = x;
    this.y = y;
  }
}

class Pair {
  secondaryCurrency: string;
  baseCurrency: string;
  pair: string;
  public purchasePrice: number;

  constructor(secondaryCurrency: string, baseCurrency: string = 'USDT', purchasePrice: number = -1) {
    this.secondaryCurrency = secondaryCurrency;
    this.baseCurrency = baseCurrency;
    this.pair = `${this.secondaryCurrency}${this.baseCurrency}`;
    this.purchasePrice = purchasePrice;
  }
}

export {
  Currency,
  KData,
  Pair
}
