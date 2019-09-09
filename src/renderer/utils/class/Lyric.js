/**
 * https://github.com/ustbhuangyi/lyric-parser
 */
const TIME_REG_WY = /\[(\d{2,}):(\d{2})(\.|:)(\d{1,3})?\]/g

const STATE_PAUSE = 0
const STATE_PLAYING = 1

function noop () {
}

export default class Lyric {
  constructor (lrc, hanlder = noop, delay = 0) {
    this.lrc = lrc
    this.lines = []
    this.handler = hanlder
    this.state = STATE_PAUSE
    this.curLine = 0
    this.delay = delay
    this._init()
  }

  _init () {
    this._initLines()
  }

  _initLines () {
    const _this = this
    const lines = _this.lrc.split('\n')

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      line.replace(TIME_REG_WY, function (item) {
        const result = TIME_REG_WY.exec(item)
        if (result) {
          const txt = line.replace(TIME_REG_WY, '').trim()
          const min = result[1] * 60 * 1000
          const sec = result[2] * 1000
          const ms = result[4] && result[4].length ? (result[4].length == 2 ? (result[4] || 0) * 10 : (result[4] || 0) * 1) : 0
          const time = min + sec + ms
          if (txt !== '') {
            _this.lines.push({
              time,
              txt
            })
          }
        }
      })
    }

    if (!_this.lines.length) {
      _this.lines.push({
        time: 0,
        txt: this.lrc !== '' ? this.lrc : '暂无歌词'
      })
    }
    _this.lines.sort((a, b) => {
      return a.time - b.time
    })
  }

  resetTime (delay) {
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].time += delay
    }
  }

  findLyricByTime (time) {
    let curNum = this._findCurNum(time)
    return this.lines[curNum]
  }

  _findCurNum (time) {
    for (let i = 0; i < this.lines.length; i++) {
      if (time <= this.lines[i].time) {
        return i
      }
    }
    return this.lines.length - 1
  }

  _callHandler (i) {
    if (i < 0) {
      return
    }
    this.handler({
      txt: this.lines[i].txt,
      lineNum: i
    })
  }

  _playRest () {
    let line = this.lines[this.curNum]
    let delay = line.time < 0 ? 0 : line.time - (+new Date() - this.startStamp) + this.delay
    // console.log(delay)
    // delay = delay + 1000
    this.timer = setTimeout(() => {
      this._callHandler(this.curNum++)
      if (this.curNum < this.lines.length && this.state === STATE_PLAYING) {
        this._playRest()
      }
    }, delay)
  }

  play (startTime = 0, skipLast) {
    if (!this.lines.length) {
      return
    }
    this.state = STATE_PLAYING

    this.curNum = this._findCurNum(startTime)
    this.startStamp = +new Date() - startTime

    if (!skipLast) {
      this._callHandler(this.curNum - 1)
    }

    if (this.curNum < this.lines.length) {
      clearTimeout(this.timer)
      this._playRest()
    }
  }

  togglePlay () {
    var now = +new Date()
    if (this.state === STATE_PLAYING) {
      this.stop()
      this.pauseStamp = now
    } else {
      this.state = STATE_PLAYING
      this.play((this.pauseStamp || now) - (this.startStamp || now), true)
      this.pauseStamp = 0
    }
  }

  stop () {
    this.state = STATE_PAUSE
    clearTimeout(this.timer)
  }

  seek (offset) {
    this.play(offset)
  }
}
