import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'
console.log(remote.app.getPath('userData'))
let db = {}
db.download = new Datastore({
  autoload: true,
  timestampData: true,
  filename: path.join(remote.app.getPath('userData'), '/download.db')
})
db.test = new Datastore({
  autoload: true,
  timestampData: true,
  filename: path.join(remote.app.getPath('userData'), '/test.db')
})
db.lyric = new Datastore({
  autoload: true,
  timestampData: true,
  filename: path.join(remote.app.getPath('userData'), '/lyric.db')
})
// export default new Datastore({
//   autoload: true,
//   filename: path.join(remote.app.getPath('userData'), '/data.db')
// })
export default db
