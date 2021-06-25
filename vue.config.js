module.exports = {
  productionSourceMap: false,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      productName: "Radio",
      appId: "ru.scronheim.radio",
      files: [
        "dist_electron/bundled/*"
      ],
      publish: [
        {
          provider: "github",
          owner: "scronheim",
          repo: "radio"
        }
      ],
      linux: {
        publish: [
          "github"
        ],
        category: "media",
        icon: "dist_electron/icon64.png",
        target: [
          "AppImage"
        ]
      },
      win: {
        publish: [
          "github"
        ],
        icon: "dist_electron/icon64.png",
        target: [
          "nsis"
        ]
      }
    }
  },
  transpileDependencies: [
    'vuetify'
  ],
}
