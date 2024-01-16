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

import { docker } from '@/stores/docker'
import { service } from '@/stores/service'

const { connect, disconnect, version } = service

const { cards, onShow, del } = docker

const showDrawer = ref(false)
const showDocker = ref(false)

onMounted(() => {
  onShow(() => {
    showDocker.value = true
  })
  connect()
})
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-nav-icon
        icon="mdi-menu"
        @click.stop="showDrawer = !showDrawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>maa-z</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="version" @click="disconnect"> 已连接 - {{ version }} </v-btn>
      <v-btn v-else @click="connect"> 未连接 </v-btn>
      <v-app-bar-nav-icon
        icon="mdi-menu"
        @click.stop="showDocker = !showDocker"
      ></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="showDrawer">
      <v-list>
        <v-list-item link to="/debug/callback" title="Debug callback"></v-list-item>
        <v-list-item link to="/debug/resource" title="Debug resource"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="showDocker" right location="right" width="1200">
      <div class="flex flex-col gap-2 p-2">
        <component v-for="card in cards" :key="card.id" :is="card.component" v-bind="card.props">
          <template v-slot:close>
            <v-btn variant="text" icon="mdi-close" size="small" @click="del(card.id)"></v-btn>
          </template>
        </component>
      </div>
    </v-navigation-drawer>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>
