<template>
  <li
    :aria-selected="selected"
    :style="style"
    :class="[
      ns.be('dropdown', 'option-item'),
      ns.is('selected', selected),
      ns.is('disabled', disabled),
      ns.is('created', created),
      { hover: hovering },
    ]"
    @mouseenter="hoverItem"
    @click.stop="() => { item.checked = !item.checked;onSelectCheckbox(index)}"
  >
    <slot :item="item" :index="index" :disabled="disabled">
      <el-checkbox @click.stop @change="onSelectCheckbox(index)" v-model="item.checked" :label="item.label"/>
    </slot>
  </li>
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent } from 'vue'
import { useNamespace } from '@element-plus/hooks'
import { useOption } from './useOption'
import { OptionProps } from './defaults'
import {
  ElCheckbox,
} from '@element-plus/components/checkbox'
export default defineComponent({
  props: OptionProps,
  components: {
    ElCheckbox
  },
  emits: ['select', 'hover'],
  setup(props, { emit }) {
    const ns = useNamespace('select')
    const onSelectCheckbox = (index: number) => {
      emit('select', index)
    }
    const { hoverItem, selectOptionClick } = useOption(props, { emit })
    return {
      ns,
      hoverItem,
      onSelectCheckbox,
      selectOptionClick,
    }
  },
})
</script>
