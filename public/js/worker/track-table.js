// self.onmessage = function (event) {
//   const data = event.data
//   let { songs, likeIds } = data
//   songs.forEach(song => {
//     if (likeIds.includes(song.id)) {
//       song.isLiked = true
//     }
//   })
//   self.postMessage({ songs, likeIds })
// }
self.onmessage = function (event) {
  const data = event.data
  let { songs, id } = data
  let index = songs.findIndex(song => song.id == id)
  self.postMessage({index, id})
}
