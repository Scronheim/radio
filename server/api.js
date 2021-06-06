"use strict";
const express = require('express')
const cors = require('cors')
const mysqldb = require('./db')
const bodyParser = require('body-parser')
const moment = require('moment')
const _ = require('lodash')
const axios = require('axios')
const DomParser = require('dom-parser');
const parser = new DomParser();

const db = new mysqldb();
const app = express();
app.use(cors())
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

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

router.post('/api/current_song', async (req, res) => {
  const serverType = req.body.server_type
  let result
  switch (serverType) {
    case 'shoutcast':
      await checkCurrentSong(req.body.song_src).then((response) => {
        result = response.data
      })
      break
    case 'icecast':
      await checkCurrentSong(req.body.song_src).then((response) => {
        const dom = parser.parseFromString(response.data);
        // const xml = response.data
        // const parser = new DOMParser()
        // const parsed = parser.parseFromString(xml, 'application/xml')
        result = dom.getElementsByClassName('streamdata')[req.body.icecast_song_field_number].innerHTML
      })
      break
  }
  jsonResponse(res, result)
});

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
