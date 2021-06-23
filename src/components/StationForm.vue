<template>
  <v-card-text>
    <v-row>
      <v-col>
        <v-text-field dense :label="$t('newRadio.name')" v-model="station.name"/>
      </v-col>
      <v-col>
        <v-text-field dense :label="$t('newRadio.description')" v-model="station.description"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-autocomplete :label="$t('newRadio.genre')" dense
                        :items="$store.getters.genres"
                        item-text="name"
                        item-value="id"
                        v-model="station.genre"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field dense :label="$t('newRadio.src')" v-model="station.src"/>
      </v-col>
      <v-col>
        <v-text-field dense :label="$t('newRadio.songSrc')" v-model="station.song_src"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field dense :label="$t('newRadio.country')" v-model="station.country"/>
      </v-col>
      <v-col>
        <v-text-field type="number" dense :label="$t('newRadio.bitrate')" v-model.number="station.bitrate"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-select dense :label="$t('newRadio.serverType')"
                  v-model="station.server_type"
                  :items="$store.getters.serverTypes"/>
      </v-col>
      <v-col v-if="station.server_type === '101.ru'">
        <v-text-field dense :label="$t('newRadio.101_channel_id')" v-model.number="station['101_channel_id']"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field dense :label="$t('newRadio.website')" v-model="station.website"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field dense :label="$t('newRadio.logoSrc')" v-model="station.logo_src"/>
      </v-col>
      {{ $t('radio.or') }}
      <v-col>
        <v-file-input dense :label="$t('newRadio.uploadLogoText')" v-model="logoFile"
                      @change="saveStationLogo"/>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script>
const {ipcRenderer} = require("electron")
export default {
  name: "StationForm",
  props: {
    station: {
      type: Object,
      required: true
    }
  },
  watch: {
    '$store.getters.currentStation.id'() {
      this.logoFile = null
    },
  },
  data: () => ({
    logoFile: null,
  }),
  methods: {
    saveStationLogo() {
      this.fileToArrayBuffer().then((response) => {
        const payload = {
          name: `${this.station.id}.${/[^.]+$/.exec(this.logoFile.name)}`,
          buffer: response
        }
        ipcRenderer.send('save-file', payload)
        this.$store.dispatch('scanStationLogo')
      })
    },
    fileToArrayBuffer() {
      return new Promise((resolve, reject) => {
        try {
          let reader = new FileReader();
          reader.readAsArrayBuffer(this.logoFile);
          reader.onloadend = () => {
            resolve(reader.result);
          }
        }
        catch (e) {
          reject(e);
        }
      })
    },
  }
}
</script>

<style scoped>

</style>
