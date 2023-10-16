<template>
  <el-tooltip
    ref="popper"
    :visible="showPicker"
    :show-arrow="false"
    :fallback-placements="['bottom', 'top', 'right', 'left']"
    :offset="0"
    :gpu-acceleration="false"
    :popper-class="[ns.be('picker', 'panel'), ns.b('dropdown'), popperClass]"
    :stop-popper-mouse-event="false"
    :effect="effect"
    trigger="click"
    :transition="`${ns.namespace.value}-zoom-in-top`"
    persistent
  >
    <template #content>
      <div v-click-outside="hide">
        <div :class="ns.be('dropdown', 'main-wrapper')">
          <hue-slider ref="hue" class="hue-slider" :color="color" vertical />
          <sv-panel ref="sv" :color="color" />
        </div>
        <alpha-slider v-if="showAlpha" ref="alpha" :color="color" />
        <predefine
          v-if="predefine"
          ref="predefine"
          :color="color"
          :colors="predefine"
        />
        <div @click.stop :class="ns.be('dropdown', 'btns')">
          <span :class="ns.be('dropdown', 'value')">
            <el-input
              v-model="customInput"
              @keydown.stop
              @keyup.stop
              :validate-event="false"
              size="small"
              @keyup.enter="handleConfirm"
              @blur="customInputChange"
            />
          </span>
          <el-icon @click.stop="getEyeDropper"><EditPen /></el-icon> 
          <el-radio-group  @change="modeChange" v-model="colorMode" size="small">
            <el-radio-button label="HEX" />
            <el-radio-button label="RGB" />
          </el-radio-group>
          <!-- <el-button
            :class="ns.be('dropdown', 'link-btn')"
            text
            size="small"
            @click="clear"
          >
            {{ t('el.colorpicker.clear') }}
          </el-button>
          <el-button
            plain
            size="small"
            :class="ns.be('dropdown', 'btn')"
            @click="confirmValue"
          >
            {{ t('el.colorpicker.confirm') }}
          </el-button> -->
        </div>
      </div>
    </template>
    <template #default>
      <div
        :id="buttonId"
        :class="btnKls"
        role="button"
        :aria-label="buttonAriaLabel"
        :aria-labelledby="buttonAriaLabelledby"
        :aria-description="
          t('el.colorpicker.description', { color: modelValue || '' })
        "
        :tabindex="tabindex"
        @keydown.enter="handleTrigger"
      >
        <div v-if="colorDisabled" :class="ns.be('picker', 'mask')" />
        <div :style="isCustom ? {width: computdTriggerWidth ?  computdTriggerWidth + 'px' : 'auto'} : {}" :class="ns.be('picker', 'trigger')" @click="handleTrigger">
          <span :class="[ns.be('picker', 'color'), ns.is('alpha', showAlpha), showBorder && 'show-border']">
            <span
              :class="ns.be('picker', 'color-inner')"
              :style="{
                backgroundColor: displayedColor,
              }"
            >
              <el-icon
                :style="isCustom ? { marginLeft: computdTriggerWidth ? computdTriggeIconWidth + 'px' : 'auto' } : {}"
                v-show="modelValue || showPanelColor"
                :class="[ns.be('picker', 'icon'), ns.is('icon-arrow-down')]"
              >
                <arrow-down />
              </el-icon>
              <el-icon
                v-if="!modelValue && !showPanelColor"
                :class="[ns.be('picker', 'empty'), ns.is('icon-close')]"
              >
                <close />
              </el-icon>
            </span>
          </span>
        </div>
      </div>
    </template>
  </el-tooltip>
</template>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
} from 'vue'
import { debounce } from 'lodash-unified'
// import { ElButton } from '@element-plus/components/button'
import { ElRadioGroup} from '@element-plus/components/radio'
import { ElRadioButton } from '@element-plus/components/radio'
import { ElIcon } from '@element-plus/components/icon'
import { ClickOutside as vClickOutside } from '@element-plus/directives'
import { ElTooltip } from '@element-plus/components/tooltip'
import { ElInput } from '@element-plus/components/input'
import {
  useDisabled,
  useFormItem,
  useFormItemInputId,
  useSize,
} from '@element-plus/hooks'
import { useLocale, useNamespace } from '@element-plus/hooks'
import { UPDATE_MODEL_EVENT } from '@element-plus/constants'
import { debugWarn } from '@element-plus/utils'
import { ArrowDown, Close, EditPen } from '@element-plus/icons-vue'
import AlphaSlider from './components/alpha-slider.vue'
import HueSlider from './components/hue-slider.vue'
import Predefine from './components/predefine.vue'
import SvPanel from './components/sv-panel.vue'
import Color from './utils/color'
import {
  colorPickerContextKey,
  colorPickerEmits,
  colorPickerProps,
} from './color-picker'
import type { TooltipInstance } from '@element-plus/components/tooltip'
import { useEyeDropper } from '@vueuse/core'
defineOptions({
  name: 'ElColorPicker',
})
const props = defineProps(colorPickerProps)
const emit = defineEmits(colorPickerEmits)
const { isSupported, open, sRGBHex } = useEyeDropper()
const { t } = useLocale()
const ns = useNamespace('color')
const { formItem } = useFormItem()
const colorSize = useSize()
const colorDisabled = useDisabled()



const { inputId: buttonId, isLabeledByFormItem } = useFormItemInputId(props, {
  formItemContext: formItem,
})

const hue = ref<InstanceType<typeof HueSlider>>()
const sv = ref<InstanceType<typeof SvPanel>>()
const alpha = ref<InstanceType<typeof AlphaSlider>>()
const popper = ref<TooltipInstance>()

// active-change is used to prevent modelValue changes from triggering.
let shouldActiveChange = true

const color = reactive(
  new Color({
    enableAlpha: props.showAlpha,
    format: props.colorFormat || props.modelValue?.startsWith('#') ? 'hex' : 'rgb',
    value: props.modelValue,
  })
) as Color

const showPicker = ref(false)
const showPanelColor = ref(false)
const customInput = ref('')

const displayedColor = computed(() => {
  if (!props.modelValue && !showPanelColor.value) {
    return 'transparent'
  }
  return displayedRgb(color, props.showAlpha)
})

const showBorder = computed(() => {
  return ['rgb(255, 255, 255)', 'rgba(255, 255, 255, 1)', '#FFFFFFFF', '#FFFFFF'].includes(props.modelValue as string)
})

const computdTriggerWidth = computed(() => {
  return colorSize.value === 'large' ? props.triggerWidth + 18 : props.triggerWidth
})

const computdTriggeIconWidth = computed(() => {
  return colorSize.value === 'large' ? computdTriggerWidth.value * 2 - 70 : computdTriggerWidth.value * 2 - 60
})




const getEyeDropper = () => {
  if (!isSupported) return
  open()
}
const colorMode = ref(props.modelValue?.startsWith('#') ? 'HEX' : 'RGB')

const currentColor = computed(() => {
  return !props.modelValue && !showPanelColor.value ? '' : color.value
})

const modeChange = (val: string | number | boolean) => {
  color.format = (val as string).toLowerCase()
  handleConfirm()
  customInput.value = color.value
}

function customInputChange() {
  handleConfirm()
  customInput.value = color.value
  confirmValue()
}

const buttonAriaLabel = computed<string | undefined>(() => {
  return !isLabeledByFormItem.value
    ? props.label || t('el.colorpicker.defaultLabel')
    : undefined
})

const buttonAriaLabelledby = computed<string | undefined>(() => {
  return isLabeledByFormItem.value ? formItem?.labelId : undefined
})

const btnKls = computed(() => {
  return [
    ns.b('picker'),
    ns.is('disabled', colorDisabled.value),
    ns.is('custom', props.isCustom),
    ns.is('effect', props.effect === 'dark'),
    ns.bm('picker', colorSize.value),
  ]
})

function displayedRgb(color: Color, showAlpha: boolean) {
  if (!(color instanceof Color)) {
    throw new TypeError('color should be instance of _color Class')
  }

  const { r, g, b } = color.toRgb()
  return showAlpha
    ? `rgba(${r}, ${g}, ${b}, ${color.get('alpha') / 100})`
    : `rgb(${r}, ${g}, ${b})`
}

function setShowPicker(value: boolean) {
  showPicker.value = value
}

const debounceSetShowPicker = debounce(setShowPicker, 100)

function show() {
  setTimeout(() => {
    if (colorDisabled.value) return
    setShowPicker(true)
  }, 100)
}

function hide() {
  debounceSetShowPicker(false)
  resetColor()
}

function resetColor() {
  nextTick(() => {
    if (props.modelValue) {
      color.fromString(props.modelValue)
    } else {
      color.value = ''
      nextTick(() => {
        showPanelColor.value = false
      })
    }
  })
}

function handleTrigger() {
  if (colorDisabled.value) return
  debounceSetShowPicker(!showPicker.value)
}

function handleConfirm() {
  color.fromString(customInput.value)
}

function confirmValue() {
  const value = color.value
  emit(UPDATE_MODEL_EVENT, value)
  showPicker.value && emit('change', value)
  if (props.validateEvent) {
    formItem?.validate('change').catch((err) => debugWarn(err))
  }
  // debounceSetShowPicker(false)
  // check if modelValue change, if not change, then reset color.
  nextTick(() => {
    const newColor = new Color({
      enableAlpha: props.showAlpha,
      format: props.colorFormat || '',
      value: props.modelValue,
    })
    if (!color.compare(newColor)) {
      resetColor()
    }
  })
}

function clear() {
  debounceSetShowPicker(false)
  emit(UPDATE_MODEL_EVENT, null)
  emit('change', null)
  if (props.modelValue !== null && props.validateEvent) {
    formItem?.validate('change').catch((err) => debugWarn(err))
  }
  resetColor()
}

onMounted(() => {
  if (props.modelValue) {
    customInput.value = currentColor.value
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      showPanelColor.value = false
    } else if (newVal && newVal !== color.value) {
      shouldActiveChange = false
      color.fromString(newVal)
    }
  }
)


watch(sRGBHex, (newValue) => {
  color.fromString(newValue)
  customInput.value = color.value
})

watch(
  () => customInput.value,
  (newValue, oldValue) => {
    if(newValue !== oldValue) {
      confirmValue()
    }
  }
)

watch(
  () => currentColor.value,
  (val) => {
    customInput.value = val
    shouldActiveChange && emit('activeChange', val)
    shouldActiveChange = true
  }
)

watch(
  () => color.value,
  () => {
    if (!props.modelValue && !showPanelColor.value) {
      showPanelColor.value = true
    }
  }
)

watch(
  () => showPicker.value,
  () => {
    nextTick(() => {
      hue.value?.update()
      sv.value?.update()
      alpha.value?.update()
    })
  }
)

provide(colorPickerContextKey, {
  currentColor,
})

defineExpose({
  /**
   * @description current color object
   */
  color,
  /**
   * @description manually show ColorPicker
   */
  show,
  /**
   * @description manually hide ColorPicker
   */
  hide,
})
</script>