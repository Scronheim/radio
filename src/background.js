'use strict'
import { app, protocol, ipcMain, BrowserWindow, Menu, Tray } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const fs = require('fs')
const path = require('path')
const { autoUpdater } = require('electron-updater')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
Menu.setApplicationMenu(null)
let win
let tray = null

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1400,
    height: 880,
    title: `Radio v${app.getVersion()}`,
    icon: 'public/icon512.png',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false,
      enableRemoteModule: true
    },
    frame: false,
  })
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  win.webContents.on('new-window', function(e, url) {
    e.preventDefault()
    require('electron').shell.openExternal(url)
  })

  // win.once('ready-to-show', () => {
  //   autoUpdater.checkForUpdatesAndNotify()
  // })

}

app.whenReady().then(() => {
  tray = new Tray('public/icon512.png')
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Play', type: 'normal', click: sendPlay},
    {label: 'Pause', type: 'normal', click: sendPause},
    {label: 'Quit', role: 'quit'},
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
})

function sendPlay(item, window, event) {
  win.webContents.send('play')
}

function sendPause(item, window, event) {
  win.webContents.send('pause')
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

const imagePath = path.join(app.getPath('userData'), 'images')
ipcMain.handle('read-station-logo', async (event, id) => {
  const files = fs.readdirSync(imagePath)
  for (const file of files) {
    const basename = parseInt(file.split('.')[0])
    if (basename !== id) {
      continue
    }
    return fs.promises.readFile(`${imagePath}/${file}`)
  }
})

// HACK(mc, 2019-09-10): work around https://github.com/electron-userland/electron-builder/issues/4046
if (process.env.DESKTOPINTEGRATION === 'AppImageLauncher') {
  // remap temporary running AppImage to actual source
  // THIS IS PROBABLY SUPER BRITTLE AND MAKES ME WANT TO STOP USING APPIMAGE
  autoUpdater.logger.info('rewriting $APPIMAGE', {
    oldValue: process.env.APPIMAGE,
    newValue: process.env.ARGV0,
  })
  process.env.APPIMAGE = process.env.ARGV0
} else {
  autoUpdater.logger.info('Not running in AppImageLauncher')
}

autoUpdater.on('download-progress', (progressObj) => {
  win.webContents.send('download-progress', progressObj)
})

autoUpdater.on('update-available', (release) => {
  win.webContents.send('update_available', release)
})

autoUpdater.on('update-not-available', (release) => {
  win.webContents.send('update_not_available', release)
})

autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update_downloaded')
})

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() })
})

ipcMain.handle('check-updates', () => {
  autoUpdater.checkForUpdates()
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  ipcMain.on('save-file', (ev, payload) => {
    if (!fs.existsSync(imagePath)) {
      fs.mkdir(imagePath, function (err) {
        if (err) {
          console.log('Directory not created')
        } else {
          fs.writeFileSync(`${imagePath}/${payload.name}`, new Buffer.from(payload.buffer))
        }
      })
    } else {
      fs.writeFileSync(`${imagePath}/${payload.name}`, new Buffer.from(payload.buffer))
    }
  })

  createWindow()
})


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
