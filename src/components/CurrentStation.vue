<template>
  <v-card v-if="$store.getters.currentStation.id"
          class="pt-5 mx-auto" flat>
    <v-btn absolute right fab small color="primary" @click="showEditStationDialog">
      <v-icon>
        mdi-pencil
      </v-icon>
    </v-btn>
    <v-card-text>
      <v-img v-if="$store.getters.currentStation.logo_src" :height="200" contain :src="$store.getters.currentStation.logo_src"/>
      <h3 class="text-h5 mb-2">
        {{ $store.getters.currentStation.name }}
      </h3>
      <div id="container">
        <svg id="equalizer">
          <defs>
            <linearGradient id="barBg" gradientTransform="rotate(90)">
              <stop offset="0%" stop-color="#a142f5"/>
              <stop offset="50%" stop-color="#12fdfd"/>
              <stop offset="100%" stop-color="#fff"/>
            </linearGradient>
          </defs>
          <rect
              v-for="(value, i) in bars" :key="i"
              class="bar"
              :width="100 / bars.length + '%'"
              :height="value + '%'"
              :x="i * 100 / bars.length + '%'"
              :y="100 - value + '%'"
          />
        </svg>
      </div>
    </v-card-text>
    <v-divider/>
    <v-row class="text-left" tag="v-card-text">
      <v-col class="text-right" tag="strong" cols="6">
        {{ $t('newRadio.name') }}:
      </v-col>
      <v-col>{{ $store.getters.currentStation.name }}</v-col>
      <v-col class="text-right" tag="strong" cols="6">
        {{ $t('newRadio.currentTrack') }}:
      </v-col>
      <v-col :cols="$store.getters.currentSong === '' ? 1 : 6">
        <clip-loader v-if="$store.getters.currentSong === ''" />
        <template v-else>
          {{ $store.getters.currentSong }}
        </template>
      </v-col>
      <v-col class="text-right" tag="strong" cols="6">
        {{ $t('newRadio.genre') }}:
      </v-col>
      <v-col>{{ $store.getters.currentStation.genre | getGenreText }}</v-col>
      <v-col class="text-right" tag="strong" cols="6">
        {{ $t('newRadio.country') }}:
      </v-col>
      <v-col>{{ $store.getters.currentStation.country }}</v-col>
      <v-col class="text-right" tag="strong" cols="6">
        {{ $t('newRadio.bitrate') }}:
      </v-col>
      <v-col>{{ $store.getters.currentStation.bitrate }}kbps</v-col>
      <v-col class="text-right" tag="strong" cols="6">
        {{ $t('newRadio.website') }}:
      </v-col>
      <v-col>
        <a :href="`${$store.getters.currentStation.website}`" target="_blank">{{ $store.getters.currentStation.website }}</a>
      </v-col>
      <v-col class="text-right" tag="strong" cols="6">
        {{ $t('newRadio.src') }}:
      </v-col>
      <v-col>
        <a :href="`${$store.getters.currentStation.src}`" target="_blank">{{ $store.getters.currentStation.src }}</a>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import ClipLoader from 'vue-spinner/src/ClipLoader'
const size = 30
const tempo = 180 //bpm
export default {
  name: "CurrentStation",
  components: {ClipLoader},
  mounted() {
    this.updateBars()
  },
  watch: {
    '$store.getters.isPlaying'(value) {
      if (value) {
        this.timer = setInterval(this.updateBars, this.getDelay())
      } else {
        clearInterval(this.timer)
      }
    }
  },
  data: () => ({
    bars: [],
    timer: null,
  }),
  methods: {
    getBars() {
      return new Array(size)
          .fill(1)
          .map(() => Math.ceil(Math.random() * (100 - 30) + 30));
    },
    updateBars() {
      this.bars = this.getBars();
    },
    getDelay() {
      return 60 * 1000 / tempo;
    },
    showEditStationDialog() {
      this.$emit('show-edit-station-dialog')
    }
  }
}
</script>

<style scoped>
#container {
  height: 22vh;
}

#equalizer {
  width: 100%;
  height: 100%;
}
.bar {
  fill: url(#barBg) #9fea63;
  transition: all .4s cubic-bezier(.71,.09,.55,1.14);
}
</style>
