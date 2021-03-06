import Vue from 'vue'
import App from './App.vue'
import VueI18n from 'vue-i18n'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import _ from 'lodash'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import messages from './locales/index'
import VueTitlebar from '@wuild/vue-titlebar'

Vue.config.productionTip = false
Vue.prototype.$_ = _

Vue.use(VueTitlebar)
Vue.use(VueI18n)
// Create VueI18n instance with options
const settings = JSON.parse(localStorage.getItem('settings'))
let locale = 'ru'
if (settings) {
  locale = settings.locale
}
const i18n = new VueI18n({
  locale: locale,
  fallbackLocale: "ru",
  messages: messages
})

Vue.filter('truncate', function(text, length, clamp) {
  clamp = clamp || '...'
  let node = document.createElement('div');
  node.innerHTML = text
  let content = node.textContent
  return content.length > length ? content.slice(0, length) + clamp : content;
})

Vue.filter('getGenreText', function(value) {
  if (!value) return ''
  return store.getters.genres.find((genre) => {
    return genre.id === value
  }).name
})

Vue.filter('getCountryText', function(value) {
  if (!value) return ''
  const result = store.getters.countries.find((country) => {
    return country.id === value
  })
  if (store.getters.settings.locale === 'en') {
    return result.name
  }
  return result.ru_name
})

Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 3,
  newestOnTop: true,
  position: "bottom-right",
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: false,
  draggable: true,
  draggablePercent: 0.7,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false,
});

new Vue({
  vuetify,
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')

