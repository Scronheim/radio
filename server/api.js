"use strict";
const express = require('express')
const cors = require('cors')
const mysqldb = require('./db')
const bodyParser = require('body-parser')
const axios = require('axios')
const DomParser = require('dom-parser')
const parser = new DomParser()
const webSocket = require('ws')

const db = new mysqldb()
const app = express()
const wss = new webSocket.Server({port: 8080})

wss.on('connection', function connection(ws) {
  console.log('ws connected')
  ws.on('message', async function incoming(message) {
    const msg = JSON.parse(message)
    const station = msg.station
    if (msg.event === 'getCurrentTrack') {
      let socket
      if (station.server_type === '101.ru') {
        socket = new webSocket(`wss://101.ru:8133/?channelName=channelchannel${station['101_channel_id']}&type=pc`)
        socket.onmessage = (event) => {
          let json = JSON.parse(event.data)
          ws.send(json.result.short.title)
          socket.close()
        }
      } else if (station.server_type === 'shoutcast') {
        await checkCurrentSong(station.song_src).then((response) => {
          ws.send(response.data)
        })
      } else if (station.server_type === 'icecast') {
        await checkCurrentSong(station.song_src).then((response) => {
          const dom = parser.parseFromString(response.data)
          if (dom.getElementsByClassName('streamdata').length) {
            ws.send(dom.getElementsByClassName('streamdata')[station.icecast_song_field_number].innerHTML)
          } else {
            ws.send(dom.getElementsByClassName('streamstats')[station.icecast_song_field_number].innerHTML)
          }
        })
      }
    }
  })
});

app.use(cors())
const router = express.Router()

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.route('/api/stations')
  .get((req, res) => {
    db.selectStations().then((response) => {
      jsonResponse(res, response)
    })
  })
  .post((req, res) => {
    db.insertStation(req.body).then((response) => {
      jsonResponse(res, response)
    })
  })
  .patch((req, res) => {
    db.updateStation(req.body).then((response) => {
      jsonResponse(res, response)
    })
  })


router.route('/api/genres')
  .get((req, res) => {
    db.selectGenres().then((response) => {
      jsonResponse(res, response)
    });
  })
  .post((req, res) => {
    db.insertGenre(req.body).then((response) => {
      jsonResponse(res, response)
    }).catch((error) => {
      jsonResponse(res, null, error.sqlMessage, false)
    })
})
  .patch((req, res) => {
    db.updateGenre(req.body).then((response) => {
      jsonResponse(res, response)
    }).catch((error) => {
      jsonResponse(res, null, error.sqlMessage, false)
    })
  })

router.delete('/api/stations/:id', (req, res) => {
  db.deleteStation(req.params.id).then((response) => {
    jsonResponse(res, response)
  }).catch((error) => {
    jsonResponse(res, null, {message: error.sqlMessage, code: error.errno}, false)
  })
})


router.delete('/api/genres/:id', (req, res) => {
  db.deleteGenre(req.params.id).then((response) => {
    jsonResponse(res, response)
  }).catch((error) => {
    jsonResponse(res, null, {message: error.sqlMessage, code: error.errno}, false)
  })
})

app.use(router)

async function checkCurrentSong(host) {
  return await axios.get(host)
}

function jsonResponse(res, data, error, success=true) {
  if (error) res.status(400)
  return res.json({
    data: data,
    success: success,
    error: error,
  })
}

const port = 3001
app.listen(port, function() {
  console.log(`Express server listening on port ${port}`)
});
