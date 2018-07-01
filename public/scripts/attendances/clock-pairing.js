// module untuk pairing clock-clock per orang per hari
let ClockPairing = (function() {

  let telat;

  function _toMiliSeconds(time) {
    let timeParts = time.split(":");
    let h = timeParts[0] ? +timeParts[0] * 60 * 60 * 1000 : 0;
    let m = timeParts[1] ? +timeParts[1] * 60 * 1000 : 0;
    let s = timeParts[2] ? +timeParts[2] * 1000 : 0;
    return h + m + s;
  }

  function _toHHMMSS(milliseconds) {
    let h = Math.floor(milliseconds/(60*60*1000));
    milliseconds %= (60*60*1000);
    let m = Math.floor(milliseconds/(60*1000));
    milliseconds %= (60*1000);
    let s = Math.floor(milliseconds/(1000));
    return `${h}:${m}:${s}`;
  }

  //clocks adalah array of moment object
  function _getClockPairs(clocks) {
    if (!clocks || clocks.length === 0) return null;

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

  function _getAttendancePairs(attendances) {
    if (!attendances || attendances.length === 0) return null;
    for (let i = 0; i < attendances.length; i++) attendances[i].date = moment(attendances[i].date);
    //sort ascending
    attendances.sort((a, b) => a.date.valueOf() - b.date.valueOf());

    let currentAttendance = attendances[0]; //clock valid pertama
    let validAttendances = [currentAttendance];
    //cari semua clock valid
    for (let i = 1; i < attendances.length; i++) {
      //apabila selisih lebih dari 15 menit (dalam milliseconds), berarti valid
      if (attendances[i].date.diff(currentAttendance.date) > 15 * 60 * 1000) {
        currentClock = attendances[i];
        validAttendances.push(attendances[i]);
      }
    }
    //pairing semua clock valid
    let attendancePairs = [];
    for (let i = 0; i < validAttendances.length; i += 2) {
      if (!validAttendances[i + 1]) { //kalau tidak punya pasangan sign out
        attendancePairs.push({
          attendanceIn: validAttendances[i],
          attendanceOut: null,
          duration: 0
        });
      } else { //kalo pasangan absensi lengkap/rapi
        attendancePairs.push({
          attendanceIn: validAttendances[i],
          attendanceOut: validAttendances[i + 1],
          duration: moment.utc(validAttendances[i + 1].date.diff(validAttendances[i].date))
        });
      }
    }
    return attendancePairs;
  }

  function _clockValidatorFactory(pRanges, color) {
    let newClockValidator = function (clock) {
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
    return newClockValidator;
  };

  function _highlight(text, bColor, fColor) {
    return `<span style="color: ${fColor || 'white'}; background: ${bColor};">${text}</span>`;
  }
  function _highlightManualType(attendance) {
    if (attendance.type && attendance.type === 'manual') {
      return _highlight(attendance.date.format('HH:mm:ss'), 'orange');
    }
    return null;
  }

  function _getFlaggedClockPairs(paramAttendancePairs, options) {
    if (!paramAttendancePairs || !paramAttendancePairs.length) return '-';
    let attendancePairs = paramAttendancePairs.slice();
    let attendancePairsDisplay = '';
    if (['Dosen Tidak Tetap'].includes(options.department.trim())) { // jika Dosen Tidak Tetap
      let validateClockInRange = _clockValidatorFactory([["08:45", "09:15"], ["17:15", "17:45"]], "rgb(244,72,66)");
      let validateClockOutRange = _clockValidatorFactory([["12:15", "12:45"], ["20:45", "21:15"]], "rgb(244,72,66)");
      let validateDurationRange = _clockValidatorFactory([[options.dosenTidakTetapMaxTime, "23:59"]], "rgb(173,244,66)");
      attendancePairsDisplay = attendancePairs.reduce((acc, cur) => {
        let clockInTime = _highlightManualType(cur.attendanceIn) || validateClockInRange(cur.attendanceIn.date.format("HH:mm:ss"));
        let clockOutTime = cur.attendanceOut ? _highlightManualType(cur.attendanceOut) || validateClockOutRange(cur.attendanceOut.date.format("HH:mm:ss")) : _highlight('[empty]', 'orange');
        let durationTime = cur.duration ? `(${ validateDurationRange(cur.duration.format("HH:mm:ss")) })` : '';
        return acc + `${clockInTime} - ${clockOutTime} ${durationTime}<br><br>`
      }, '');
    } else if (options.jamMasuk) { // terdapat jam masuk
      // let jamMasukToleransi = moment.utc(options.jamMasuk, 'HH:mm:ss').add(15,'minutes');
      let jamMasukToleransiMs = _toMiliSeconds(options.jamMasuk) + _toMiliSeconds('00:15:00');
      // let validateJamMasuk = _clockValidatorFactory([["00:00", jamMasukToleransi.format('HH:mm:ss')]], "rgb(244,72,66)");
      let validateJamMasuk = _clockValidatorFactory([["00:00", _toHHMMSS(jamMasukToleransiMs)]], "rgb(244,72,66)");
      attendancePairsDisplay = (cur => {
        if (validateJamMasuk(cur.attendanceIn.date.format("HH:mm:ss")).length > 8 
            && !['Dosen Tidak Tetap', 'Mahasiswa Magang'].includes(options.department.trim())) telat = true;
        let clockInTime = _highlightManualType(cur.attendanceIn) || validateJamMasuk(cur.attendanceIn.date.format("HH:mm:ss"));
        let clockOutTime = cur.attendanceOut ? _highlightManualType(cur.attendanceOut) || cur.attendanceOut.date.format("HH:mm:ss") : _highlight('[empty]', 'orange');
        let durationTime = cur.duration ? `(${cur.duration.format("HH:mm:ss")})` : '';
        return `${clockInTime} - ${clockOutTime} ${durationTime}<br><br>`
      })(attendancePairs[0]);
      attendancePairs.shift();
      attendancePairsDisplay += attendancePairs.reduce((acc, cur) => {
        let clockInTime = _highlightManualType(cur.attendanceIn) || cur.attendanceIn.date.format("HH:mm:ss");
        let clockOutTime = cur.attendanceOut ? _highlightManualType(cur.attendanceOut) || cur.attendanceOut.date.format("HH:mm:ss") : _highlight('[empty]', 'orange');
        let durationTime = cur.duration ? `(${cur.duration.format("HH:mm:ss")})` : '';
        return acc + `${clockInTime} - ${clockOutTime} ${durationTime}<br><br>`
      }, '');
    } else { // tidak ketentuan khusus
      attendancePairsDisplay = attendancePairs.reduce((acc, cur) => {
        let clockInTime = _highlightManualType(cur.attendanceIn) || cur.attendanceIn.date.format("HH:mm:ss");
        let clockOutTime = cur.attendanceOut ? _highlightManualType(cur.attendanceOut) || cur.attendanceOut.date.format("HH:mm:ss") : _highlight('[empty]', 'orange');
        let durationTime = cur.duration ? `(${cur.duration.format("HH:mm:ss")})` : '';
        return acc + `${clockInTime} - ${clockOutTime} ${durationTime}<br><br>`
      }, '');
    }
    return attendancePairsDisplay;
  }

  function _getTotalWorkingTime(clockPairs, options) {
    if (!clockPairs || !clockPairs.length) return '00:00:00';
    let totalWorkingTime;
    if (['Dosen Tidak Tetap'].includes(options.department.trim())) { // jika Dosen Tidak Tetap
      totalWorkingTime = moment.utc(clockPairs.reduce(
        (acc, cur) =>
        acc + Math.min(_toMiliSeconds(options.dosenTidakTetapMaxTime), cur.duration.valueOf()), 0))
        .format("HH:mm:ss");
    } else {
      totalWorkingTime = moment.utc(clockPairs.reduce(
        (acc, cur) => acc + cur.duration.valueOf(), 0)).format("HH:mm:ss");
    }
    return totalWorkingTime;
  }

  function _getFlaggedTotalWorkingTime(clockPairs, options) {
    if (!clockPairs || !clockPairs.length) return '00:00:00';
    let totalWorkingTime = _getTotalWorkingTime(clockPairs, options);
    let flaggedTotalWorkingTime = totalWorkingTime;
    if (['Sunday', 'Saturday'].includes(clockPairs[0].clockIn.format('dddd'))) {
      let validateDuration = _clockValidatorFactory([['02:00', '23:59']], 'rgb(173,244,66)');
      flaggedTotalWorkingTime = validateDuration(totalWorkingTime);
    } else if (['Dosen Tidak Tetap', 'Mahasiswa Magang'].includes(options.department.trim())) { // jika Pegawai Tidak Tetap
      flaggedTotalWorkingTime = totalWorkingTime;
    } else {    // jika Pegawai Tetap
      if (clockPairs.length == 1) {
        let validateDuration = _clockValidatorFactory([['09:00', '23:59']], 'rgb(173,244,66)');
        flaggedTotalWorkingTime = validateDuration(totalWorkingTime);
      } else if (clockPairs.length >= 2) {
        let validateDuration = _clockValidatorFactory([['08:00', '23:59']], 'rgb(173,244,66)');
        flaggedTotalWorkingTime = validateDuration(totalWorkingTime);
      }
    }
    return flaggedTotalWorkingTime;
  }

  function process(attendances, options) {
    let clocks = attendances.map(att => moment(att.date));
    let clockPairs = _getClockPairs(clocks);
    let attendancePairs = _getAttendancePairs(attendances);
    telat = false;
    let flaggedClockPairs = _getFlaggedClockPairs(attendancePairs, options);
    let totalWorkingTime = _getTotalWorkingTime(clockPairs, options);
    let flaggedTotalWorkingTime = _getFlaggedTotalWorkingTime(clockPairs, options);
    return {
      clockPairs: clockPairs,
      flaggedClockPairs: flaggedClockPairs,
      totalWorkingTime: totalWorkingTime,
      flaggedTotalWorkingTime: flaggedTotalWorkingTime,
      telat: telat
    };
  }

  return {
    process: process
  };
})();
