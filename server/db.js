"use strict"
const STATIONS_TABLE = 'stations'
const GENRES_TABLE = 'genres'
const COUNTRIES_TABLE = 'countries'

class DB {
  constructor() {
    this.db = require('knex')({
      log: {
        warn(message) {
          console.log(message)
        },
        error(message) {
          console.log(message)
        },
      },
      client: 'mysql2',
      connection: {
        // 192.168.112.2 - внутренний адрес в докере
        host: '127.0.0.1',
        user: 'scronheim',
        password: '2360087',
        database: 'radio',
        dateStrings: 'date'
      },
    });
  }

  selectStations() {
    return this.db.select().from(STATIONS_TABLE).orderBy('id', 'desc');
  }

  selectGenres() {
    return this.db.select().from(GENRES_TABLE).orderBy('name', 'asc')
  }

  selectCountries() {
    return this.db.select().from(COUNTRIES_TABLE).orderBy('name', 'asc')
  }

  insertStation(station) {
    return this.db(STATIONS_TABLE).insert(station)
  }

  insertCountry(country) {
    return this.db(COUNTRIES_TABLE).insert(country)
  }

  insertGenre(genre) {
    return this.db(GENRES_TABLE).insert(genre)
  }

  updateGenre(genre) {
    return this.db(GENRES_TABLE).where('id', '=', genre.id).update(genre)
  }

  updateCountry(country) {
    return this.db(COUNTRIES_TABLE).where('id', '=', country.id).update(country)
  }

  deleteGenre(id) {
    return this.db(GENRES_TABLE).where('id', id).delete()
  }

  deleteCountry(id) {
    return this.db(COUNTRIES_TABLE).where('id', id).delete()
  }

  deleteStation(id) {
    return this.db(STATIONS_TABLE).where('id', id).delete()
  }

  updateStation(station) {
    return this.db(STATIONS_TABLE).where('id', '=', station.id).update(station)
  }
}
module.exports = DB;
