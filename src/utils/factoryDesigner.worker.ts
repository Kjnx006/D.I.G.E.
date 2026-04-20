import type { CalcParams, SolutionResult } from '../types/calc';
import { FactoryDesigner } from './FactoryDesigner';

export type WorkerRequest = {
  type: 'solve';
  params: CalcParams;
};

export type WorkerResponse =
  | { type: 'result'; solutions: SolutionResult[] }
  | { type: 'error'; message: string };

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { type, params } = event.data;
  if (type === 'solve') {
    try {
      const designer = new FactoryDesigner(params);
      const results = designer.solve();
      self.postMessage({ type: 'result', solutions: results } satisfies WorkerResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      self.postMessage({ type: 'error', message } satisfies WorkerResponse);
    }
  }
};
