import { computed, watch } from 'vue'
import { createI18n, useI18n } from 'vue-i18n'

import en from './locales/en.json'
import zh_CN from './locales/zh_CN.json'

const messages = {
  en,
  zh_CN
}

export type Locale = keyof typeof messages

export const i18n = createI18n<typeof en, Locale, false>({
  legacy: false,
  locale: 'zh_CN',
  fallbackLocale: 'zh_CN'
})

export function useTr() {
  return useI18n<{ message: typeof en }, Locale>({
    inheritLocale: true,
    useScope: 'local',
    messages
  })
}

export function setupLocale() {
  const locale = computed<Locale>(() => {
    return 'zh_CN'
  })

  watch(
    locale,
    v => {
      i18n.global.locale.value = v
    },
    {
      immediate: true
    }
  )
}
