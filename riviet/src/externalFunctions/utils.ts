import { ExternalFunctionProcessContext, DataValue } from '@ironclad/rivet-node';

export const utilsExternalFunctions: Record<
  string,
  (context: ExternalFunctionProcessContext, ...args: unknown[]) => Promise<DataValue & { cost?: number }>
> = {
  timeout: async (_context, args) => {
    const { seconds } = args as { seconds: number };

    console.log(`Timeout started: ${seconds} seconds`);

    await new Promise(resolve => setTimeout(resolve, seconds * 1000));

    const {value} = args as {value: Record<string, unknown>};

    console.log(`Timeout complete: ${JSON.stringify(value)}`);

    return {
      type: 'object',
      value: value as Record<string, unknown>,
    };
  },
};
