<template>
  <v-card-text>
    <v-tabs vertical v-model="tab">
      <v-tab>
        <v-icon left>
          mdi-cog
        </v-icon>
        {{ $t('texts.general') }}
      </v-tab>
      <v-tab>
        <v-icon left>
          mdi-brush
        </v-icon>
        {{ $t('texts.decor') }}
      </v-tab>
      <v-tab>
        <v-icon left>
          mdi-help-circle
        </v-icon>
        {{ $t('texts.about') }}
      </v-tab>

      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <v-row>
              <v-col>
                <v-select dense :label="$t('settings.locale')" :items="['ru', 'en']" v-model="$store.getters.settings.locale"/>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <v-row>
              <v-col>
                <v-select dense :label="$t('settings.themeText')" :items="['dark', 'light']" v-model="$store.getters.settings.theme"/>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-card
            class="mx-auto"
            color="#26c6da"
            dark
            max-width="400"
        >
          <v-card-title>
            <v-icon large left>
              mdi-twitter
            </v-icon>
            <span class="text-h6 font-weight-light">Twitter</span>
          </v-card-title>

          <v-card-text class="text-h5 font-weight-bold">
            {{ $t('texts.slogan') }}
          </v-card-text>

          <v-card-actions>
            <v-list-item class="grow">
              <v-list-item-avatar color="grey darken-3">
                <v-img class="elevation-6"
                       src="https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light"
                ></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>Scronheim</v-list-item-title>
              </v-list-item-content>

              <v-row align="center" justify="end">
                <v-btn icon @click="openGithub">
                  <v-icon class="mr-1">
                    mdi-github
                  </v-icon>
                </v-btn>
                <span class="subheading mr-2">v{{ $store.getters.version }}</span>
              </v-row>
            </v-list-item>
          </v-card-actions>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </v-card-text>
</template>

<script>
export default {
  name: "SettingsForm",
  data: () => ({
    tab: 0
  }),
  methods: {
    openGithub() {
      window.open('https://github.com/scronheim/radio')
    }
  }
}
</script>

<style scoped>

</style>
