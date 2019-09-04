function getRandomInt (min, max) {
  // min,max之间的随机数（包含min,max）
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle (arr) {
  // 新建一个arr的副本,保留arr数据不变
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

export const uniq = arr => [...new Set(arr)]
