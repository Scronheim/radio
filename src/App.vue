<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
    <v-footer fixed>
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
    this.$store.dispatch('refresh')
    this.$store.commit('setWebSocket')
  },
};
</script>

<style>

</style>
