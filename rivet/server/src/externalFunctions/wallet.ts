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

    // 'past' is already a CSV string. 'deltas' is a JSON string we must parse.
    const csvString = past
    const deltasObj = JSON.parse(deltas) as Record<string, Record<string, number>>

    // Parse the CSV into rows
    const parsedRows = parse(csvString, { columns: true, skip_empty_lines: true }) as Array<Record<string, string>>
    const columns = Object.keys(parsedRows[0]).filter(k => k !== 'classe')

    // Sum up the original CSV with the corresponding deltas
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

    // Compute total per column so we can normalize each profile to sum to 100
    const sums: Record<string, number> = {}
    columns.forEach(col => {
      sums[col] = updatedRows.reduce((acc, row) => acc + (row[col] as number), 0)
    })

    // Normalize to 100 and round to nearest half
    updatedRows.forEach(row => {
      columns.forEach(col => {
        const val = row[col] as number
        const percent = (val / sums[col]) * 100
        row[col] = roundToHalf(percent)
      })
    })

    // Convert back to CSV
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
  }
}