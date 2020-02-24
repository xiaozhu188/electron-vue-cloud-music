export function debounce (func, wait) {
  let timer = null
  return function () {
    let args = arguments
    let context = this
    timer && clearTimeout(timer)
    timer = setTimeout(function () {
      func.apply(context, args)
    }, wait)
  }
}
