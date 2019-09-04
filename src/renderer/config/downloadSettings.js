const { remote } = require('electron')
console.log('remote', remote)
export const defaultDownloadFolder = 'C:\\CloudMusicDownload'
// `${remote.app.getPath('music')}\\CloudMusicDownload`
