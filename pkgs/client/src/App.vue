<script setup lang="ts">
import { api } from '@maaz/schema'
import { ref } from 'vue'

const version = ref('N/A')

api
  .MaaVersion()
  .then(({ return: ver }) => {
    version.value = ver
  })
  .catch(err => {
    console.error(err)
  })
</script>

<template>
  <div class="flex flex-col">
    <span>111</span>
    <span>222</span>
    <span>333</span>
  </div>
</template>
