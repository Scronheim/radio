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
                        item-value="name"
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
    </v-row>
    <v-row>
      <v-col>
        <v-text-field dense :label="$t('newRadio.website')" v-model.number="station.website"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field dense :label="$t('newRadio.logoSrc')" v-model.number="station.logo_src"/>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script>
export default {
  name: "StationForm",
  props: {
    station: {
      type: Object,
      required: true
    }
  },
}
</script>

<style scoped>

</style>
