import { isArray, isObject, isString } from '@vue/shared'
import { isNil } from 'lodash-unified'

export {
  isArray,
  isFunction,
  isObject,
  isString,
  isDate,
  isPromise,
  isSymbol,
} from '@vue/shared'
export { isBoolean, isNumber } from '@vueuse/core'
export { isVNode } from 'vue'

export const isUndefined = (val: any): val is undefined => val === undefined

export interface CustomStyle {
  background: string
  border: string
  text: string
}

export type StyleMap = 'backgroundColor' | 'borderColor' | 'color'

const CustomStyleMap: CustomStyle = {
  background: 'backgroundColor' as StyleMap,
  border: 'borderColor' as StyleMap,
  text: 'color' as StyleMap,
}
export const formatterStyle = (obj: CustomStyle, arr: (keyof CustomStyle)[]) => {
  const normalStyle: { [T in StyleMap]? : string }  = {} 
  arr.forEach(ele => {
    if (obj[ele]) {
      normalStyle[CustomStyleMap[ele] as StyleMap] = obj[ele]
    }
  });
  return normalStyle
}


export const isEmpty = (val: unknown) =>
  (!val && val !== 0) ||
  (isArray(val) && val.length === 0) ||
  (isObject(val) && !Object.keys(val).length)

export const isElement = (e: unknown): e is Element => {
  if (typeof Element === 'undefined') return false
  return e instanceof Element
}

export const isPropAbsent = (prop: unknown): prop is null | undefined => {
  return isNil(prop)
}

export const isStringNumber = (val: string): boolean => {
  if (!isString(val)) {
    return false
  }
  return !Number.isNaN(Number(val))
}
