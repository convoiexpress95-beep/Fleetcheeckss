// Simple in-memory metrics & event logging (peut être remplacé plus tard)
// Fournit counters, increments, timers et un helper logEvent.

export type MetricCounter = { name: string; value: number };

class MetricsRegistry {
  private counters: Record<string, number> = {};

  inc(name: string, by = 1) {
    this.counters[name] = (this.counters[name] || 0) + by;
  }
  get(name: string) { return this.counters[name] || 0; }
  snapshot(): MetricCounter[] { return Object.entries(this.counters).map(([name, value]) => ({ name, value })); }
}

export const metrics = new MetricsRegistry();

export function logEvent(event: string, payload?: any) {
  metrics.inc(`event.${event}`);
  // Log minimal en console pour debug
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[event]', event, payload ?? '');
  }
}

export function time<T>(name: string, fn: () => Promise<T>): Promise<T>;
export function time<T>(name: string, fn: () => T): T;
export function time<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
  const start = performance.now();
  const end = (ok: boolean) => {
    const ms = performance.now() - start;
    metrics.inc(`timer.${name}.count`);
    metrics.inc(`timer.${name}.ms.total`, ms);
    if (!ok) metrics.inc(`timer.${name}.errors`);
  };
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(r => { end(true); return r; }).catch(e => { end(false); throw e; });
    }
    end(true);
    return res;
  } catch (e) {
    end(false);
    throw e;
  }
}
