import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

// console.log('userData', remote.app.getPath('userData'))
let db = {}
let config = {
  autoload: true,
  timestampData: true
}
let userDataPath = remote.app.getPath('userData')
db.download = new Datastore({
  ...config,
  filename: path.join(userDataPath, '/download.db')
})
db.test = new Datastore({
  ...config,
  filename: path.join(userDataPath, '/test.db')
})
db.lyric = new Datastore({
  ...config,
  filename: path.join(userDataPath, '/lyric.db')
})

export default db
