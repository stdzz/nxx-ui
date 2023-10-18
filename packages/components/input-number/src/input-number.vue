<template>
  <div
    :class="[
      ns.b(),
      ns.m(inputNumberSize),
      ns.m(effect),
      ns.is('disabled', inputNumberDisabled),
      ns.is('without-controls', !controls),
      ns.is('controls-right', controlsAtRight),
    ]"
    @dragstart.prevent
  >
    <span
      v-if="controls"
      v-repeat-click="decrease"
      role="button"
      :aria-label="t('el.inputNumber.decrease')"
      :class="[ns.e('decrease'), ns.is('disabled', minDisabled)]"
      @keydown.enter="decrease"
    >
      <el-icon>
        <svg v-if="controlsAtRight"  xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
          <path d="M5.99952 7.93206L10.0654 3.86619C10.163 3.76856 10.3213 3.76856 10.4189 3.86619L10.7725 4.21975C10.8701 4.31738 10.8701 4.47567 10.7725 4.5733L6.35307 8.99272C6.15781 9.18798 5.84122 9.18798 5.64596 8.99272L1.22654 4.5733C1.12891 4.47567 1.12891 4.31738 1.22654 4.21975L1.5801 3.86619C1.67773 3.76856 1.83602 3.76856 1.93365 3.86619L5.99952 7.93206Z"/>
        </svg>
        <minus v-else />
      </el-icon>
    </span>
    <span
      v-if="controls"
      v-repeat-click="increase"
      role="button"
      :aria-label="t('el.inputNumber.increase')"
      :class="[ns.e('increase'), ns.is('disabled', maxDisabled)]"
      @keydown.enter="increase"
    >
      <el-icon>
        <svg v-if="controlsAtRight" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
          <path d="M6.00048 4.06794L1.93462 8.13381C1.83699 8.23144 1.6787 8.23144 1.58107 8.13381L1.22751 7.78025C1.12988 7.68262 1.12988 7.52433 1.22751 7.4267L5.64693 3.00728C5.84219 2.81202 6.15878 2.81202 6.35404 3.00728L10.7735 7.4267C10.8711 7.52433 10.8711 7.68262 10.7735 7.78025L10.4199 8.13381C10.3223 8.23144 10.164 8.23144 10.0663 8.13381L6.00048 4.06794Z"/>
        </svg>
        <plus v-else />
      </el-icon>
    </span>
    <el-input
      :id="id"
      ref="input"
      type="number"
      :step="step"
      :model-value="displayValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="inputNumberDisabled"
      :size="inputNumberSize"
      :max="max"
      :effect="effect"
      :min="min"
      :name="name"
      :label="label"
      :validate-event="false"
      @keydown.up.prevent="increase"
      @keydown.down.prevent="decrease"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
      @change="handleInputChange"
    />
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, onUpdated, reactive, ref, watch } from 'vue'
import { isNil } from 'lodash-unified'
import { ElInput } from '@element-plus/components/input'
import { ElIcon } from '@element-plus/components/icon'
import { vRepeatClick } from '@element-plus/directives'
import {
  useDisabled,
  useFormItem,
  useLocale,
  useNamespace,
  useSize,
} from '@element-plus/hooks'
import { debugWarn, isNumber, isString, isUndefined } from '@element-plus/utils'
import { Minus, Plus } from '@element-plus/icons-vue'
import {
  CHANGE_EVENT,
  INPUT_EVENT,
  UPDATE_MODEL_EVENT,
} from '@element-plus/constants'
import { inputNumberEmits, inputNumberProps } from './input-number'

import type { InputInstance } from '@element-plus/components/input'

defineOptions({
  name: 'ElInputNumber',
})

const props = defineProps(inputNumberProps)
const emit = defineEmits(inputNumberEmits)

const { t } = useLocale()
const ns = useNamespace('input-number')
const input = ref<InputInstance>()

interface Data {
  currentValue: number | null | undefined
  userInput: null | number | string
}
const data = reactive<Data>({
  currentValue: props.modelValue,
  userInput: null,
})

const { formItem } = useFormItem()

const minDisabled = computed(
  () =>
    isNumber(props.modelValue) &&
    ensurePrecision(props.modelValue, -1)! < props.min
)
const maxDisabled = computed(
  () =>
    isNumber(props.modelValue) && ensurePrecision(props.modelValue)! > props.max
)

const numPrecision = computed(() => {
  const stepPrecision = getPrecision(props.step)
  if (!isUndefined(props.precision)) {
    if (stepPrecision > props.precision) {
      debugWarn(
        'InputNumber',
        'precision should not be less than the decimal places of step'
      )
    }
    return props.precision
  } else {
    return Math.max(getPrecision(props.modelValue), stepPrecision)
  }
})
const controlsAtRight = computed(() => {
  return props.controls && props.controlsPosition === 'right'
})

const inputNumberSize = useSize()
const inputNumberDisabled = useDisabled()

const displayValue = computed(() => {
  if (data.userInput !== null) {
    return data.userInput
  }
  let currentValue: number | string | undefined | null = data.currentValue
  if (isNil(currentValue)) return ''
  if (isNumber(currentValue)) {
    if (Number.isNaN(currentValue)) return ''
    if (!isUndefined(props.precision)) {
      currentValue = currentValue.toFixed(props.precision)
    }
  }
  return currentValue
})
const toPrecision = (num: number, pre?: number) => {
  if (isUndefined(pre)) pre = numPrecision.value
  if (pre === 0) return Math.round(num)
  let snum = String(num)
  const pointPos = snum.indexOf('.')
  if (pointPos === -1) return num
  const nums = snum.replace('.', '').split('')
  const datum = nums[pointPos + pre]
  if (!datum) return num
  const length = snum.length
  if (snum.charAt(length - 1) === '5') {
    snum = `${snum.slice(0, Math.max(0, length - 1))}6`
  }
  return Number.parseFloat(Number(snum).toFixed(pre))
}
const getPrecision = (value: number | null | undefined) => {
  if (isNil(value)) return 0
  const valueString = value.toString()
  const dotPosition = valueString.indexOf('.')
  let precision = 0
  if (dotPosition !== -1) {
    precision = valueString.length - dotPosition - 1
  }
  return precision
}
const ensurePrecision = (val: number, coefficient: 1 | -1 = 1) => {
  if (!isNumber(val)) return data.currentValue
  // Solve the accuracy problem of JS decimal calculation by converting the value to integer.
  return toPrecision(val + props.step * coefficient)
}
const increase = () => {
  if (props.readonly || inputNumberDisabled.value || maxDisabled.value) return
  const value = Number(displayValue.value) || 0
  const newVal = ensurePrecision(value)
  setCurrentValue(newVal)
  emit(INPUT_EVENT, data.currentValue)
}
const decrease = () => {
  if (props.readonly || inputNumberDisabled.value || minDisabled.value) return
  const value = Number(displayValue.value) || 0
  const newVal = ensurePrecision(value, -1)
  setCurrentValue(newVal)
  emit(INPUT_EVENT, data.currentValue)
}
const verifyValue = (
  value: number | string | null | undefined,
  update?: boolean
): number | null | undefined => {
  const { max, min, step, precision, stepStrictly, valueOnClear } = props
  let newVal = Number(value)
  if (isNil(value) || Number.isNaN(newVal)) {
    return null
  }
  if (value === '') {
    if (valueOnClear === null) {
      return null
    }
    newVal = isString(valueOnClear) ? { min, max }[valueOnClear] : valueOnClear
  }
  if (stepStrictly) {
    newVal = toPrecision(Math.round(newVal / step) * step, precision)
  }
  if (!isUndefined(precision)) {
    newVal = toPrecision(newVal, precision)
  }
  if (newVal > max || newVal < min) {
    newVal = newVal > max ? max : min
    update && emit(UPDATE_MODEL_EVENT, newVal)
  }
  return newVal
}
const setCurrentValue = (value: number | string | null | undefined) => {
  const oldVal = data.currentValue
  const newVal = verifyValue(value)
  if (oldVal === newVal) return
  data.userInput = null
  emit(UPDATE_MODEL_EVENT, newVal!)
  emit(CHANGE_EVENT, newVal!, oldVal!)
  if (props.validateEvent) {
    formItem?.validate?.('change').catch((err) => debugWarn(err))
  }
  data.currentValue = newVal
}
const handleInput = (value: string) => {
  data.userInput = value
  emit(INPUT_EVENT, value === '' ? null : Number(value))
}
const handleInputChange = (value: string) => {
  const newVal = value !== '' ? Number(value) : ''
  if ((isNumber(newVal) && !Number.isNaN(newVal)) || value === '') {
    setCurrentValue(newVal)
  }
  data.userInput = null
}

const focus = () => {
  input.value?.focus?.()
}

const blur = () => {
  input.value?.blur?.()
}

const handleFocus = (event: MouseEvent | FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: MouseEvent | FocusEvent) => {
  emit('blur', event)
  if (props.validateEvent) {
    formItem?.validate?.('blur').catch((err) => debugWarn(err))
  }
}

watch(
  () => props.modelValue,
  (value) => {
    data.currentValue = verifyValue(value, true)
    data.userInput = null
  },
  { immediate: true }
)
onMounted(() => {
  const { min, max, modelValue } = props
  const innerInput = input.value?.input as HTMLInputElement
  innerInput.setAttribute('role', 'spinbutton')
  if (Number.isFinite(max)) {
    innerInput.setAttribute('aria-valuemax', String(max))
  } else {
    innerInput.removeAttribute('aria-valuemax')
  }
  if (Number.isFinite(min)) {
    innerInput.setAttribute('aria-valuemin', String(min))
  } else {
    innerInput.removeAttribute('aria-valuemin')
  }
  innerInput.setAttribute('aria-valuenow', String(data.currentValue))
  innerInput.setAttribute('aria-disabled', String(inputNumberDisabled.value))
  if (!isNumber(modelValue) && modelValue != null) {
    let val: number | null = Number(modelValue)
    if (Number.isNaN(val)) {
      val = null
    }
    emit(UPDATE_MODEL_EVENT, val!)
  }
})
onUpdated(() => {
  const innerInput = input.value?.input
  innerInput?.setAttribute('aria-valuenow', `${data.currentValue}`)
})
defineExpose({
  /** @description get focus the input component */
  focus,
  /** @description remove focus the input component */
  blur,
})
</script>
