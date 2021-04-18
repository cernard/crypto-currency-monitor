class SyncQueue {
  private rate: number; // Processed task count per second.
  private queue: Function[] = [];
  private interval: number = 1000;
  private intervalHandle: any;
  private isPause: boolean = false;

  constructor(rate: number = 3) {
    this.rate = rate;
    this.start();
  }

  add = (func: Function) => {
    this.queue.push(func);
    // console.log('Serial number in the queue: ' + this.queue.length);
  }

  addAll = (funcs: Function[]) => {
    this.queue.push(...funcs);
  }

  start = () => {
    this.intervalHandle = setInterval(() => {
      for (let i = 0; this.queue.length > 0 && !this.isPause && i < this.rate ; i++) {
        const func: Function | undefined = this.queue.shift();
        if (func) func.call(this);
      }
    }, this.interval);
  }

  stop = () => {
    clearInterval(this.intervalHandle);
  }

  pause = () => {
    this.isPause = true;
  }

  resume = () => {
    this.isPause = false;
  }
}

export default SyncQueue;
