let __ = (function () {

  function toMiliSeconds(time) {
    let timeParts = time.split(':')
    let h = timeParts[0] ? +timeParts[0] * 60 * 60 * 1000 : 0
    let m = timeParts[1] ? +timeParts[1] * 60 * 1000 : 0
    let s = timeParts[2] ? +timeParts[2] * 1000 : 0
    return h + m + s
  }

  function toHHMMSS(milliseconds) {
    function pad2(i) {
      if (i <= 9) return '0' + i;
      return i;
    }
    let h = Math.floor(milliseconds / (60 * 60 * 1000));
    milliseconds %= (60 * 60 * 1000);
    let m = Math.floor(milliseconds / (60 * 1000));
    milliseconds %= (60 * 1000);
    let s = Math.floor(milliseconds / (1000));
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }

  return {
    toMiliSeconds,
    toHHMMSS
  }

})()