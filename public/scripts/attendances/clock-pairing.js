let ClockPairing = (function() {
  let dosenTidakTetapMaxTime;
  let validateClockInRange;
  let validateClockOutRange;
  let validateDurationRange;

  function _toMiliSeconds(time) {
    let timeParts = time.split(":");
    let h = timeParts[0] ? +timeParts[0] * 60 * 60 * 1000 : 0;
    let m = timeParts[1] ? +timeParts[1] * 60 * 1000 : 0;
    let s = timeParts[2] ? +timeParts[2] * 1000 : 0;
    return h + m + s;
  }

  //clocks adalah array of moment object
  function _getClockPairs(clocks) {
    if (clocks.length === 0) return null;

    //sort ascending
    clocks.sort((a, b) => a.valueOf() - b.valueOf());

    let currentClock = clocks[0]; //clock valid pertama
    let validClocks = [currentClock];

    //cari semua clock valid
    for (let i = 1; i < clocks.length; i++) {
      //apabila selisih lebih dari 15 menit (dalam milliseconds), berarti valid
      if (clocks[i].diff(currentClock) > 15 * 60 * 1000) {
        currentClock = clocks[i];
        validClocks.push(clocks[i]);
      }
    }

    //pairing semua clock valid
    let clockPairs = [];
    for (let i = 0; i < validClocks.length; i += 2) {
      if (!validClocks[i + 1]) { //kalau tidak punya pasangan sign out
        clockPairs.push({
          clockIn: validClocks[i],
          clockOut: null,
          duration: 0
        });
      } else { //kalo pasangan absensi lengkap/rapi
        clockPairs.push({
          clockIn: validClocks[i],
          clockOut: validClocks[i + 1],
          duration: moment.utc(validClocks[i + 1].diff(validClocks[i]))
        });
      }
    }
    return clockPairs;
  }

  function _clockValidatorFactory(pRanges, color) {
    return function (clock) {
      let ranges = pRanges;
      for (let range of ranges) {
        // kalau ada yang match, return clock nya aja
        if (_toMiliSeconds(range[0]) <= _toMiliSeconds(clock) && _toMiliSeconds(clock) <= _toMiliSeconds(range[1])) {
          return clock;
        }
      }
      // kalau tidak ada yang match, return clock yg sudah di-flag
      return `<span style="color: white; background: ${color};">${clock}</span>`;
    }
  };

  function _getFlaggedClockPairs(clockPairs, isDosenTidakTetap) {
    let clockPairsDisplay;
    if (isDosenTidakTetap) { // jika Dosen Tidak Tetap
      clockPairsDisplay = clockPairs.reduce((acc, cur) => {
        let clockInTime = validateClockInRange(cur.clockIn.format("HH:mm:ss"));
        let clockOutTime = cur.clockOut ? validateClockOutRange(cur.clockOut.format("HH:mm:ss")) :
          `<span style="color: white; background: orange;">[empty]</span>`;
        let durationTime = cur.duration ? `(${ validateDurationRange(cur.duration.format("HH:mm:ss")) })` : "";
        return acc + `${clockInTime} - ${clockOutTime} ${durationTime}<br><br>`
      }, "");
    } else {
      clockPairsDisplay = clockPairs.reduce((acc, cur) => {
        let clockInTime = cur.clockIn.format("HH:mm:ss");
        let clockOutTime = cur.clockOut ? cur.clockOut.format("HH:mm:ss") : "[empty]";
        let durationTime = cur.duration ? `(${cur.duration.format("HH:mm:ss")})` : "";
        return acc + `${clockInTime} - ${clockOutTime} ${durationTime}<br><br>`
      }, "");
    }
    return clockPairsDisplay;
  }

  function _getTotalWorkingTime(clockPairs, isDosenTidakTetap) {
    let totalWorkingTime;
    if (isDosenTidakTetap) { // jika Dosen Tidak Tetap
      totalWorkingTime = moment.utc(clockPairs.reduce(
        (acc, cur) =>
        acc + Math.min(_toMiliSeconds(dosenTidakTetapMaxTime), cur.duration.valueOf()), 0))
        .format("HH:mm:ss");
    } else {
      totalWorkingTime = moment.utc(clockPairs.reduce(
        (acc, cur) => acc + cur.duration.valueOf(), 0)).format("HH:mm:ss");
    }
    return totalWorkingTime;
  }

  function process(clocks, options) {
    let department = options.department;
    dosenTidakTetapMaxTime = options.dosenTidakTetapMaxTime;
    validateClockInRange = _clockValidatorFactory([["08:45", "09:15"], ["17:15", "17:45"]], "rgb(244,72,66)");
    validateClockOutRange = _clockValidatorFactory([["12:15", "12:45"], ["20:45", "21:15"]], "rgb(244,72,66)");
    validateDurationRange = _clockValidatorFactory([[dosenTidakTetapMaxTime, "23:59"]], "rgb(173,244,66)");

    let clockPairs = _getClockPairs(clocks);
    let flaggedClockPairs = _getFlaggedClockPairs(clockPairs, department === 'Dosen Tidak Tetap');
    let totalWorkingTime = _getTotalWorkingTime(clockPairs, department === 'Dosen Tidak Tetap');

    return {
      clockPairs: clockPairs,
      flaggedClockPairs: flaggedClockPairs,
      totalWorkingTime: totalWorkingTime
    };
  }

  return {
    process: process
  };
})();
