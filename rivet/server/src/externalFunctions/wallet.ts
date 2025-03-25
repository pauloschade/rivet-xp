import { ExternalFunctionProcessContext, DataValue } from '@ironclad/rivet-node'
import { parse } from 'csv-parse/sync'

function roundToHalf(num: number): number {
  return Math.round(num * 2) / 2
}

export const walletExternalFunctions: Record<
  string,
  (context: ExternalFunctionProcessContext, ...args: unknown[]) => Promise<DataValue & { cost?: number }>
> = {
  profileAllocation: async (_context, rawArgs) => {
    const { past, deltas } = rawArgs as { past: string; deltas: string }

    const csvString = past
    const deltasObj = JSON.parse(deltas) as Record<string, Record<string, number>>

    const parsedRows = parse(csvString, { columns: true, skip_empty_lines: true }) as Array<Record<string, string>>
    const columns = Object.keys(parsedRows[0]).filter(k => k !== 'classe')

    const updatedRows: Array<Record<string, number | string>> = parsedRows.map(row => {
      const newRow: Record<string, number | string> = { classe: row.classe }
      columns.forEach(col => {
        const originalValue = parseFloat(row[col])
        const deltaKey = col + '_delta'
        const asset = row.classe
        const deltaValue = deltasObj[deltaKey]?.[asset] ?? 0
        newRow[col] = originalValue + deltaValue
      })
      return newRow
    })

    const sums: Record<string, number> = {}
    columns.forEach(col => {
      sums[col] = updatedRows.reduce((acc, row) => acc + (row[col] as number), 0)
    })

    updatedRows.forEach(row => {
      columns.forEach(col => {
        const val = row[col] as number
        const percent = (val / sums[col]) * 100
        row[col] = roundToHalf(percent)
      })
    })

    const outputCols = ['classe', ...columns]
    const csvLines = [outputCols.join(',')]
    updatedRows.forEach(row => {
      const line = outputCols.map(col => String(row[col])).join(',')
      csvLines.push(line)
    })

    return {
      type: 'string',
      value: csvLines.join('\n')
    }
  },

  reduceAssetAllocations: async (_context, rawArgs) => {
    console.log('reduceAssetAllocations')
    console.log('args: ', rawArgs)

    const csvString = rawArgs as string
    const parsedRows = parse(csvString, { columns: true, skip_empty_lines: true }) as Array<Record<string, string>>
    const result: Record<string, { total: number; alloc: number }> = {}
    parsedRows.forEach(row => {
      const type = row.type
      const amt = parseFloat(row.amt) || 0
      const alloc = parseFloat(row.alloc_perc) || 0
      if (!result[type]) {
        result[type] = { total: 0, alloc: 0 }
      }
      result[type].total += amt
      result[type].alloc += alloc
    })
    const output = Object.keys(result).map(type => ({
      type: type,
      total: Number(result[type].total.toFixed(2)),
      alloc: Number(result[type].alloc.toFixed(2))
    }))
    return {
      type: 'object',
      value: {
        categories: output
      }
    }
  },
  calculatePerformance: async (_context, rawArgs) => {
    const csvString = rawArgs as string;

    const parsedRows = parse(csvString, {
      columns: true,
      skip_empty_lines: true
    }) as Array<Record<string, string>>;

    const rendaFixaTypes = ['prefixado', 'posfixado', 'inflacao'];
    const fundosTypes = ['fundos', 'multimercados'];
    const CDI = 0.83;

    const performances = parsedRows.map(row => {
      const assetType = row.type;
      const assetName = row.asset;
      const amt = parseFloat(row.amt) || 0;

      let performance: number | string = 0;
      let performanceVsCdi: number | string = 0;

      // 1A) If it's a renda fixa type: store row.performance as-is (string)
      //     and do NOT compare vs. CDI
      if (rendaFixaTypes.includes(assetType)) {
        performance = row.performance; 
        performanceVsCdi = 'None';
      }
      // 1B) If it's fundos/multimercados: parse the numeric from row.performance
      //     and compare vs. CDI using performance/CDI
      else if (fundosTypes.includes(assetType)) {
        const perfString = row.performance
          .replace('%', '')
          .replace(',', '.')
          .replace(/[^\d.-]/g, '')
          .trim();
        const perfNumber = parseFloat(perfString) || 0;
        performance = perfNumber;
        performanceVsCdi = Number((perfNumber / CDI).toFixed(2));
      }
      // 1C) Otherwise, assume we have price_past and price_now
      else {
        const pricePast = parseFloat(row.price_past) || 0;
        const priceNow = parseFloat(row.price_now) || 0;
        const perfCalc = pricePast ? ((priceNow - pricePast) / pricePast) * 100 : 0;
        performance = Number(perfCalc.toFixed(2));
        performanceVsCdi = Number((perfCalc / CDI).toFixed(2));
      }

      return {
        name: assetName,
        type: row.type,
        amt: amt,
        performance,
        performance_vs_cdi: performanceVsCdi
      };
    });

    return {
      type: 'object',
      value: {
        assets: performances
      }
    };
  },

  // 2) Calculates the 'categories' array: sum of (performance × amt) per category, etc.
  calculateCategories: async (_context, rawArgs) => {
    const csvString = rawArgs as string;
    const parsedRows = parse(csvString, {
      columns: true,
      skip_empty_lines: true
    }) as Array<Record<string, string>>;

    // We want to produce something like:
    // { type: ..., value: sum(performance * amt), value_vs_cdi: sum(performance * amt) / sum(CDI * amt) }
    // But we have to decide numeric performance for summation. For 'rendaFixaTypes', that might be non-numeric => treat as 0.

    const CDI = 0.83;
    const rendaFixaTypes = ['prefixado', 'posfixado', 'inflacao'];
    const fundosTypes = ['fundos', 'multimercados'];

    // Dictionary to accumulate sums
    // categoriesSums[type] = { sumPerfTimesAmt, sumCdiTimesAmt }
    const categoriesSums: Record<string, { sumPerfTimesAmt: number; sumCdiTimesAmt: number }> = {};

    parsedRows.forEach(row => {
      const assetType = row.type;
      let amt = parseFloat(row.amt) || 1;

      // We'll interpret numeric performance for summation
      // If it's rendaFixa, row.performance could be "ipca + 5.55%"
      // -> We'll treat that as 0 for numeric summation
      let numericPerf = 0;
      if (rendaFixaTypes.includes(assetType)) {
        numericPerf = parseFloat(row.amt);
        amt = 1
      } else if (fundosTypes.includes(assetType)) {
        const perfString = row.performance
          .replace('%', '')
          .replace(',', '.')
          .replace(/[^\d.-]/g, '')
          .trim();
        numericPerf = parseFloat(perfString) || 0;
      } else {
        // For other types, row.performance is presumably numeric
        const pricePast = parseFloat(row.price_past) || 0;
        const priceNow = parseFloat(row.price_now) || 0;
        const calc = pricePast ? ((priceNow - pricePast) / pricePast) * 100 : 0;
        numericPerf = calc;
      }

      const perfTimesAmt = numericPerf * amt;
      const cdiTimesAmt = CDI * amt;

      if (!categoriesSums[assetType]) {
        categoriesSums[assetType] = {
          sumPerfTimesAmt: 0,
          sumCdiTimesAmt: 0
        };
      }
      categoriesSums[assetType].sumPerfTimesAmt += perfTimesAmt;
      categoriesSums[assetType].sumCdiTimesAmt += cdiTimesAmt;
    });

    // Transform into desired array of objects
    const categories = Object.keys(categoriesSums).map(typeKey => {
      const { sumPerfTimesAmt, sumCdiTimesAmt } = categoriesSums[typeKey];
      const value = sumPerfTimesAmt; 
      // If sumCdiTimesAmt is 0, avoid dividing by zero
      const valueVsCdi = sumCdiTimesAmt ? (sumPerfTimesAmt / sumCdiTimesAmt) : 0;
      return {
        type: typeKey,
        value: Number(value.toFixed(2)),
        value_vs_cdi: Number(valueVsCdi.toFixed(2))
      };
    });

    return {
      type: 'object',
      value: {
        categories
      }
    };
  },

  // 3) A third function that calls both above and merges the results
  calculatePerformanceFull: async (context, rawArgs) => {
    const performanceResult = await walletExternalFunctions.calculatePerformance(context, rawArgs);
    const categoriesResult = await walletExternalFunctions.calculateCategories(context, rawArgs);

    // @ts-ignore
    const categoriesArray = (categoriesResult.value.categories as Array<{ type: string, value: number, value_vs_cdi: number }>);
    const totalSum = categoriesArray.reduce((acc, curr) => acc + curr.value, 0);

    return {
      type: 'object',
      value: {
        // @ts-ignore
        assets: performanceResult.value.assets,
        categories: categoriesArray,
        total_sum: Number(totalSum.toFixed(2))
      }
    };
  }
};