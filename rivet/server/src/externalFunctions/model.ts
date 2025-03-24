import { ExternalFunctionProcessContext, DataValue } from '@ironclad/rivet-node'
import { parse } from 'csv-parse/sync'
import { regressionParams } from './utils/params'

interface DataObject {
  date: string
  csv: string
}

interface DeltaInput {
  ipca_delta_mean_last_3: number
  selic_delta_mean_last_3: number
  cambio_delta_mean_last_3: number
}

export const modelExternalFunctions: Record<
  string,
  (context: ExternalFunctionProcessContext, ...args: unknown[]) => Promise<DataValue & { cost?: number }>
> = {
  calculateParamsDelta: async (_context, args) => {
    const data = args as string[]
    const dataObjects: DataObject[] = data.map(itemString => {
      return JSON.parse(itemString) as DataObject
    })
    const sortedData = dataObjects.sort((a, b) => a.date.localeCompare(b.date))
    const parseCsv = (csv: string) => {
      return parse(csv, { columns: true, skip_empty_lines: true }) as Record<string, string>[]
    }
    const means = sortedData.slice(0, 4).map(obj => {
      const rows = parseCsv(obj.csv)
      const values: Record<string, number> = {}
      rows.forEach(row => {
        values[row.type.trim()] = parseFloat(row.value)
      })
      return values
    })
    const rollingMean = (start: number) => {
      const window = means.slice(start, start + 3)
      const totals = window.reduce((acc, val) => {
        Object.keys(val).forEach(key => {
          acc[key] = (acc[key] || 0) + val[key]
        })
        return acc
      }, {} as Record<string, number>)
      const result: Record<string, number> = {}
      Object.keys(totals).forEach(key => {
        result[key] = totals[key] / 3
      })
      return result
    }
    const mean0 = rollingMean(0)
    const mean1 = rollingMean(1)
    return {
      type: 'object',
      value: {
        ipca_delta_mean_last_3: mean1['ipca'] - mean0['ipca'],
        selic_delta_mean_last_3: mean1['selic'] - mean0['selic'],
        cambio_delta_mean_last_3: mean1['cambio'] - mean0['cambio']
      }
    }
  },
  calcProfileDelta: async (_context, args) => {
    const { ipca_delta_mean_last_3, selic_delta_mean_last_3, cambio_delta_mean_last_3 } = args as DeltaInput
    const result: Record<string, Record<string, number>> = {}
    for (const profileKey of Object.keys(regressionParams)) {
      const profileAssetMap = regressionParams[profileKey]
      result[profileKey] = {}
      for (const assetKey of Object.keys(profileAssetMap)) {
        const {
          ipca_delta_mean_last_3: ipcaCoeff,
          selic_delta_mean_last_3: selicCoeff,
          cambio_delta_mean_last_3: cambioCoeff,
          intercept
        } = profileAssetMap[assetKey]
        const change =
          intercept +
          ipcaCoeff * ipca_delta_mean_last_3 +
          selicCoeff * selic_delta_mean_last_3 +
          cambioCoeff * cambio_delta_mean_last_3
        result[profileKey][assetKey] = change
      }
    }
    return {
      type: 'object',
      value: result
    }
  },
  calculateDelta: async (context, args) => {
    console.log("Calculating Delta")
    const deltaParams = await modelExternalFunctions.calculateParamsDelta(context, args)
    const finalProfileDelta = await modelExternalFunctions.calcProfileDelta(context, deltaParams.value)
    return finalProfileDelta
  }
}