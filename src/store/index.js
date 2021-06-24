import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { ipcRenderer } from 'electron'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    player: {
      element: HTMLElement,
    },
    favorites: [],
    stations: [],
    genres: [],
    currentStation: {
      current_song: '',
      logo_blob: '',
    },
    settings: {
      locale: 'ru',
      volume: null,
      theme: null
    },
    categories: [],
    serverTypes: ['icecast', 'shoutcast', '101.ru'],
    isPlaying: false,
    apiHost: 'http://176.57.214.6:3001',
    wsHost: 'ws://176.57.214.6:8080',
    currentSong: '',
    webSocket: null,
    currentSongTimer: null,
  },
  mutations: {
    setPlaying(state, payload) {
      state.isPlaying = payload.state
      clearInterval(state.currentSongTimer)
      if (payload.station) {
        state.currentStation = payload.station
        state.currentSong = ''
        state.currentSongTimer = setInterval(() => {
          const payload = {
            event: 'getCurrentTrack',
            station: state.currentStation
          }
          state.webSocket.send(JSON.stringify(payload))
        }, 5000)
        state.webSocket.onmessage = function (event) {
          if (event.data === '') {
            state.currentSong = null
          } else {
            state.currentSong = event.data
          }
        }
        state.player.element.load()
        state.player.element.play()
      } else {
        state.currentSong = 'Paused'
        state.player.element.pause()
      }
    },
    setPlayer(state, payload) {
      state.player.element = payload
    },
    setPlayerVolume(state, payload) {
      state.player.element.volume = payload
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
    },
    addFavorite(state, payload) {
      state.favorites.push(payload)
    },
    setFavorites(state, payload) {
      state.favorites = payload
    },
    setSettings(state, payload) {
      state.settings = payload
    },
    setVolume(state, payload) {
      state.settings.volume = payload
    },
    setCurrentStationLogoBlob(state, payload) {
      state.currentStation.logo_blob = payload
    },
    setWebSocket(state) {
      state.webSocket = new WebSocket(`${state.wsHost}`)
    },
    setCurrentSongTimer(state, payload) {
      state.currentSongTimer = payload
    }
  },
  actions: {
    scanStationLogo(context) {
      ipcRenderer.invoke('read-station-logo', context.state.currentStation.id).then((response) => {
        if (response) {
          const blob = URL.createObjectURL(new Blob([response.buffer]))
          context.commit('setCurrentStationLogoBlob', blob)
        }
      })
    },
    saveSettings(context) {
      localStorage.setItem('settings', JSON.stringify(context.state.settings))
    },
    getSettings(context) {
      context.commit('setSettings', JSON.parse(localStorage.getItem('settings')))
    },
    refresh(context) {
      return Promise.all([context.dispatch('getStations'), context.dispatch('getGenres')]).then((response) => {
        context.dispatch('getFavorites')
        context.dispatch('getSettings')
        context.commit('fillStations', response[0].data.data)
        context.commit('fillGenres', response[1].data.data)
        context.commit('fillCategories')
      })
    },
    getFavorites(context) {
      let fav = localStorage.getItem('favorites')
      if (fav) {
        fav = JSON.parse(fav)
        context.commit('setFavorites', fav)
      }
    },
    saveFavorites(context) {
      localStorage.setItem('favorites', JSON.stringify(context.state.favorites))
    },
    deleteFavorite(context, index) {
      context.state.favorites.splice(index)
      localStorage.setItem('favorites', JSON.stringify(context.state.favorites))
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
    async deleteStation(context, payload) {
      return await axios.delete(`${context.state.apiHost}/api/stations/${payload.id}`)
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
    async deleteGenre(context, payload) {
      return await axios.delete(`${context.state.apiHost}/api/genres/${payload.id}`)
    },
  },
  getters: {
    player: state => state.player,
    favorites: state => state.favorites,
    stations: state => state.stations,
    genres: state => state.genres,
    categories: state => state.categories,
    currentStation: state => state.currentStation,
    currentSong: state => state.currentSong,
    serverTypes: state => state.serverTypes,
    isPlaying: state => state.isPlaying,
    settings: state => state.settings,
    webSocket: state => state.webSocket
  },
})
