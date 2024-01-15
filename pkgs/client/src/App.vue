<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import {
  VApp,
  VAppBar,
  VAppBarNavIcon,
  VBtn,
  VList,
  VListItem,
  VMain,
  VNavigationDrawer,
  VSpacer,
  VToolbarTitle
} from 'vuetify/components'

import { service } from '@/stores/service'

const { connect, disconnect, version } = service

const drawer = ref(false)

onMounted(() => {
  connect()
})
</script>

<template>
  <v-app>
    <v-app-bar order="1">
      <v-app-bar-nav-icon icon="mdi-menu" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>maa-z</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn v-if="version" @click="disconnect"> 已连接 - {{ version }} </v-btn>
      <v-btn v-else @click="connect"> 未连接 </v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer">
      <v-list>
        <v-list-item link to="/debug/callback" title="Debug callback"></v-list-item>
        <v-list-item link to="/debug/resource" title="Debug resource"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>
