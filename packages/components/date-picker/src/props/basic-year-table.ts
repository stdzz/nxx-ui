import { buildProps } from '@element-plus/utils'
import { datePickerSharedProps, datePickerSharedPropsYear } from './shared'

import type { ExtractPropTypes } from 'vue'

const { date, disabledDate, parsedValue } = datePickerSharedProps
const { startDate, rangeState, minDate, maxDate } = datePickerSharedPropsYear
export const basicYearTableProps = buildProps({
  date,
  disabledDate,
  parsedValue,
})

export const basicYearTableRangeProps = buildProps({
  date,
  startDate,
  disabledDate,
  parsedValue,
  rangeState,
  minDate,
  maxDate
})

export type BasicYearTableProps = ExtractPropTypes<typeof basicYearTableProps>
