import { ExternalFunctionProcessContext, DataValue } from '@ironclad/rivet-node';
import { parse } from 'csv-parse/sync';

interface DataObject {
  date: string;
  csv: string;
}

export const modelExternalFunctions: Record<
  string,
  (context: ExternalFunctionProcessContext, ...args: unknown[]) => Promise<DataValue & { cost?: number }>
> = {
  calculateDelta: async (_context, args) => {
    const [{ data }] = args as [{ data: DataObject[] }];

    const sortedData = data.sort((a, b) => a.date.localeCompare(b.date));

    const parseCsv = (csv: string) => {
      return parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    };

    const means = sortedData.slice(0, 4).map((obj) => {
      const rows = parseCsv(obj.csv);
      const values: Record<string, number> = {};
      rows.forEach(row => {
        values[row.type.trim()] = parseFloat(row.value);
      });
      return values;
    });

    const rollingMean = (start: number) => {
      const window = means.slice(start, start + 3);
      const totals = window.reduce((acc, val) => {
        Object.keys(val).forEach(key => {
          acc[key] = (acc[key] || 0) + val[key];
        });
        return acc;
      }, {} as Record<string, number>);

      const result: Record<string, number> = {};
      Object.keys(totals).forEach(key => {
        result[key] = totals[key] / 3;
      });
      return result;
    };

    const mean0 = rollingMean(0);
    const mean1 = rollingMean(1);

    return {
      type: 'object',
      value: {
        ipca_delta_mean_last_3: mean1['ipca'] - mean0['ipca'],
        selic_delta_mean_last_3: mean1['selic'] - mean0['selic'],
        cambio_delta_mean_last_3: mean1['cambio'] - mean0['cambio'],
      },
    };
  },
};
