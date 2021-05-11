const ccxt = require('ccxt');

/**
 * Check valid exchanges and sort them by delay(ms).
 * @param {Function} callback callback function
 */

interface ValidExchange {
  exchange: string;
  delay: number;
}
interface PingResult {
  validExchanges: ValidExchange[];
  invalidExchanges: string[];
}
export async function ping(callback: Function = () => {}): Promise<PingResult> {
  let validExchanges = [];
  const invalidExchanges = [];
  let count = ccxt.exchanges.length - 1;
  await ccxt.exchanges.forEach(async (exchange) => {
    const start = Date.now();
    await new ccxt[exchange]()
      .fetchStatus()
      .then((rep) => {
        // eslint-disable-next-line promise/always-return
        if (rep.status === 'ok') {
          const end = Date.now();
          validExchanges.push({
            exchange,
            delay: end - start,
          });
        }
      })
      .catch((_) => {
        invalidExchanges.push(exchange);
      })
      .finally(() => {
        count -= 1;
        if (count === 0) {
          validExchanges = validExchanges.sort((a, b) => a.delay - b.delay);
          callback.call(this, validExchanges, invalidExchanges);
        }
      });
  });
  return {
    validExchanges,
    invalidExchanges,
  };
}

interface Market {
  id: string;
  symbol: string;
  base: string;
  quote: string;
  baseId: string;
  quoteId: string;
  darkpool: boolean;
  info: any;
  altname: string;
  maker: number;
  taker: number;
  active: boolean;
  precision: any;
  limits: any;
}
export interface Markets {
  exchange: string;
  markets: Market[];
}

export async function fetchMarkets(
  exchanges: string[],
  callback: Function = () => {}
): Promise<Markets[]> {
  const markets: Markets[] = [];
  let count = exchanges.length;
  await exchanges.forEach(async (exchange) => {
    await new ccxt[exchange]()
      .fetchMarkets()
      .then((rep) => {
        markets.push({
          exchange,
          markets: rep,
        });
      })
      .catch((err) => console.log(err))
      .finally(() => {
        count -= 1;
        if (count === 0) {
          callback.call(this, markets);
        }
      });
  });
  return markets;
}

// ping((a, b) => {console.log(a, b)});
// fetchMarkets(['kraken'], (markets: Markets) => {
//   console.log(markets[0].markets[0])
// });

// export { ping };
