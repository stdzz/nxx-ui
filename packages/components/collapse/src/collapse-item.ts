import { buildProps, definePropType, generateId } from '@element-plus/utils'
import type { ExtractPropTypes } from 'vue'
import type { CollapseActiveName } from './collapse'

export const collapseItemProps = buildProps({
  title: {
    type: String,
    default: '',
  },
  effect: {
    type: String,
    values: ['dark', 'light', 'plain'],
    default: 'light',
  },
  name: {
    type: definePropType<CollapseActiveName>([String, Number]),
    default: () => generateId(),
  },
  disabled: Boolean,
} as const)
export type CollapseItemProps = ExtractPropTypes<typeof collapseItemProps>
