<template>
  <table
    role="grid"
    :aria-label="t('el.datepicker.yearTablePrompt')"
    :class="[ns.b(), ms.b(), ms.b('range')]"
    @click="handleYearTableClick"
    @mousemove="handleMouseMove"
  >
    <tbody ref="tbodyRef">
      <tr v-for="(_, i) in 3" :key="i">
        <template v-for="(__, j) in 4" :key="i + '_' + j">
          <td
            v-if="i * 4 + j < 12"
            :ref="
              (el) =>
                isSelectedCell(startYear + i * 4 + j) && (currentCellRef = el as HTMLElement)
            "
            class="available"
            :class="getCellKls(startYear + i * 4 + j)"
            :aria-selected="`${isSelectedCell(startYear + i * 4 + j)}`"
            :tabindex="isSelectedCell(startYear + i * 4 + j) ? 0 : -1"
            @keydown.space.prevent.stop="handleYearTableClick"
            @keydown.enter.prevent.stop="handleYearTableClick"
          >
          <div>
            <span class="cell" :style="[isSelectedCell(startYear + i * 4 + j) ? {} : formatterStyle(customStyle, ['text'])]">{{ startYear + i * 4 + j }}</span>
          </div>
          </td>
          <td v-else />
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch, inject } from 'vue'
import dayjs from 'dayjs'
import { useLocale, useNamespace } from '@element-plus/hooks'
import { rangeArr } from '@element-plus/components/time-picker'
import { castArray, hasClass } from '@element-plus/utils'
import { basicYearTableRangeProps } from '../props/basic-year-table'
import { formatterStyle } from '@element-plus/utils'
import type { CustomStyle } from '@element-plus/utils'

const datesInYear = (year: number, lang: string) => {
  const firstDay = dayjs(String(year)).locale(lang).startOf('year')
  const lastDay = firstDay.endOf('year')
  const numOfDays = lastDay.dayOfYear()
  return rangeArr(numOfDays).map((n) => firstDay.add(n, 'day').toDate())
}

const props = defineProps(basicYearTableRangeProps)
const emit = defineEmits(['pick', 'select', 'changerange'])

const ns = useNamespace('year-table')
const ms = useNamespace('month-table')
const customStyle = inject('$custom-style-filter', {}) as CustomStyle

const { t, lang } = useLocale()
const tbodyRef = ref<HTMLElement>()
const currentCellRef = ref<HTMLElement>()
const startYear = computed(() => {
  return props.startDate.year()
})

const focus = () => {
  currentCellRef.value?.focus()
}

const lastRow = ref<number>()
const lastColumn = ref<number>()

const handleMouseMove = (event: MouseEvent) => {
  if (!props.rangeState.selecting) return

  let target = event.target as HTMLElement
  if (target.tagName === 'A') {
    target = target.parentNode?.parentNode as HTMLElement
  }
  if (target.tagName === 'DIV') {
    target = target.parentNode as HTMLElement
  }
  if (target.tagName !== 'TD') return

  const row = (target.parentNode as HTMLTableRowElement).rowIndex
  const column = (target as HTMLTableCellElement).cellIndex

  // // can not select disabled date
  // if (rows.value[row][column].disabled) return

  // // only update rangeState when mouse moves to a new cell
  // // this avoids frequent Date object creation and improves performance
  if (row !== lastRow.value || column !== lastColumn.value) {
    lastRow.value = row
    lastColumn.value = column

    emit('changerange', {
      selecting: true,
      endDate: props.startDate.year(props.startDate.year() + row * 4 + column),
    })
  }
}


const getCellKls = (year: number) => {
  const kls: Record<string, boolean> = {}
  const today = dayjs().locale(lang.value)

  kls.disabled = props.disabledDate
    ? datesInYear(year, lang.value).every(props.disabledDate)
    : false

  kls.current =
    castArray(props.parsedValue).findIndex((d) => d!.year() === year) >= 0

  kls.today = today.year() === year

  let end = props.maxDate?.year() || 0
  const start = props.minDate?.year() || 0

  if (!end) {
    end = props.rangeState.endDate?.year() || 0
  }

  if (year >= +start && year <= +end) {
    kls['in-range'] = true
    if (+start === +year) {
      kls['start-date'] = true
    }

    if (+end === +year) {
      kls['end-date'] = true
    }
  }
  
  
  return kls
}

const isSelectedCell = (year: number) => {
  return (
    (year === startYear.value &&
      props.date.year() < startYear.value &&
      props.date.year() > startYear.value + 9) ||
    castArray(props.date).findIndex((date) => date.year() === year) >= 0
  )
}

const handleYearTableClick = (event: MouseEvent | KeyboardEvent) => {
  const clickTarget = event.target as HTMLDivElement
  const target = clickTarget.closest('td')
  if (target && target.textContent) {
    if (hasClass(target, 'disabled')) return
    const year = target.textContent || target.innerText
    const newDate = dayjs(String(year)).locale(lang.value)
    if (!props.rangeState.selecting) {
      emit('pick', { minDate: newDate, maxDate: null })
      emit('select', true)
    } else {
      if (props.minDate && newDate >= props.minDate) {
        emit('pick', { minDate: props.minDate, maxDate: newDate })
      } else {
        emit('pick', { minDate: newDate, maxDate: props.minDate })
      }
      emit('select', false)
    }
  }
}

watch(
  () => props.date,
  async () => {
    if (tbodyRef.value?.contains(document.activeElement)) {
      await nextTick()
      currentCellRef.value?.focus()
    }
  }
)

defineExpose({
  /**
   * @description focus on the current cell
   */
  focus,
})
</script>
