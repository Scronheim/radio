module.exports = {
  pluginOptions: {
    electronBuilder: {
      "build": {
        "productName": "Radio",
        "appId": "ru.sconheim.radio",
        "directories": {
          "output": "build"
        },
        "files": [
          "dist_electron/bundled/*"
        ],
        "publish": [
          {
            "provider": "github",
            "owner": "scronheim",
            "repo": "radio"
          }
        ],
        "linux": {
          "publish": [
            "github"
          ],
          "category": "media",
          "icon": "dist_electron/icon64.png",
          "target": [
            "AppImage"
          ]
        },
        "win": {
          "publish": [
            "github"
          ],
          "icon": "dist_electron/icon64.png",
          "target": [
            "nsis"
          ]
        }
      },
      nodeIntegration: true
    }
  },
  transpileDependencies: [
    'vuetify'
  ],
}
