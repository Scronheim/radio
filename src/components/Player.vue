<template>
  <v-row>
    <v-col cols="1" align-self="center">
      <v-btn icon @click="togglePlay">
        <v-icon v-if="$store.getters.isPlaying">mdi-pause</v-icon>
        <v-icon v-else>mdi-play</v-icon>
      </v-btn>
      <audio id="player" controls style="display: none">
        <source :src="$store.getters.currentStation.src">
      </audio>
    </v-col>
    <v-col align-self="center">
      <marquee scrolldelay="45" truespeed style="font-size: 20px">
        {{ $store.getters.currentSong }}
      </marquee>
    </v-col>
    <v-col cols="2">
      <v-slider height="40"
                :value="$store.getters.settings.volume"
                thumb-color="success"
                thumb-label
                :prepend-icon="$store.getters.settings.volume === 0 ? 'mdi-volume-off': 'mdi-volume-high'"
                @click:prepend="toggleMute"
                @change="changeVolume"/>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Player',
  mounted() {
    this.$store.commit('setPlayer', document.getElementById('player'))
    if (!this.$store.getters.settings.volume) {
      this.$store.commit('setPlayerVolume', 0.5)
    }
  },
  data: () => ({

  }),
  methods: {
    togglePlay() {
      if (this.$store.getters.isPlaying) {
        this.$store.commit('setPlaying', {state: false})
      } else {
        this.$store.commit('setPlaying', {state: true, station: this.$store.getters.currentStation})
      }
    },
    changeVolume(value) {
      this.$store.commit('setPlayerVolume', value / 100)
      this.$store.commit('setVolume', value)
      this.$store.dispatch('saveSettings')
    },
    toggleMute() {
      if (this.$store.getters.settings.volume === 0) {
        this.$store.commit('setPlayerVolume', 1)
      } else {
        this.$store.commit('setPlayerVolume', 0)
      }
      this.$store.commit('setVolume', this.$store.getters.player.element.volume * 100)
      this.$store.dispatch('saveSettings')
    }
  }
}
</script>

<style lang="scss">

</style>
