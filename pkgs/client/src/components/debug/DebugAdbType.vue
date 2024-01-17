<script setup lang="ts">
import { AdbType } from '@maaz/maa'
import { VCard, VRadio, VRadioGroup } from 'vuetify/components'

defineProps<{
  type: AdbType
  readonly?: boolean
}>()

const emits = defineEmits<{
  'update:type': [AdbType]
}>()
</script>

<template>
  <v-card>
    <div class="flex gap-2">
      <v-radio-group
        :model-value="type & AdbType.Touch_Mask"
        @update:model-value="
          v => {
            emits('update:type', (type & ~AdbType.Touch_Mask) | (v ?? 0))
          }
        "
        :readonly="readonly"
        hide-details
        density="compact"
      >
        <v-radio label="Adb" :value="AdbType.Touch_Adb"></v-radio>
        <v-radio label="MiniTouch" :value="AdbType.Touch_MiniTouch"></v-radio>
        <v-radio label="MaaTouch" :value="AdbType.Touch_MaaTouch"></v-radio>
      </v-radio-group>
      <v-radio-group
        :model-value="type & AdbType.Key_Mask"
        @update:model-value="
          v => {
            emits('update:type', (type & ~AdbType.Key_Mask) | (v ?? 0))
          }
        "
        :readonly="readonly"
        hide-details
        density="compact"
      >
        <v-radio label="Adb" :value="AdbType.Key_Adb"></v-radio>
        <v-radio label="MaaTouch" :value="AdbType.Key_MaaTouch"></v-radio>
      </v-radio-group>
      <v-radio-group
        :model-value="type & AdbType.Screencap_Mask"
        @update:model-value="
          v => {
            emits('update:type', (type & ~AdbType.Screencap_Mask) | (v ?? 0))
          }
        "
        :readonly="readonly"
        hide-details
        density="compact"
      >
        <v-radio label="FastestWay" :value="AdbType.Screencap_FastestWay"></v-radio>
        <v-radio label="RawByNetcat" :value="AdbType.Screencap_RawByNetcat"></v-radio>
        <v-radio label="RawWithGzip" :value="AdbType.Screencap_RawWithGzip"></v-radio>
        <v-radio label="Encode" :value="AdbType.Screencap_Encode"></v-radio>
        <v-radio label="EncodeToFile" :value="AdbType.Screencap_EncodeToFile"></v-radio>
        <v-radio label="MinicapDirect" :value="AdbType.Screencap_MinicapDirect"></v-radio>
        <v-radio label="MinicapStream" :value="AdbType.Screencap_MinicapStream"></v-radio>
      </v-radio-group>
    </div>
  </v-card>
</template>
