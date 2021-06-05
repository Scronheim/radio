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

Vue.config.productionTip = false
Vue.prototype.$_ = _

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

Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 3,
  newestOnTop: true,
  position: "top-right",
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

