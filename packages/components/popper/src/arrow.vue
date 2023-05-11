<template>
  <span ref="arrowRef" :style="formatterStyle(customStyle, ['background', 'border'])" :class="[ns.e('arrow'), background && 'custom-bg', border && 'custom-br' ]" data-popper-arrow="" />
</template>

<script lang="ts" setup>
import { inject, onBeforeUnmount, watch, toRefs } from 'vue'
import { useNamespace } from '@element-plus/hooks'
import { POPPER_CONTENT_INJECTION_KEY } from '@element-plus/tokens'
import { formatterStyle } from '@element-plus/utils'
import { popperArrowProps } from './arrow'
import type { CustomStyle } from '@element-plus/utils'

defineOptions({
  name: 'ElPopperArrow',
  inheritAttrs: false,
})

const props = defineProps(popperArrowProps)

const ns = useNamespace('popper')
const { arrowOffset, arrowRef } = inject(
  POPPER_CONTENT_INJECTION_KEY,
  undefined
)!

watch(
  () => props.arrowOffset,
  (val) => {
    arrowOffset.value = val
  }
)
onBeforeUnmount(() => {
  arrowRef.value = undefined
})

const customStyle = inject('$custom-style-filter', {}) as CustomStyle
const {
  border,
  background,
} = toRefs(customStyle)

defineExpose({
  /**
   * @description Arrow element
   */
  arrowRef,
})
</script>
