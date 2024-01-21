<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import {
  VApp,
  VAppBar,
  VAppBarNavIcon,
  VBtn,
  VCard,
  VDialog,
  VList,
  VListItem,
  VMain,
  VNavigationDrawer,
  VOverlay,
  VSpacer,
  VToolbarTitle
} from 'vuetify/components'

import { service } from '@/stores/service'

const { connect, connecting, disconnect, version } = service

const showDrawer = ref(false)

function gotoGithub() {
  window.open('https://github.com/neko-para/MaaZ', '_blank')
}

onMounted(() => {
  connect()
})
</script>

<template>
  <v-app class="bg-gray-200">
    <v-app-bar>
      <v-app-bar-nav-icon
        icon="mdi-menu"
        @click.stop="showDrawer = !showDrawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>maa-z</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="version" @click="disconnect"> 已连接 - {{ version }} </v-btn>
      <v-btn @click="gotoGithub"> Github </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="showDrawer" temporary>
      <v-list>
        <v-list-item link to="/pack"> 资源包 </v-list-item>
        <v-list-item link to="/debug"> 调试 </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-dialog :model-value="!version" class="w-1/3" persistent>
      <v-card class="p-4">
        <div class="flex justify-center">
          <v-btn @click="connect" :loading="connecting"> 连接 MaaHttp </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>
@/components/debug/docker
