<template>
  <v-app>
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
import { ipcRenderer } from 'electron'
import Player from "@/components/Player"
export default {
  name: 'App',
  components: {Player},
  mounted() {
    this.checkUpdates()
    this.$store.dispatch('refresh').then(() => {
      this.$vuetify.theme.dark = this.$store.getters.settings.theme === 'dark';
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
    }
  }
};
</script>

<style>

</style>
