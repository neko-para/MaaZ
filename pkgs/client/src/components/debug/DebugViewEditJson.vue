<script setup lang="ts">
import { onMounted } from 'vue'
import { ref } from 'vue'
import { nextTick } from 'vue'
import { onUnmounted } from 'vue'
import { shallowRef } from 'vue'
import { watch } from 'vue'

import { type MonacoEditor, setupMonaco } from '@/plugins/monaco'
import { format } from '@/plugins/prettier'

const props = defineProps<{
  readonly?: boolean
  json: string
}>()

const emits = defineEmits<{
  'update:json': [string]
  blur: [string]
}>()

const editorEl = ref<HTMLDivElement | null>(null)
const editor = shallowRef<MonacoEditor | null>(null)

watch(
  () => props.readonly,
  v => {
    editor.value?.updateOptions({
      readOnly: v
    })
  }
)

onMounted(() => {
  nextTick(async () => {
    let code = props.json
    try {
      code = await format(props.json)
    } catch (_) {}
    editor.value = setupMonaco(editorEl.value!, code, !!props.readonly)
    editor.value.onDidBlurEditorText(() => {
      const code = editor.value?.getModel()?.getValue() ?? ''
      emits('blur', code)
    })
    editor.value.onDidChangeModelContent(e => {
      const code = editor.value?.getModel()?.getValue() ?? ''
      emits('update:json', code)
    })
  })
})

onUnmounted(() => {
  editor.value?.dispose()
})
</script>

<template>
  <div ref="editorEl" class="h-80"></div>
</template>
