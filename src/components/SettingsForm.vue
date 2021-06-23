<template>
  <v-card-text>
    <v-row>
      <v-col>
        <v-select :label="$t('settings.locale')" :items="['ru', 'en']" v-model="$store.getters.settings.locale"/>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script>
export default {
  name: "SettingsForm",
}
</script>

<style scoped>

</style>
