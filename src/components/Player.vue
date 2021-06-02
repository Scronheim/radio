<template>
  <v-row>
    <v-col cols="1" align-self="center">
      <v-btn icon @click="togglePlay">
        <v-icon v-if="player.isPlaying">mdi-pause</v-icon>
        <v-icon v-else>mdi-play</v-icon>
      </v-btn>
      <audio id="player" controls style="display: none">
        <source :src="$store.getters.currentStation.src">
      </audio>
    </v-col>
    <v-col align-self="center">
      <marquee scrolldelay="45" truespeed style="font-size: 20px">
            {{ currentlyPlaying }}
      </marquee>
    </v-col>
    <v-col cols="2" align-self="center">
      <v-slider
          v-model="volume"
          thumb-color="success"
          thumb-label
          :prepend-icon="volume === 0 ? 'mdi-volume-off': 'mdi-volume-high'"
          @click:prepend="toggleMute"
          @input="changeVolume"/>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Player',
  mounted() {
    this.player.element = document.getElementById('player')
    this.volume = this.player.element.volume*100
  },
  watch: {
    '$store.getters.currentStation'(newStation, oldStation) {
      if (newStation !== oldStation) {
        this.playStation()
      }
    }
  },
  computed: {
    currentlyPlaying() {
      if (this.player.isPlaying) {
        return `${this.$store.getters.currentStation.current_song}`
      }
      return 'Paused'
    }
  },
  data: () => ({
    player: {
      element: HTMLElement,
      isPlaying: false,
    },
    volume: 0,
    timer: null,
  }),
  methods: {
    playStation() {
      if (this.player.isPlaying) {
        this.player.element.pause()
        this.player.isPlaying = false
      }
      this.player.isPlaying = false
      this.$store.dispatch('getCurrentSong', this.$store.getters.currentStation)
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        this.$store.dispatch('getCurrentSong', this.$store.getters.currentStation)
      }, 5000)
      this.player.element.load()
      this.player.element.play().then(() => {
        this.player.isPlaying = true
      })
    },
    togglePlay() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      if (this.player.isPlaying) {
        this.player.element.pause()
        this.player.isPlaying = false
      } else {
        this.timer = setInterval(() => {
          this.$store.dispatch('getCurrentSong', this.$store.getters.currentStation)
        }, 5000)
        this.player.element.play()
        this.player.isPlaying = true
      }
    },
    changeVolume(value) {
      this.player.element.volume = value/100
    },
    toggleMute() {
      if (this.volume === 0) {
        this.volume = 100
        this.player.element.volume = 1
      } else {
        this.volume = 0
        this.player.element.volume = 0
      }
    }
  }
}
</script>

<style lang="scss">

</style>
