<template>
  <span
    v-if="disableTransitions"
    :class="classes"
    :style="{ backgroundColor: color }"
    @click="handleClick"
  >
    <span :class="ns.e('content')" :style="formatterStyle(customStyle, ['text'])">
      <slot />
    </span>
    <el-icon v-if="closable" :class="ns.e('close')" @click.stop="handleClose">
      <Close />
    </el-icon>
  </span>
  <transition v-else :name="`${ns.namespace.value}-zoom-in-center`" appear>
    <span
      :class="classes"
      :style="{ backgroundColor: color }"
      @click="handleClick"
    >
      <span :class="ns.e('content')">
        <slot />
      </span>
      <el-icon v-if="closable" :class="ns.e('close')" @click.stop="handleClose">
        <Close />
      </el-icon>
    </span>
  </transition>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import ElIcon from '@element-plus/components/icon'
import { Close } from '@element-plus/icons-vue'
import { formatterStyle } from '@element-plus/utils'
import type { CustomStyle } from '@element-plus/utils'
import { useNamespace, useSize } from '@element-plus/hooks'
import { tagEmits, tagProps } from './tag'

defineOptions({
  name: 'ElTag',
})
const props = defineProps(tagProps)
const emit = defineEmits(tagEmits)

const tagSize = useSize()
const ns = useNamespace('tag')
const classes = computed(() => {
  const { type, hit, effect, closable, round } = props
  return [
    ns.b(),
    ns.is('closable', closable),
    ns.m(type),
    ns.m(tagSize.value),
    ns.m(effect),
    ns.is('hit', hit),
    ns.is('round', round),
  ]
})
const customStyle = inject('$custom-style-filter', {}) as CustomStyle

// methods
const handleClose = (event: MouseEvent) => {
  emit('close', event)
}

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>
