export function normalPlaylistCard (playlist) {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    creator: playlist.creator,
    playCount: playlist.playCount,
    picUrl: playlist.coverImgUrl || playlist.picUrl
  }
}
