const MongoClient = require('mongodb').MongoClient
// 获取操作数据库ID的方法
const ObjectID = MongoDB.ObjectID
const config = require('./config.js')
class DB {
  constructor() {
    this.dbClient = ''
    this.connect()
  }
  connect() {
    let that = this
    return new Promise((resolve, reject) => {
      if (!that.dbClient) {
        MongoClient.connect(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true },
          (err, client) => {
            if (err) {
              reject(err)
            } else {
              that.dbClient = client.db(config.dbName)
              resolve(that.dbClient)
            }
          })
      } else {
        resolve(that.dbClient)
      }
    })
  }
}