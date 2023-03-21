export const componentSizes = ['', 'default', 'small', 'large', 'middle'] as const

export type ComponentSize = typeof componentSizes[number]

export const componentSizeMap = {
  large: 40,
  default: 32,
  middle: 28,
  small: 24,
} as const
