function typeOf (obj) {
  const toString = Object.prototype.toString
  const map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  }
  return map[toString.call(obj)]
}

function deepCopy (data) {
  const t = typeOf(data)
  let o

  if (t === 'array') {
    o = []
  } else if (t === 'object') {
    o = {}
  } else {
    return data
  }

  if (t === 'array') {
    for (let i = 0; i < data.length; i++) {
      o.push(deepCopy(data[i]))
    }
  } else if (t === 'object') {
    for (let i in data) {
      o[i] = deepCopy(data[i])
    }
  }
  return o
}

async function errorCaptured (promise) {
  try {
    let res = await promise
    return [null, res]
  } catch (error) {
    return [error, null]
  }
}

function uniqueData (arr) {
  let result = []
  let map = {}
  arr.forEach(function (item) {
    if (!map[item.id]) {
      result.push(item)
      map[item.id] = true
    }
  })
  return result
}

export { deepCopy, errorCaptured, uniqueData }
