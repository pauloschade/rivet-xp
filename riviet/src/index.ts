import dotenv from 'dotenv';
dotenv.config();

import {
    loadProjectFromFile,
    runGraph,
    coerceType,
    startDebuggerServer,
    GraphId,
    GraphInputs,
    GraphProcessor,
  } from '@ironclad/rivet-node';
  import { llamaExternalFunctions, utilsExternalFunctions, modelExternalFunctions } from './externalFunctions';

  
  const PORT = 8080;
  
  async function main() {
    const project = await loadProjectFromFile('./xp.rivet-project');
  
    const debuggerServer = startDebuggerServer({
      port: PORT,
      allowGraphUpload: true,
      dynamicGraphRun: async ({ client, graphId, inputs }) => {
        console.log(`Dynamically running graph: ${graphId}`);
  
        await runGraph(project, {
          graph: graphId as GraphId,
          openAiKey: process.env.OPENAI_API_KEY as string,
          inputs: inputs as GraphInputs,
          externalFunctions: {
            ...llamaExternalFunctions,
            ...utilsExternalFunctions,
            ...modelExternalFunctions,
          },
          remoteDebugger: debuggerServer,
        });
      },
    });
  
    console.log(`Debugger server running on ws://localhost:${PORT}`);
  }
  
  main().catch(console.error);