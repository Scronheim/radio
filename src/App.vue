<template>
  <v-app>
    <v-titlebar :theme="titleBar.theme" :platform="titleBar.platform" :on-close="close" :on-maximize="toggleMaximize"
                :on-minimize="minimize">
      <template slot="icon">
        <v-img width="30" height="25" contain src="/icon512.png" alt="icon" />
      </template>

      <template slot="title">
        {{ $store.getters.appName }} v{{ $store.getters.version }}
      </template>
    </v-titlebar>
    <v-main>
      <router-view/>
      <v-dialog v-model="downloadDialog" width="70%" persistent>
        <v-card>
          <v-card-title>{{ $t('texts.updating') }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col>
                <v-progress-linear :value="progress.percent" height="25">
                  <template v-slot:default="{ value }">
                    <strong>{{ transferredInMb }}/{{ totalInMb }} MB ({{ Math.ceil(value) }}%)</strong>
                  </template>
                </v-progress-linear>
                <p>{{ $t('texts.downloadSpeed') }}: {{ downloadSpeedInMb }} mb/s</p>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions v-if="showRestartButton">
            <v-spacer/>
            <v-btn color="success" @click="restartApp">{{ $t('texts.restartApp') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
    <v-footer fixed>
      <player/>
    </v-footer>
  </v-app>
</template>

<script>
import { ipcRenderer, remote } from 'electron'
import Player from '@/components/Player'
export default {
  name: 'App',
  components: {Player},
  mounted() {
    this.$vuetify.theme.dark = true
    this.checkUpdates()
    this.$store.dispatch('refresh').then(() => {
      if (this.$store.getters.settings.theme !== 'dark') {
        this.$vuetify.theme.dark = false
      }
    })
    this.$store.commit('setWebSocket')
  },
  computed: {
    totalInMb() {
      return parseFloat(this.progress.total / 1024 / 1024).toFixed(2)
    },
    transferredInMb() {
      return parseFloat(this.progress.transferred / 1024 / 1024).toFixed(2)
    },
    downloadSpeedInMb() {
      return parseFloat(this.progress.bytesPerSecond / 1024 / 1024).toFixed(2)
    }
  },
  data: () => ({
    downloadDialog: false,
    showRestartButton: false,
    titleBar: {
      theme: 'dark',
      platform: process.platform,
      isMaximizable: remote.getCurrentWindow().isMaximizable(),
      isMinimizable: remote.getCurrentWindow().isMinimizable(),
      isClosable: remote.getCurrentWindow().isClosable(),
    },
    progress: {
      bytesPerSecond: '',
      percent: 0,
      transferred: '',
      total: ''
    }
  }),
  methods: {
    checkUpdates() {
      ipcRenderer.on('update_not_available', () => {
        this.$toast.info(this.$t('texts.updateNotAvailable'))
      })

      ipcRenderer.on('update_available', () => {
        this.$toast.info(this.$t('texts.updateAvailable'))
        this.downloadDialog = true
      })

      ipcRenderer.on('download-progress', (ev, progress) => {
        this.progress = Object.assign({}, progress)
      })

      ipcRenderer.on('update_downloaded', () => {
        this.showRestartButton = true
      })
    },
    restartApp() {
      ipcRenderer.send('restart_app')
    },
    close() {
      remote.getCurrentWindow().close()
    },
    toggleMaximize() {
      let win = remote.getCurrentWindow()
      if (win.isMaximized())
        win.unmaximize()
      else
        win.maximize()
    },
    minimize() {
      remote.getCurrentWindow().minimize()
    }
  }
};
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
