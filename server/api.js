"use strict";
const express = require('express')
const mysqldb = require('./db')
const bodyParser = require('body-parser')
const moment = require('moment')
const _ = require('lodash')
const axios = require('axios')
const DomParser = require('dom-parser');
const parser = new DomParser();

const db = new mysqldb();
const app = express();
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


router.get('/api/genres', (req, res) => {
  db.selectGenres().then((response) => {
    response.forEach((genre) => {
      genre.children = []
    })
    jsonResponse(res, response)
  });
});

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
        result = dom.getElementsByClassName('streamdata')[7].innerHTML
      })
      break
  }
  jsonResponse(res, result)
});

app.use(router)


async function checkCurrentSong(host) {
  return await axios.get(host)
}


function jsonResponse(res, data, errors=[], success=true, code=200) {
  return res.json({
    data: data,
    success: success,
    errors: errors,
    code: code
  })
}


app.listen(3001, function() {
  console.log('Express server listening on port 3001')
});
