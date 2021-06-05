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
    apiHost: 'http://176.57.214.6:3001',
    currentSong: '',
  },
  mutations: {
    setPlaying(state, payload) {
      state.isPlaying = payload.state
      if (payload.station) {
        state.currentStation = payload.station
      }
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
          return st.genre === genre.id
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
    setCurrentSong(state, payload) {
      state.currentSong = payload
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
    getStations(context) {
      return axios.get(`${context.state.apiHost}/api/stations`)
    },
    async addNewStation(context, payload) {
      return await axios.post(`${context.state.apiHost}/api/stations`, payload)
    },
    async updateStation(context, payload) {
      return await axios.patch(`${context.state.apiHost}/api/stations`, payload)
    },
    getGenres(context) {
      return axios.get(`${context.state.apiHost}/api/genres`)
    },
    async addNewGenre(context, payload) {
      return await axios.post(`${context.state.apiHost}/api/genres`, payload)
    },
    async updateGenre(context, payload) {
      return await axios.patch(`${context.state.apiHost}/api/genres`, payload)
    },
    getCurrentSong(context, station) {
      axios.post(`${context.state.apiHost}/api/current_song`, station).then((response) => {
        context.commit('setCurrentSong', response.data.data)
      })
    }
  },
  getters: {
    stations: state => state.stations,
    genres: state => state.genres,
    categories: state => state.categories,
    currentStation: state => state.currentStation,
    currentSong: state => state.currentSong,
    serverTypes: state => state.serverTypes,
    isPlaying: state => state.isPlaying
  },
  modules: {
  }
})
