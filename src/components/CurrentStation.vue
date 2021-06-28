<template>
  <div v-if="$store.getters.currentStation.id">
    <v-card class="mb-5">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn absolute right fab small color="success"
                 v-on="on"
                 v-bind="attrs"
                 @click="equalizerDialog = true">
            <v-icon>
              mdi-palette
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('equalizerColors.title') }}</span>
      </v-tooltip>
      <v-card-text>
        <v-row>
          <v-col>
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
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card elevation="7">
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
          <v-btn absolute right fab small color="yellow" style="margin-right: 55px"
                 v-on="on"
                 v-bind="attrs"
                 @click="">
            <v-icon color="black">
              mdi-thumb-up
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('texts.addFavorites') }}</span>
      </v-tooltip>
      <v-toolbar dense color="grey darken-3" elevation="9">
        <v-toolbar-title>{{ $store.getters.currentStation.name }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col cols="7">
            <v-row>
              <v-col>
                {{ $t('newRadio.name') }}:
              </v-col>
              <v-col class="white--text font-weight-bold">
                {{ $store.getters.currentStation.name }}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                {{ $t('newRadio.currentTrack') }}:
              </v-col>
              <v-col class="white--text font-weight-bold">
                <sync-loader v-if="$store.getters.currentSong === ''" color="#fff"/>
                <template v-else>
                  {{ $store.getters.currentSong }}
                </template>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                {{ $t('newRadio.genre') }}:
              </v-col>
              <v-col class="white--text font-weight-bold">
                {{ $store.getters.currentStation.genre | getGenreText }}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                {{ $t('newRadio.country') }}:
              </v-col>
              <v-col class="white--text font-weight-bold">
                {{ $store.getters.currentStation.country | getCountryText }}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                {{ $t('newRadio.bitrate') }}:
              </v-col>
              <v-col class="white--text font-weight-bold">
                {{ $store.getters.currentStation.bitrate }}kbps
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                {{ $t('newRadio.website') }}:
              </v-col>
              <v-col class="font-weight-bold">
                <a :href="`${$store.getters.currentStation.website}`" target="_blank">{{ $store.getters.currentStation.website }}</a>
              </v-col>
            </v-row>
          </v-col>
          <v-col>
            <v-img v-if="$store.getters.currentStation.logo_blob" :height="200" contain :src="$store.getters.currentStation.logo_blob"/>
            <v-img v-else-if="$store.getters.currentStation.logo_src" :height="200" contain :src="$store.getters.currentStation.logo_src"/>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="pa-4">
        {{ $t('texts.rateThisStation') }}
        <v-spacer/>
        <span class="grey--text text--lighten-2 text-caption mr-2">
        ({{ $store.getters.stationRating.rating }})
      </span>
        <v-rating
            @input="setRating"
            v-model="$store.getters.stationRating.rating"
            background-color="white"
            color="yellow accent-4"
            dense
            half-increments
            hover
            size="18"
        />
      </v-card-actions>
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
  </div>
</template>

<script>
import { SyncLoader } from '@saeris/vue-spinners'

const size = 30
const tempo = 200 //bpm

export default {
  name: "CurrentStation",
  components: {SyncLoader},
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
    setRating(rating) {
      this.$store.commit('addRating', {rating: rating, station_id: this.$store.getters.currentStation.id})
      this.$store.dispatch('saveRatings')
    },
    getBars() {
      return new Array(size)
          .fill(1)
          .map(() => Math.ceil(Math.random() * (100 - 30) + 30))
    },
    updateBars() {
      this.bars = this.getBars()
    },
    getDelay() {
      return 60 * 1000 / tempo
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
