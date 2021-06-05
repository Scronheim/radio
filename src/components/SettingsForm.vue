<template>
  <v-card-text>
    <v-row>
      <v-col>
        <v-select :label="$t('settings.locale')" :items="['ru', 'en']" v-model="settings.locale"/>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script>
export default {
  name: "SettingsForm",
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
}
</script>

<style scoped>

</style>
