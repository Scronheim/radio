<template>
  <v-card-text>
    <v-row>
      <v-col>
        <v-text-field dense :label="$t('newGenre.name')" v-model="genre.name"/>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script>
export default {
  name: "GenreForm",
  props: {
    genre: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>

</style>
