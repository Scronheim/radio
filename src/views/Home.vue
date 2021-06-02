<template>
  <v-container fluid>
    <v-row>
      <v-col cols="3">
        <v-btn width="100%" color="success" @click="addStationDialog = true">Add station</v-btn>
        <v-treeview
            activatable
            dense
            hoverable
            open-on-click
            transition
            :active.sync="active"
            :items="$store.getters.categories"
            @update:active="playStation"/>
      </v-col>
      <v-divider vertical/>
      <v-col class="d-flex text-center">
        <v-scroll-y-transition mode="out-in">
          <v-card v-if="$store.getters.currentStation.id"
                  class="pt-6 mx-auto" flat
                  :key="$store.getters.currentStation.id">
            <v-card-text>
              <h3 class="text-h5 mb-2">
                {{ $store.getters.currentStation.name }}
              </h3>
            </v-card-text>
            <v-divider/>
            <v-row class="text-left" tag="v-card-text">
              <v-col class="text-right" tag="strong" cols="6">
                Title:
              </v-col>
              <v-col>{{ $store.getters.currentStation.name }}</v-col>
              <v-col class="text-right" tag="strong" cols="6">
                Current song:
              </v-col>
              <v-col>{{ $store.getters.currentStation.current_song }}</v-col>
              <v-col class="text-right" tag="strong" cols="6">
                Genre:
              </v-col>
              <v-col>{{ $store.getters.currentStation.genre }}</v-col>
              <v-col class="text-right" tag="strong" cols="6">
                Country:
              </v-col>
              <v-col>{{ $store.getters.currentStation.country }}</v-col>
              <v-col class="text-right" tag="strong" cols="6">
                Bitrate:
              </v-col>
              <v-col>{{ $store.getters.currentStation.bitrate }}kbps</v-col>
              <v-col class="text-right" tag="strong" cols="6">
                Website:
              </v-col>
              <v-col>
                <a :href="`//${$store.getters.currentStation.website}`" target="_blank">{{ $store.getters.currentStation.website }}</a>
              </v-col>
              <v-col class="text-right" tag="strong" cols="6">
                Stream:
              </v-col>
              <v-col>
                <a :href="`//${$store.getters.currentStation.src}`" target="_blank">{{ $store.getters.currentStation.src }}</a>
              </v-col>
            </v-row>
          </v-card>
        </v-scroll-y-transition>
      </v-col>
    </v-row>

    <v-dialog v-model="addStationDialog" width="50%" persistent>
      <v-card>
        <v-card-title>Add new station</v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field dense label="Station name" v-model="addStation.name"/>
            </v-col>
            <v-col>
              <v-text-field dense label="Description" v-model="addStation.description"/>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select label="Genre" dense
                        :items="$store.getters.genres"
                        item-text="name"
                        item-value="name"
                        v-model="addStation.genre"/>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field dense label="Stream url" v-model="addStation.src"/>
            </v-col>
            <v-col>
              <v-text-field dense label="Stream song url" v-model="addStation.song_src"/>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field dense label="Country" v-model="addStation.country"/>
            </v-col>
            <v-col>
              <v-text-field type="number" dense label="Bitrate (kbps)" v-model.number="addStation.bitrate"/>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select dense label="Server type"
                        v-model="addStation.server_type"
                        :items="$store.getters.serverTypes"/>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field dense label="Website" v-model.number="addStation.website"/>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="addStationDialog = false">Close</v-btn>
          <v-btn color="success" @click="addNewStation">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
  data: () => ({
    addStationDialog: false,
    active: [],
    addStation: {
      name: null,
      description: null,
      genre: null,
      country: null,
      src: null,
      song_src: null,
      bitrate: null,
      server_type: null,
      website: null,
    }
  }),
  methods: {
    playStation(stationId) {
      const station = this.$store.getters.stations.find(st => st.id === stationId[0])
      this.$store.commit('fillCurrentStation', station)
    },
    addNewStation() {
      this.$store.dispatch('addNewStation', this.addStation).then((response) => {
        if (response.data.data.length > 0) {
          this.$store.dispatch('getStations').then(() => {
            this.$store.commit('fillCategories')
          })
          this.$toast.success('Station added')
        }
      })
    },
  }
}
</script>
