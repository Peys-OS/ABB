import { translateTask } from './translate';
import { summarizeTask } from './summarize';
import { onchainLookupTask } from './onchain-lookup';
import type { TaskType } from '../../../../packages/shared/src/types';

export async function executeTask(type: TaskType, description: string): Promise<{ output: string }> {
  switch (type) {
    case 'translate':
      return await translateTask(description);
    case 'summarize':
      return await summarizeTask(description);
    case 'onchain_lookup':
      return await onchainLookupTask(description);
    default:
      return { output: '[unknown task type — cannot execute]' };
  }
}
