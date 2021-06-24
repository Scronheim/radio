<template>
  <v-card-text>
    <v-row>
      <v-col>
        <v-select dense :label="$t('settings.locale')" :items="['ru', 'en']" v-model="$store.getters.settings.locale"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-select dense :label="$t('settings.themeText')" :items="$t('settings.themes')" v-model="$store.getters.settings.theme"/>
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
