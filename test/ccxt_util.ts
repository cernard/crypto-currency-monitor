const ccxt = require('ccxt');

/**
 * Check valid exchanges and sort them by delay(ms).
 * @param {Function} callback callback function
 */
function ping(callback): void {
  let validExchanges = [];
  const invalidExchanges = [];
  let count = ccxt.exchanges.length - 1;
  ccxt.exchanges.forEach(async (exchange) => {
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
}

// ping((a, b) => {console.log(a, b)});

let binance = new ccxt['binance']();


// export { ping };
