<template>
  <v-card-text>
    <v-row>
      <v-col>
        <v-text-field dense label="Station name" v-model="station.name"/>
      </v-col>
      <v-col>
        <v-text-field dense label="Description" v-model="station.description"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-autocomplete label="Genre" dense
                        :items="$store.getters.genres"
                        item-text="name"
                        item-value="name"
                        v-model="station.genre"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field dense label="Stream url" v-model="station.src"/>
      </v-col>
      <v-col>
        <v-text-field dense label="Stream song url" v-model="station.song_src"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field dense label="Country" v-model="station.country"/>
      </v-col>
      <v-col>
        <v-text-field type="number" dense label="Bitrate (kbps)" v-model.number="station.bitrate"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-select dense label="Server type"
                  v-model="station.server_type"
                  :items="$store.getters.serverTypes"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field dense label="Website" v-model.number="station.website"/>
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
