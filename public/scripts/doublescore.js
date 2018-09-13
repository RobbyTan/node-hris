let __ = (function () {

  function toMiliSeconds(time) {
    let timeParts = time.split(':')
    let h = timeParts[0] ? +timeParts[0] * 60 * 60 * 1000 : 0
    let m = timeParts[1] ? +timeParts[1] * 60 * 1000 : 0
    let s = timeParts[2] ? +timeParts[2] * 1000 : 0
    return h + m + s
  }

  return {
    toMiliSeconds
  }

})()