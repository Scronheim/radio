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
    serverTypes: ['icecast', 'shoutcast'],
    isPlaying: false,
  },
  mutations: {
    setPlaying(state, payload) {
      state.isPlaying = payload
    },
    fillStations(state, payload) {
      state.stations = payload
    },
    fillGenres(state, payload) {
      state.genres = payload
    },
    fillCategories(state) {
      state.categories = []
      state.genres.forEach((genre) => {
        const stations = state.stations.filter((st) => {
          return st.genre === genre.name
        })
        if (stations.length > 0) {
          state.categories.push({
            id: genre.id,
            name: genre.name,
            children: stations
          })
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
    refresh(context) {
      Promise.all([context.dispatch('getStations'), context.dispatch('getGenres')]).then((response) => {
        context.commit('fillStations', response[0].data.data)
        context.commit('fillGenres', response[1].data.data)
        context.commit('fillCategories')
      })
    },
    getStations() {
      return axios.get('/api/stations')
    },
    async addNewStation(context, payload) {
      delete payload.current_song
      return await axios.post('/api/stations', payload)
    },
    async updateStation(context, payload) {
      delete payload.current_song
      return await axios.patch('/api/stations', payload)
    },
    getGenres() {
      return axios.get('/api/genres')
    },
    async addNewGenre(context, payload) {
      return await axios.post('/api/genres', payload)
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
    serverTypes: state => state.serverTypes,
    isPlaying: state => state.isPlaying
  },
  modules: {
  }
})
