<template>
  <v-app>
    <v-main>
      <router-view/>
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
  methods: {
    checkUpdates() {
      ipcRenderer.on('update_available', () => {
        ipcRenderer.removeAllListeners('update_available')
        this.$toast.info(this.$t('texts.updateAvailable'))
      })

      ipcRenderer.on('download-progress', (progress) => {
        ipcRenderer.removeAllListeners('download-progress')
        this.$toast.info(this.$t('texts.download', {
          downloadSpeed: progress.bytesPerSecond,
          downloaded: progress.percent,
          transferred: progress.transferred,
          total: progress.total
        }), {timeout: 0})
      })

      // ipcRenderer.on('update_downloaded', () => {
      //   ipcRenderer.removeAllListeners('update_downloaded')
      //   this.$toast.info(this.$t('texts.updateDownloaded'))
      //   setTimeout(() => {
      //     ipcRenderer.send('restart_app')
      //   }, 3000)
      // })
    },
  }
};
</script>

<style>

</style>
