<template>
  <v-container fluid>
    <v-row>
      <v-col cols="4">
        <v-btn class="mb-2" width="100%" color="success" @click="addStationDialog = true">Add station</v-btn>
        <v-btn class="mb-2" width="100%" color="success" @click="addGenreDialog = true">Add Genre</v-btn>
        <v-sheet class="pa-2 mb-2 primary">
          <v-text-field
              v-model="search"
              label="Station filter"
              dark
              flat
              solo
              hide-details
              clearable
              clear-icon="mdi-close-circle-outline"/>
        </v-sheet>
        <div class="scroll">
          <v-treeview
              activatable
              dense
              open-on-click
              transition
              :active.sync="active"
              :items="$store.getters.categories"
              :filter="filter"
              :search="search"
              @update:active="playStation">
            <template v-slot:label="{item, open}">
              <v-icon v-if="item.children" class="mr-2">
                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
              </v-icon>
              <v-icon v-else class="mr-2">
                mdi-radio
              </v-icon>
              {{ item.name }}
            </template>
          </v-treeview>
        </div>
      </v-col>
      <v-divider vertical/>
      <v-col class="d-flex text-center">
        <v-scroll-y-transition mode="out-in">
          <v-card v-if="$store.getters.currentStation.id"
                  class="pt-5 mx-auto" flat
                  :key="$store.getters.currentStation.id">
            <v-btn absolute right fab small color="primary" @click="showEditStationDialog">
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-card-text>
              <v-avatar color="red">
                <span class="white--text text-h5">{{ lettersForAvatar }}</span>
              </v-avatar>
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
                <a :href="`${$store.getters.currentStation.website}`" target="_blank">{{ $store.getters.currentStation.website }}</a>
              </v-col>
              <v-col class="text-right" tag="strong" cols="6">
                Stream:
              </v-col>
              <v-col>
                <a :href="`${$store.getters.currentStation.src}`" target="_blank">{{ $store.getters.currentStation.src }}</a>
              </v-col>
            </v-row>
          </v-card>
        </v-scroll-y-transition>
      </v-col>
    </v-row>

    <v-dialog v-model="addStationDialog" width="50%" persistent>
      <v-card>
        <v-card-title>Add new station</v-card-title>
        <station-form :station="editStation"/>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="addStationDialog = false">Close</v-btn>
          <v-btn color="success" @click="addNewStation">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editStationDialog" width="50%" persistent>
      <v-card>
        <v-card-title>Edit station</v-card-title>
        <station-form :station="editStation"/>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="editStationDialog = false">Close</v-btn>
          <v-btn color="success" @click="updateStation">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addGenreDialog" width="50%" persistent>
      <v-card>
        <v-card-title>Add new genre</v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field dense label="Genre" v-model="genre"/>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="addGenreDialog = false">Close</v-btn>
          <v-btn color="success" @click="addNewGenre" :disabled="genre === ''">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
// @ is an alias to /src
import StationForm from "@/components/StationForm";
const size = 30
const tempo = 180 //bpm
export default {
  name: 'Home',
  components: {StationForm},
  mounted() {
    this.updateBars()
  },
  computed: {
    filter() {
      return (item, search, textKey) => item[textKey].toUpperCase().indexOf(search.toUpperCase()) > -1
    },
    lettersForAvatar() {
      let wordsCount = this.countWords(this.$store.getters.currentStation.name)
      let name = this.$store.getters.currentStation.name
      name = name.replace(/(^\s*)|(\s*$)/gi,"");//exclude start and end white-space
      name = name.replace(/[ ]{2,}/gi," ");//2 or more space to 1
      name = name.replace(/\n /,"\n"); // exclude newline with a start spacing
      name = name.replace(/[-|] /,""); // exclude "-" and "|"
      let newName = name.split(' ').filter(function(str){return str!=="";})
      if (wordsCount >= 2) {
        return `${newName[0][0]}${newName[1][0]}`
      } else {
        return `${newName[0]}`
      }
    }
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
    addStationDialog: false,
    editStationDialog: false,
    addGenreDialog: false,
    showMenu: false,
    active: [],
    bars: [],
    search: null,
    genre: '',
    editStation: {
      name: null,
      description: null,
      genre: null,
      country: null,
      src: null,
      song_src: null,
      bitrate: null,
      server_type: null,
      website: null,
    },
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
    playStation(stationId) {
      const station = this.$store.getters.stations.find(st => st.id === stationId[0])
      this.$store.commit('fillCurrentStation', station)
    },
    addNewStation() {
      this.$store.dispatch('addNewStation', this.editStation).then((response) => {
        if (response.data.data.length > 0) {
          this.$store.dispatch('refresh')
          this.addStationDialog = false
          this.$toast.success('Station added')
        }
      }).catch((error) => {
        this.$toast.error(error.response.data.error)
      })
    },
    updateStation() {
      this.$store.dispatch('updateStation', this.editStation).then((response) => {
        if (response.data.data === 1) {
          this.$store.dispatch('refresh')
          this.editStationDialog = false
          this.$store.commit('fillCurrentStation', this.editStation)
          this.$toast.success('Station updated')
        }
      }).catch((error) => {
        this.$toast.error(error.response.data.error)
      })
    },
    addNewGenre() {
      this.$store.dispatch('addNewGenre', {name: this.genre}).then((response) => {
        if (response.data.success) {
          this.$store.dispatch('refresh')
          this.addGenreDialog = false
          this.$toast.success('Genre added')
        }
      }).catch((error) => {
        this.$toast.error(error.response.data.error)
      })
    },
    showEditStationDialog() {
      this.editStation = Object.assign({}, this.$store.getters.currentStation)
      this.editStationDialog = true
    },
    countWords(s) {
      s = s.replace(/(^\s*)|(\s*$)/gi,"");//exclude  start and end white-space
      s = s.replace(/[ ]{2,}/gi," ");//2 or more space to 1
      s = s.replace(/\n /,"\n"); // exclude newline with a start spacing
      s = s.replace(/[-|] /,""); // exclude "-" and "|"
      return s.split(' ').filter(function(str){return str!=="";}).length
      //return s.split(' ').filter(String).length; - this can also be used
    }
  }
}
</script>
<style>
.scroll {
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  max-height: 68vh;
  min-height: 66vh;
}
#container {
  height: 28vh;
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
