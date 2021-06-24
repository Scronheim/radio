<template>
  <v-card v-if="$store.getters.currentStation.id"
          class="mx-auto" flat>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn absolute right fab small color="primary"
               v-on="on"
               v-bind="attrs"
               @click="showEditStationDialog">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
      <span>{{ $t('newRadio.titleEdit') }}</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn absolute right fab small color="success"
               v-on="on"
               v-bind="attrs"
               style="margin-right: 50px"
               @click="equalizerDialog = true">
          <v-icon>
            mdi-palette
          </v-icon>
        </v-btn>
      </template>
      <span>{{ $t('equalizerColors.title') }}</span>
    </v-tooltip>
    <v-card-text>
      <v-img v-if="$store.getters.currentStation.logo_blob" :height="200" contain :src="$store.getters.currentStation.logo_blob"/>
      <v-img v-else-if="$store.getters.currentStation.logo_src" :height="200" contain :src="$store.getters.currentStation.logo_src"/>
      <h3 class="text-h5 mb-2">
        {{ $store.getters.currentStation.name }}
      </h3>
      <div id="container">
        <svg id="equalizer">
          <defs>
            <linearGradient id="barBg" gradientTransform="rotate(90)">
              <stop offset="0%" :stop-color="$store.getters.settings.equalizerColors['0']"/>
              <stop offset="50%" :stop-color="$store.getters.settings.equalizerColors['50']"/>
              <stop offset="100%" :stop-color="$store.getters.settings.equalizerColors['100']"/>
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
    </v-row>

    <v-dialog v-model="equalizerDialog" width="100%">
      <v-card>
        <v-card-title>{{ $t('equalizerColors.title') }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="2">
              <v-checkbox dense :label="$t('equalizerColors.showSwatchesText')" v-model="showSwatches"/>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <h4 class="text--white">{{ $t('equalizerColors.color0') }}</h4>
              <v-color-picker mode="hexa" hide-mode-switch v-model="$store.getters.settings.equalizerColors['0']"
                              :show-swatches="showSwatches"
                              swatches-max-height="250"
                              @update:color="changeEqualizerColor0"/>
            </v-col>
            <v-col>
              <h4 class="text--white">{{ $t('equalizerColors.color50') }}</h4>
              <v-color-picker mode="hexa" hide-mode-switch v-model="$store.getters.settings.equalizerColors['50']"
                              :show-swatches="showSwatches"
                              swatches-max-height="250"
                              @update:color="changeEqualizerColor50"/>
            </v-col>
            <v-col>
              <h4 class="text--white">{{ $t('equalizerColors.color100') }}</h4>
              <v-color-picker mode="hexa" hide-mode-switch v-model="$store.getters.settings.equalizerColors['100']"
                              :show-swatches="showSwatches"
                              swatches-max-height="250"
                              @update:color="changeEqualizerColor100"/>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="equalizerDialog = false">{{ $t('texts.closeButton') }}</v-btn>
          <v-btn color="success" @click="saveEqualizerColors">{{ $t('texts.saveButton') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import ClipLoader from 'vue-spinner/src/ClipLoader'

const size = 30
const tempo = 200 //bpm

export default {
  name: "CurrentStation",
  components: {ClipLoader},
  watch: {
    '$store.getters.isPlaying'(value) {
      if (value) {
        this.timer = setInterval(this.updateBars, this.getDelay())
      } else {
        clearInterval(this.timer)
      }
    },
  },
  data: () => ({
    equalizerDialog: false,
    showSwatches: false,
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
    },
    changeEqualizerColor0(color) {
      this.$store.commit('setEqualizerColor', {percent: 0, color: color.hex})
    },
    changeEqualizerColor50(color) {
      this.$store.commit('setEqualizerColor', {percent: 50, color: color.hex})
    },
    changeEqualizerColor100(color) {
      this.$store.commit('setEqualizerColor', {percent: 100, color: color.hex})
    },
    saveEqualizerColors() {
      this.$store.dispatch('saveSettings')
      this.equalizerDialog = false
    }
  }
}
</script>

<style scoped>
#container {
  height: 20vh;
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
