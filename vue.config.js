module.exports = {
  productionSourceMap: false,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: 'public/icon512.png'
        },
        linux: {
          category: 'AudioVideo',
          icon: 'public/icon512.png'
        }
      },
      nodeIntegration: true,
      productName: "Radio",
      appId: "ru.scronheim.radio",
      publish: [
        {
          provider: "github",
          owner: "scronheim",
          repo: "radio",
        }
      ],
    }
  },
  transpileDependencies: [
    'vuetify'
  ],
}
