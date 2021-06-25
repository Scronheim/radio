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
                <v-list-item dense link @click="showAddStationDialog">
                  <v-list-item-title>{{ $t('newRadio.title') }}</v-list-item-title>
                </v-list-item>
                <v-list-item dense link @click="addGenreDialog = true">
                  <v-list-item-title>{{ $t('newGenre.title') }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col align="end">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon class="mb-2" color="info"
                       v-on="on"
                       v-bind="attrs"
                       :disabled="loading"
                       @click="checkUpdates">
                  <v-icon>{{ rotateRefreshButton }}</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('texts.checkUpdates') }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon class="mb-2" color="white"
                       v-on="on"
                       v-bind="attrs"
                       @click="settingsDialog = true">
                  <v-icon>mdi-cog</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('texts.settingsButton') }}</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-sheet class="pa-2 mb-2 primary">
          <v-text-field
              v-model="search"
              :label="$t('texts.stationFilter')"
              dark
              flat
              solo
              hide-details
              clearable
              clear-icon="mdi-close-circle-outline"/>
        </v-sheet>
        <div class="scroll">
          <v-list dense>
            <v-list-group no-action @change="folderIcon = 'mdi-folder'">
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-icon size="28">mdi-thumb-up</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    <v-btn text>{{ $t('texts.favorites') }}</v-btn>
                  </v-list-item-title>
                </v-list-item-content>
              </template>

              <v-list-item dense class="pl-0">
                <v-list-item-content>
                  <v-list v-if="$store.getters.favorites.length > 0">
                    <v-list-item dense v-for="(fav, index) in $store.getters.favorites" :key="fav.id">
                      <v-list-item-content>
                        <v-list-item-title>
                          <v-btn text @contextmenu="showMenu($event, fav, index)" @click="playStation([fav])">
                            {{ fav.name }}
                          </v-btn>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                  <p v-else class="text-center">{{ $t('texts.noFavorites') }}</p>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
            <v-list-group no-action :value="true" @change="changeFolderIcon">
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-icon size="28">{{ folderIcon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    <v-btn text>{{ $t('texts.catalog') }}</v-btn>
                  </v-list-item-title>
                </v-list-item-content>
              </template>

              <v-list-item dense class="pl-5">
                <v-list-item-content>
                  <v-treeview
                      activatable
                      dense
                      open-on-click
                      transition
                      return-object
                      :active.sync="active"
                      :items="$store.getters.categories"
                      :filter="filter"
                      :search="search"
                      @update:active="playStation">
                    <template v-slot:label="{item, open}">
                      <v-btn text @contextmenu="showMenu($event, item)" :title="`${item.name}`">
                        <v-icon v-if="item.children" class="mr-2">
                          {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                        </v-icon>
                        <v-icon v-else class="mr-2">
                          mdi-radio
                        </v-icon>
                        {{ item.name }}
                      </v-btn>
                    </template>
                  </v-treeview>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </v-list>

          <v-menu v-model="menu" :position-x="x" :position-y="y" absolute offset-y>
            <v-list dense>
              <v-list-item dense link v-if="genre.id" @click="showAddStationDialog">
                <v-list-item-icon>
                  <v-icon color="success">mdi-plus</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{ $t('texts.addStation') }}</v-list-item-title>
              </v-list-item>
              <v-list-item dense link @click="toggleFavorites" v-if="editStation.id">
                <v-list-item-icon>
                  <v-icon color="yellow">{{ stationInFavorites ? 'mdi-thumb-down': 'mdi-thumb-up' }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{ stationInFavorites ? $t('texts.deleteFavorites'): $t('texts.addFavorites') }}</v-list-item-title>
              </v-list-item>
              <v-list-item dense link @click="showEditDialog">
                <v-list-item-icon>
                  <v-icon color="primary">mdi-pencil</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{ $t('texts.edit') }}</v-list-item-title>
              </v-list-item>
              <v-list-item dense link @click="remove">
                <v-list-item-icon>
                  <v-icon color="error">mdi-delete</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{ $t('texts.delete') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

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
          <v-btn color="error" @click="addStationDialog = false">{{ $t('texts.closeButton') }}</v-btn>
          <v-btn color="success" @click="addNewStation">{{ $t('texts.addButton') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editStationDialog" width="50%" persistent>
      <v-card>
        <v-card-title>{{ $t('newRadio.titleEdit') }}</v-card-title>
        <station-form :station="editStation"/>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="editStationDialog = false">{{ $t('texts.closeButton') }}</v-btn>
          <v-btn color="success" @click="updateStation">{{ $t('texts.saveButton') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addGenreDialog" width="50%" persistent>
      <v-card>
        <v-card-title>{{ $t('newGenre.title') }}</v-card-title>
        <genre-form :genre="genre"/>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="addGenreDialog = false">{{ $t('texts.closeButton') }}</v-btn>
          <v-btn color="success" @click="addNewGenre" :disabled="genre.name === ''">{{ $t('texts.addButton') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editGenreDialog" width="50%" persistent>
      <v-card>
        <v-card-title>{{ $t('newGenre.titleEdit') }}</v-card-title>
        <genre-form :genre="genre"/>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="editGenreDialog = false">{{ $t('texts.closeButton') }}</v-btn>
          <v-btn color="success" @click="updateGenre" :disabled="genre.name === ''">{{ $t('texts.saveButton') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="settingsDialog" width="50%" persistent>
      <v-card>
        <v-card-title>{{ $t('settings.title') }}</v-card-title>
        <settings-form/>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" @click="settingsDialog = false">{{ $t('texts.closeButton') }}</v-btn>
          <v-btn color="success" @click="saveSettings">{{ $t('texts.saveButton') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
// @ is an alias to /src
import { ipcRenderer } from 'electron'
import StationForm from "@/components/StationForm"
import GenreForm from "@/components/GenreForm"
import CurrentStation from "@/components/CurrentStation"
import SettingsForm from "@/components/SettingsForm"

export default {
  name: 'Home',
  components: {StationForm, GenreForm, CurrentStation, SettingsForm},
  mounted() {
    ipcRenderer.on('update_not_available', () => {
      this.loading = false
    })

    ipcRenderer.on('update_downloaded', () => {
      this.loading = false
    })
  },
  computed: {
    rotateRefreshButton() {
      if (this.loading) {
        return 'mdi-refresh mdi-spin'
      }
      return 'mdi-refresh'
    },
    stationInFavorites() {
      return this.$store.getters.favorites.find((st) => {
        return st.id === this.editStation.id
      })
    },
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
    loading: false,
    activeList: false,
    addStationDialog: false,
    editStationDialog: false,
    addGenreDialog: false,
    editGenreDialog: false,
    settingsDialog: false,
    menu: false,
    active: [],
    search: null,
    genre: {
      id: 0,
      name: '',
    },
    editStation: {
      name: null,
      description: null,
      genre: null,
      country: null,
      src: null,
      song_src: null,
      bitrate: null,
      server_type: null,
      logo_src: null,
      website: null,
    },
    selectedStationIndex: null,
    x: 0,
    y: 0,
    folderIcon: 'mdi-folder-open'
  }),
  methods: {
    checkUpdates() {
      this.loading = true
      ipcRenderer.invoke('check-updates')
    },
    deleteFav(index) {
      this.$store.dispatch('deleteFavorite', index)
      this.$toast.success(this.$t('newRadio.deleteStationText'))
    },
    toggleFavorites() {
      const station = this.$store.getters.favorites.find((st) => {
        return st.id === this.editStation.id
      })
      if (station) {
        this.$store.dispatch('deleteFavorite', this.selectedStationIndex)
      } else {
        this.$store.commit('addFavorite', this.editStation)
      }
      this.$store.dispatch('saveFavorites')
    },
    changeFolderIcon() {
      if (this.folderIcon === 'mdi-folder-open') {
        this.folderIcon = 'mdi-folder'
      } else {
        this.folderIcon = 'mdi-folder-open'
      }
    },
    remove() {
      if (confirm(`${this.$t('texts.deleteConfirm')}`)) {
        if (this.genre.id) {
          this.$store.dispatch('deleteGenre', this.genre).then(() => {
            this.$store.dispatch('refresh')
            this.$toast.success(this.$t('newRadio.deleteGenreText'))
          }).catch((error) => {
            if (error.response.data.error.code === 1451) {
              this.$toast.error(this.$t('texts.foreignKeyError'))
            } else {
              this.$toast.error(error.response.data.error.message)
            }
          })
        } else {
          this.$store.dispatch('deleteStation', this.editStation).then(() => {
            this.$store.dispatch('refresh')
            this.$toast.success(this.$t('newRadio.deleteStationText'))
          }).catch((error) => {
            this.$toast.error(error.response.data.error.message)
          })
        }
      }
    },
    showEditDialog() {
      if (this.editStation.name) {
        delete this.editStation.logo_blob
        this.editStationDialog = true
      } else {
        this.editGenreDialog = true
      }
    },
    showAddStationDialog() {
      this.editStation = {
        name: null,
        description: null,
        genre: null,
        country: null,
        src: null,
        song_src: null,
        bitrate: null,
        server_type: null,
        logo_src: null,
        website: null,
      }
      this.editStation.genre = this.genre.id
      this.addStationDialog = true
    },
    showMenu(e, item, index) {
      if (item.children) {
        this.editStation = {
          name: null,
          description: null,
          genre: null,
          country: null,
          src: null,
          song_src: null,
          bitrate: null,
          server_type: null,
          logo_src: null,
          logo_blob: null,
          website: null,
        }
        this.genre = Object.assign({}, item)
      } else {
        this.genre = {
          id: 0,
          name: '',
        }
        this.selectedStationIndex = index
        delete item.logo_blob
        this.editStation = Object.assign({}, item)
      }
      e.preventDefault()
      this.x = e.clientX
      this.y = e.clientY
      this.menu = true
    },
    playStation(station) {
      if (station[0]) {
        this.$store.commit('setPlaying', {state: true, station: station[0]})
        this.$store.dispatch('scanStationLogo')
      } else {
        this.$store.commit('setPlaying', {state: false})
      }
    },
    addNewStation() {
      this.$store.dispatch('addNewStation', this.editStation).then((response) => {
        if (response.data.data.length > 0) {
          this.$store.dispatch('refresh')
          this.addStationDialog = false
          this.$toast.success(this.$t('newRadio.addStationText'))
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
          this.$toast.success(this.$t('newRadio.saveStationText'))
        }
      }).catch((error) => {
        this.$toast.error(error.response.data.error)
      })
    },
    addNewGenre() {
      this.$store.dispatch('addNewGenre', {name: this.genre.name}).then((response) => {
        if (response.data.success) {
          this.$store.dispatch('refresh')
          this.addGenreDialog = false
          this.$toast.success(this.$t('newRadio.addGenreText'))
        }
      }).catch((error) => {
        this.$toast.error(error.response.data.error)
      })
    },
    updateGenre() {
      delete this.genre.children
      this.$store.dispatch('updateGenre', this.genre).then(() => {
        this.$toast.success(this.$t('newGenre.saveGenreText'))
        this.$store.dispatch('refresh')
        this.editGenreDialog = false
      })
    },
    showEditStationDialog() {
      this.editStation = Object.assign({}, this.$store.getters.currentStation)
      this.editStationDialog = true
    },
    saveSettings() {
      this.$store.dispatch('saveSettings')
      this.settingsDialog = false
      this.$vuetify.theme.dark = this.$store.getters.settings.theme === 'dark'
      this.$i18n.locale = this.$store.getters.settings.locale
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
  max-height: 70vh;
  min-height: 66vh;
}

</style>
