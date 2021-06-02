<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
    <v-footer absolute>
      <player/>
    </v-footer>
  </v-app>
</template>

<script>
import Player from "@/components/Player"
export default {
  name: 'App',
  components: {Player},
  mounted() {
    this.$vuetify.theme.dark = true
    Promise.all([this.$store.dispatch('getStations'), this.$store.dispatch('getGenres')]).then(() => {
      this.$store.commit('fillCategories')
    })
  },
};
</script>

<style>

</style>
