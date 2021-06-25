<template>
  <div>

  </div>
</template>

<script>
// import Player from "@/components/Player"
export default {
  name: 'App',
  // components: {Player},
  mounted() {
    this.$store.dispatch('refresh').then(() => {
      this.$vuetify.theme.dark = this.$store.getters.settings.theme === 'dark';
    })
    this.$store.commit('setWebSocket')
  },
};
</script>

<style>

</style>
