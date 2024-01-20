<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { VTextarea } from 'vuetify/components'

const props = defineProps<{
  json: string
}>()

const emits = defineEmits<{
  'update:json': [string]
}>()

const editing = ref(false)

const error = computed(() => {
  try {
    JSON.parse(props.json)
    return false
  } catch (_) {
    return true
  }
})

function update() {
  try {
    emits('update:json', JSON.stringify(JSON.parse(props.json), null, 2))
  } catch (_) {}
  editing.value = false
}

function acceptTab(e: KeyboardEvent) {
  if (e.key == 'Tab' && e.target) {
    const el = e.target as HTMLTextAreaElement
    const val = el.value
    const start = el.selectionStart
    const end = el.selectionEnd

    el.value = val.substring(0, start) + '\t' + val.substring(end)

    el.selectionStart = el.selectionEnd = start + 1

    e.preventDefault()
  }
}
</script>

<template>
  <highlightjs v-if="!editing" @click="editing = true" language="json" :code="json"></highlightjs>
  <v-textarea
    v-else
    variant="solo"
    auto-grow
    autofocus
    :error-messages="error ? 'syntax error' : undefined"
    hide-details="auto"
    :model-value="json"
    @update:model-value="(v: string) => emits('update:json', v)"
    @blur="update"
    @keydown="acceptTab"
  ></v-textarea>
</template>
