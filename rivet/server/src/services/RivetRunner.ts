import {
  GraphId,
  GraphInputs,
  GraphOutputs,
  coerceType,
  currentDebuggerState,
  loadProjectFromFile,
  runGraph
} from '@ironclad/rivet-node';
import { rivetDebuggerServerState } from '../RivetDebuggerRoutes';
import { env } from 'process';
import { llamaExternalFunctions, modelExternalFunctions, utilsExternalFunctions, walletExternalFunctions } from '../externalFunctions';

export async function runMessageGraph(input: { type: 'assistant' | 'user'; message: string }[]): Promise<string> {
  const outputs = await runRivetGraph('5BI0Pfuu2naOUKqGUO-yZ' as GraphId, {
    messages: {
      type: 'object[]',
      value: input,
    },
  });

  return coerceType(outputs.output, 'string');
}

export async function runRivetGraph(graphId: GraphId, inputs?: GraphInputs): Promise<GraphOutputs> {''
  const project = currentDebuggerState.uploadedProject ?? await loadProjectFromFile('../xp.rivet-project');

  const outputs = await runGraph(project, {
    graph: graphId,
    openAiKey: env.OPENAI_API_KEY as string,
    inputs,
    remoteDebugger: rivetDebuggerServerState.server ?? undefined,
    externalFunctions: {
      ...utilsExternalFunctions,
      ...modelExternalFunctions,
      ...llamaExternalFunctions,
     ...walletExternalFunctions,
    },
  });

  return outputs;
}
