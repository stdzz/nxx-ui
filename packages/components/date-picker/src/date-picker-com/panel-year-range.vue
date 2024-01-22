<template>
  <div
    :class="[
      ppNs.b(),
      drpNs.b(),
      {
        'has-sidebar': Boolean($slots.sidebar) || hasShortcuts,
      },
    ]"
  >
    <div :class="ppNs.e('body-wrapper')">
      <slot name="sidebar" :class="ppNs.e('sidebar')" />
      <div v-if="hasShortcuts" :class="ppNs.e('sidebar')">
        <button
          v-for="(shortcut, key) in shortcuts"
          :key="key"
          type="button"
          :class="ppNs.e('shortcut')"
          @click="handleShortcutClick(shortcut)"
        >
          {{ shortcut.text }}
        </button>
      </div>
      <div :class="ppNs.e('body')">
        <div :class="[ppNs.e('content'), drpNs.e('content')]" class="is-left">
          <div :class="drpNs.e('header')">
            <button
              type="button"
              :class="ppNs.e('icon-btn')"
              class="d-arrow-left"
              @click="moveByYear(false)"
            >
              <el-icon><d-arrow-left /></el-icon>
            </button>
            <button
              v-if="unlinkPanels"
              type="button"
              :disabled="!enableYearArrow"
              :class="[
                ppNs.e('icon-btn'),
                { [ppNs.is('disabled')]: !enableYearArrow },
              ]"
              class="d-arrow-right"
              @click="leftNextYear"
            >
              <el-icon><d-arrow-right /></el-icon>
            </button>
            <div
              :class="dpNs.e('header-label')"
              :style="[formatterStyle(customStyle, ['text'])]"
              >{{ yearLabel }}</div
            >
          </div>
          <month-table
            selection-mode="range"
            :date="leftDate"
            :startDate="beginDate"
            :min-date="minDate"
            :max-date="maxDate"
            :range-state="rangeState"
            :disabled-date="disabledDate"
            @changerange="handleChangeRange"
            @pick="handleRangePick"
            @select="onSelect"
          />
        </div>
        <div :class="[ppNs.e('content'), drpNs.e('content')]" class="is-right">
          <div :class="drpNs.e('header')">
            <button
              v-if="unlinkPanels"
              type="button"
              :disabled="!enableYearArrow"
              :class="[ppNs.e('icon-btn'), { 'is-disabled': !enableYearArrow }]"
              class="d-arrow-left"
              @click="rightPrevYear"
            >
              <el-icon><d-arrow-left /></el-icon>
            </button>
            <button
              type="button"
              :class="ppNs.e('icon-btn')"
              class="d-arrow-right"
              @click="moveByYear(true)"
            >
              <el-icon><d-arrow-right /></el-icon>
            </button>
            <div
              :class="dpNs.e('header-label')"
              :style="[formatterStyle(customStyle, ['text'])]"
              >{{ yearLabel }}</div
            >
          </div>
          <month-table
            selection-mode="range"
            :date="rightDate"
            :startDate="endDate"
            :min-date="minDate"
            :max-date="maxDate"
            :range-state="rangeState"
            :disabled-date="disabledDate"
            @changerange="handleChangeRange"
            @pick="handleRangePick"
            @select="onSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, toRef } from 'vue'
import dayjs from 'dayjs'
import ElIcon from '@element-plus/components/icon'
import { useLocale, useNamespace } from '@element-plus/hooks'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import {
  panelMonthRangeEmits,
  panelMonthRangeProps,
} from '../props/panel-month-range'
import { useMonthRangeHeader } from '../composables/use-month-range-header'
import { useYearRangePicker } from '../composables/use-range-picker'
import MonthTable from './basic-year-range-table.vue'
import { formatterStyle } from '@element-plus/utils'
import type { CustomStyle } from '@element-plus/utils'
import { isArray } from '@element-plus/utils'

import type { Dayjs } from 'dayjs'

defineOptions({
  name: 'DatePickerMonthRange',
})

const props = defineProps(panelMonthRangeProps)
const emit = defineEmits(panelMonthRangeEmits)
const unit = 'year'
const dpNs = useNamespace('date-picker')

const { lang, t } = useLocale()
const pickerBase = inject('EP_PICKER_BASE') as any
const { shortcuts, disabledDate, format } = pickerBase.props
const defaultValue = toRef(pickerBase.props, 'defaultValue')
const leftDate = ref(dayjs().locale(lang.value))
const rightDate = ref(dayjs().locale(lang.value).add(1, unit))
const customStyle = inject('$custom-style-filter', {}) as CustomStyle

const {
  minDate,
  maxDate,
  rangeState,
  ppNs,
  drpNs,

  handleChangeRange,
  handleRangeConfirm,
  handleShortcutClick,
  onSelect,
} = useYearRangePicker(props, {
  defaultValue,
  leftDate,
  rightDate,
  unit,
  onParsedValueChanged,
})
const hasShortcuts = computed(() => !!shortcuts.length)
const innerDate = ref(dayjs().locale(lang.value))
const beginDate = ref(dayjs().locale(lang.value))
const endDate = ref(dayjs().locale(lang.value))

const year = computed(() => {
  return innerDate.value.year()
})
const yearLabel = computed(() => {
  const yearTranslation = t('el.datepicker.year')
  const startYear = year.value
    if (yearTranslation) {
      return `${startYear} ${yearTranslation} - ${
        startYear + 23
      } ${yearTranslation}`
    }
    return `${startYear} - ${startYear + 23}`
})
const {
  leftNextYear,
  rightPrevYear,
  leftYear,
  rightYear,
} = useMonthRangeHeader({
  unlinkPanels: toRef(props, 'unlinkPanels'),
  leftDate,
  rightDate,
})

const enableYearArrow = computed(() => {
  return props.unlinkPanels && rightYear.value > leftYear.value + 1
})

type RangePickValue = {
  minDate: Dayjs
  maxDate: Dayjs
}

const handleRangePick = (val: RangePickValue, close = true) => {
  // const defaultTime = props.defaultTime || []
  // const minDate_ = modifyWithTimeString(val.minDate, defaultTime[0])
  // const maxDate_ = modifyWithTimeString(val.maxDate, defaultTime[1])
  // todo
  const minDate_ = val.minDate
  const maxDate_ = val.maxDate
  if (maxDate.value === maxDate_ && minDate.value === minDate_) {
    return
  }
  maxDate.value = maxDate_
  minDate.value = minDate_

  if (!close) return
  handleRangeConfirm()
}

const formatToString = (days: Dayjs[] | Dayjs) => {
  if (isArray(days)) {
    return days.map((day) => day.format(format))
  }
  return days.format(format)
}



const moveByYear = (forward: boolean) => {
  const currentDate = innerDate.value
  const action = forward ? 'add' : 'subtract'
  innerDate.value = currentDate[action](24, 'year')
  beginDate.value = innerDate.value.add(0, 'year')
  endDate.value = beginDate.value.add(12, 'year')
}



const setDefaultValue = () => {
  if (props.parsedValue?.[0]) {
    innerDate.value = props.parsedValue[0].clone().subtract(24, 'year')
  } else {
    innerDate.value = innerDate.value.subtract(24, 'year')
  }
  
  moveByYear(true)
}

setDefaultValue()


function onParsedValueChanged(
  minDate: Dayjs | undefined,
  maxDate: Dayjs | undefined
) {
  if (props.unlinkPanels && maxDate) {
    const minDateYear = minDate?.year() || 0
    const maxDateYear = maxDate.year()
    rightDate.value =
      minDateYear === maxDateYear ? maxDate.add(1, unit) : maxDate
  } else {
    rightDate.value = leftDate.value.add(1, unit)
  }
}
const parseUserInput = (days: Dayjs[] | Dayjs) => {
  if (!days) return null
  if (isArray(days)) {
    return days.map((d) => dayjs(d, 'YYYY').locale(lang.value))
  }
  return dayjs(days, 'YYYY').locale(lang.value)
}
const isValidValue = (_date: Dayjs) => {
  const parsedDate = dayjs(_date).locale(lang.value)
  return parsedDate
}


emit('set-picker-option', ['formatToString', formatToString])
emit('set-picker-option', ['parseUserInput', parseUserInput])
emit('set-picker-option', ['isValidValue', isValidValue])
</script>
