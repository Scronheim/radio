<template>
  <v-row>
    <v-col cols="1" align-self="center">
      <v-btn icon @click="play(!$store.getters.isPlaying)">
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
                v-model="volume"
                thumb-color="success"
                thumb-label
                :prepend-icon="volume === 0 ? 'mdi-volume-off': 'mdi-volume-high'"
                @click:prepend="toggleMute"
                @change="changeVolume"/>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Player',
  mounted() {
    this.player.element = document.getElementById('player')
    if (localStorage.getItem('volume')) {
      this.volume = parseFloat(localStorage.getItem('volume')*100)
    } else {
      this.player.element.volume = 50
      this.volume = this.player.element.volume
    }
  },
  watch: {
    '$store.state.currentStation'() {
      this.play(true)
    },
    '$store.state.isPlaying'(value) {
      this.play(value)
    },
  },
  data: () => ({
    player: {
      element: HTMLElement,
    },
    volume: 10,
    timer: null,
  }),
  methods: {
    play(isPlaying) {
      if (this.timer) {
        clearInterval(this.timer)
      }
      if (isPlaying) {
        this.$store.commit('setPlaying', {state: true, station: this.$store.getters.currentStation})
        this.$store.commit('setCurrentSong', '')
        this.timer = setInterval(() => {
          this.$store.dispatch('getCurrentSong', this.$store.getters.currentStation)
        }, 5000)
        this.player.element.load()
        this.player.element.play()
      } else {
        this.$store.commit('setPlaying', {state: false})
        this.$store.commit('setCurrentSong', 'Paused')
        this.player.element.pause()
      }
    },
    changeVolume(value) {
      this.player.element.volume = value / 100
      localStorage.setItem('volume', value / 100)
    },
    toggleMute() {
      if (this.volume === 0) {
        this.volume = 100
        this.player.element.volume = 1
      } else {
        this.volume = 0
        this.player.element.volume = 0
      }
      localStorage.setItem('volume', this.player.element.volume)
    }
  }
}
</script>

<style lang="scss">

</style>
