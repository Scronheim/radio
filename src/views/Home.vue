<template>
  <v-container fluid>
    <v-row>
      <v-col cols="4">
        <v-row>
          <v-col>
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                    color="success"
                    dark
                    icon
                    v-bind="attrs"
                    v-on="on"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item dense link @click="addStationDialog = true">
                  <v-list-item-title>{{ $t('newRadio.title') }}</v-list-item-title>
                </v-list-item>
                <v-list-item dense link @click="addGenreDialog = true">
                  <v-list-item-title>{{ $t('newGenre.title') }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col align="end">
            <v-btn icon class="mb-2" color="white" @click="settingsDialog = true">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-sheet class="pa-2 mb-2 primary">
          <v-text-field
              v-model="search"
              :label="$t('radio.stationFilter')"
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
        <current-station @show-edit-station-dialog="showEditStationDialog"/>
      </v-col>
    </v-row>

    <v-dialog v-model="addStationDialog" width="50%" persistent>
      <v-card>
        <v-card-title>{{ $t('newRadio.title') }}</v-card-title>
        <station-form :station="editStation"/>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="addStationDialog = false">{{ $t('radio.closeButton') }}</v-btn>
          <v-btn color="success" @click="addNewStation">{{ $t('radio.addButton') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editStationDialog" width="50%" persistent>
      <v-card>
        <v-card-title>{{ $t('newRadio.titleEdit') }}</v-card-title>
        <station-form :station="editStation"/>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="editStationDialog = false">{{ $t('radio.closeButton') }}</v-btn>
          <v-btn color="success" @click="updateStation">{{ $t('radio.saveButton') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addGenreDialog" width="50%" persistent>
      <v-card>
        <v-card-title>{{ $t('newGenre.title') }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field dense :label="$t('newGenre.name')" v-model="genre"/>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="addGenreDialog = false">{{ $t('radio.closeButton') }}</v-btn>
          <v-btn color="success" @click="addNewGenre" :disabled="genre === ''">{{ $t('radio.addButton') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="settingsDialog" width="50%" persistent>
      <v-card>
        <v-card-title>{{ $t('settings.title') }}</v-card-title>
        <settings-form :settings="settings"/>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="settingsDialog = false">{{ $t('radio.closeButton') }}</v-btn>
          <v-btn color="success" @click="saveSettings">{{ $t('radio.saveButton') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
// @ is an alias to /src
import StationForm from "@/components/StationForm"
import CurrentStation from "@/components/CurrentStation"
import SettingsForm from "@/components/SettingsForm"

export default {
  name: 'Home',
  components: {StationForm, CurrentStation, SettingsForm},
  mounted() {
    if (localStorage.getItem('settings')) {
      this.settings = JSON.parse(localStorage.getItem('settings'))
    }
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
  data: () => ({
    addStationDialog: false,
    editStationDialog: false,
    addGenreDialog: false,
    settingsDialog: false,
    showMenu: false,
    active: [],
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
    settings: {
      locale: 'ru',
    }
  }),
  methods: {
    playStation(stationId) {
      if (stationId[0]) {
        const station = this.$store.getters.stations.find(st => st.id === stationId[0])
        this.$store.commit('setPlaying', {state: true, station: station})
        this.$store.commit('setCurrentSong', '')
      } else {
        this.$store.commit('setPlaying', {state: false})
        this.$store.commit('setCurrentSong', 'Paused')
      }
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
    saveSettings() {
      localStorage.setItem('settings', JSON.stringify(this.settings))
      this.settingsDialog = false
      this.$i18n.locale = this.settings.locale
      this.$toast.success(this.$t('settings.saveSettingsText'))
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

</style>
