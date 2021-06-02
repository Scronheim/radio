import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stations: [],
    genres: [],
    currentStation: {
      current_song: ''
    },
    categories: [],
    serverTypes: ['shoutcast', 'icecast']
  },
  mutations: {
    fillStations(state, payload) {
      state.stations = payload
    },
    fillGenres(state, payload) {
      state.genres = payload
    },
    fillCategories(state) {
      state.genres.forEach((genre) => {
        let result = state.stations.filter((station) => {
          return station.genre === genre.name
        })
        if (result.length > 0) {
          const cat = state.categories.some((c) => {
            return c.name === genre.name
          })
          if (cat) {
            genre.children = result
          } else {
            state.categories.push({
              id: genre.id,
              name: genre.name,
              children: result
            })
          }
        }
      })
    },
    fillCurrentStation(state, payload) {
      state.currentStation = payload
    },
    setCurrentSong(state, payload) {
      Vue.set(state.currentStation, 'current_song', payload)
    }
  },
  actions: {
    getStations(context) {
      return axios.get('/api/stations').then((response) => {
        context.commit('fillStations', response.data.data)
      })
    },
    async addNewStation(context, payload) {
      return await axios.post('/api/stations', payload)
    },
    async updateStation(context, payload) {
      return await axios.patch('/api/stations', payload)
    },
    getGenres(context) {
      return axios.get('/api/genres').then((response) => {
        context.commit('fillGenres', response.data.data)
      })
    },
    getCurrentSong(context, station) {
      axios.post('/api/current_song', station).then((response) => {
        context.commit('setCurrentSong', response.data.data)
      })
    }
  },
  getters: {
    stations: state => state.stations,
    genres: state => state.genres,
    categories: state => state.categories,
    currentStation: state => state.currentStation,
    serverTypes: state => state.serverTypes
  },
  modules: {
  }
})
