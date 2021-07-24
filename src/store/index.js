import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { ipcRenderer, remote } from 'electron'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    player: {
      element: HTMLElement,
    },
    favorites: [],
    stations: [],
    countries: [],
    genres: [],
    currentStation: {
      current_song: '',
      logo_blob: '',
    },
    settings: {
      locale: 'ru',
      volume: null,
      theme: null,
      equalizerColors: {
        0: '#a142f5',
        50: '#12fdfd',
        100: '#fff'
      }
    },
    ratings: [],
    categories: [],
    serverTypes: ['icecast', 'shoutcast', '101.ru'],
    isPlaying: false,
    apiHost: 'http://176.57.214.6:3001',
    wsHost: 'ws://176.57.214.6:8080',
    currentSong: '',
    webSocket: null,
    currentSongTimer: null,
    appName: remote.app.getName(),
    version: remote.app.getVersion(),
    isLoading: false
  },
  mutations: {
    setLoading(state, payload) {
      state.isLoading = payload
    },
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
    addRating(state, payload) {
      let rating = state.ratings.find((r) => {
        return r.station_id === payload.station_id
      })
      if (rating) {
        rating.rating = payload.rating
      } else {
        state.ratings.push(payload)
      }
    },
    fillRating(state, payload) {
      state.ratings = payload
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
    addFavorite(state, payload) {
      state.favorites.push(payload)
    },
    setFavorites(state, payload) {
      state.favorites = payload
    },
    setSettings(state, payload) {
      Object.assign(state.settings, payload)
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
    },
    setEqualizerColor(state, payload) {
      state.settings.equalizerColors[payload.percent] = payload.color
    },
    fillCountries(state, payload) {
      state.countries = payload
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
    saveRatings(context) {
      localStorage.setItem('ratings', JSON.stringify(context.state.ratings))
    },
    getRatings(context) {
      let ratings = JSON.parse(localStorage.getItem('ratings'))
      if (ratings) {
        context.commit('fillRating', ratings)
      }
    },
    getSettings(context) {
      let settings = JSON.parse(localStorage.getItem('settings'))
      if (!settings) {
        settings = {}
        settings.volume = 50
        settings.locale = 'ru'
        settings.theme = 'dark'
      }
      context.commit('setPlayerVolume', settings.volume / 100)
      context.commit('setSettings', settings)
      context.dispatch('saveSettings')
    },
    refresh(context) {
      return Promise.all([context.dispatch('getStations'), context.dispatch('getGenres'), context.dispatch('getCountries')]).then((response) => {
        context.dispatch('getFavorites')
        context.dispatch('getRatings')
        context.dispatch('getSettings')
        context.commit('fillStations', response[0].data.data)
        context.commit('fillGenres', response[1].data.data)
        context.commit('fillCountries', response[2].data.data)
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
    getCountries(context) {
      return axios.get(`${context.state.apiHost}/api/countries`)
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
    countries: state => state.countries,
    genres: state => state.genres,
    categories: state => state.categories,
    ratings: state => state.ratings,
    stationRating: state => {
      const rating = state.ratings.find(r => r.station_id === state.currentStation.id)
      if (rating) {
        return rating
      }
      return {rating: 0, station_id: state.currentStation.id}
    },
    currentStationInFavorites: state => {
      const station = state.favorites.find((f) => {
        return f.id === state.currentStation.id
      })
      return !!station
    },
    currentStation: state => state.currentStation,
    currentSong: state => {
      if (state.currentSong !== '') {
        const payload = {
          date: new Date(),
          station: state.currentStation,
          song: state.currentSong
        }
        ipcRenderer.invoke('write-current-track', payload)
      }
      return state.currentSong
    },
    serverTypes: state => state.serverTypes,
    isPlaying: state => state.isPlaying,
    settings: state => state.settings,
    webSocket: state => state.webSocket,
    appName: state => state.appName,
    version: state => state.version,
    isLoading: state => state.isLoading
  },
})
