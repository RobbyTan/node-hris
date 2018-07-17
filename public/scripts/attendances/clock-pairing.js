// module untuk pairing clock-clock per orang per hari
let ClockPairing = (function() {

  let telat5;
  let telat15;
  let tidakClockOut;

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
        currentAttendance = attendances[i];
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

  function _produceFlag(color, content, tooltipMsg) {
    return `<span data-toggle="tooltip" data-placement="right" title="${tooltipMsg}" style="color:white; background:${color};">${content}</span>`;
  }

  function _clockValidatorFactory(pRanges, color, tooltipMsg) {
    let newClockValidator = function (clock) {
      let ranges = pRanges;
      for (let range of ranges) {
        // kalau ada yang match, return clock nya aja
        if (_toMiliSeconds(range[0]) <= _toMiliSeconds(clock) && _toMiliSeconds(clock) <= _toMiliSeconds(range[1])) {
          return clock;
        }
      }
      return _produceFlag(color, clock, tooltipMsg);
    } 
      "Telat diatas 15 Menit"
    return newClockValidator;
  };
  function _DTTFirstClockValidatorFactory(inClocks, tolerance, beforeColor, afterColor) {
    return function(myClock) {
      let myClockMs = _toMiliSeconds(myClock);
      let inClocksMs = inClocks.map(clock => _toMiliSeconds(clock));
      let toleranceMs = _toMiliSeconds(tolerance);
      let closestClockMs = -1, closestGap = 48*60*60*1000;
      for (let i = 0; i < inClocksMs.length; i++) {
        let currentGap = Math.abs(myClockMs - inClocksMs[i]);
        if (currentGap < closestGap) {
          closestClockMs = inClocksMs[i];
          closestGap = currentGap;
        }
      }
      let clockInTime, telat5 = false;
      if (closestClockMs - toleranceMs <= myClockMs && myClockMs <= closestClockMs + toleranceMs) {
        clockInTime = myClock;
      } else if (myClockMs < closestClockMs) {
        clockInTime = _produceFlag(beforeColor, myClock, 'DTT sebelum 15 menit');
      } else if (myClockMs > closestClockMs) {
        clockInTime = _produceFlag(afterColor, myClock, 'DTT setelah 15 menit');
      }
      if (myClockMs > closestClockMs && closestClockMs - myClockMs > 5*60*1000) {
        telat5 = true;
      }
      return {
        clockInTime: clockInTime,
        telat5: telat5
      };
    };
  }

  function _produceFlagManualClock(attendance) {
    if (attendance.type && attendance.type === 'manual') {
      return _produceFlag('orange', attendance.date.format('HH:mm:ss'), 'manual clock');
    }
    return null;
  }

  function _getFlaggedClockPairs(paramAttendancePairs, options) {
    if (!paramAttendancePairs || !paramAttendancePairs.length) return '-';
    let attendancePairs = paramAttendancePairs.slice();
    let attendancePairsDisplay = '';
    if (['Dosen Tidak Tetap'].includes(options.department.trim())) { // jika Dosen Tidak Tetap
      // let validateClockInRange = _clockValidatorFactory([["08:45", "09:15"], ["17:15", "17:45"]], "rgb(244,72,66)");
      let validateClockInRange = _DTTFirstClockValidatorFactory(['09:00', '17:30'], '00:15', 'rgb(44, 116, 232)', 'rgb(244,72,66)');
      let validateClockOutRange = _clockValidatorFactory([["12:15", "12:45"], ["20:45", "21:15"]], "rgb(244,72,66)", "DTT ClockOut diluar Range");
      let validateDurationRange = _clockValidatorFactory([[options.dosenTidakTetapMaxTime, "23:59"]], "rgb(173,244,66)", "DTT > 3.5 jam");
      attendancePairsDisplay = attendancePairs.reduce((acc, cur) => {
        let validationResult = validateClockInRange(cur.attendanceIn.date.format("HH:mm:ss"));
        let clockInTime = _produceFlagManualClock(cur.attendanceIn) || validationResult.clockInTime;
        telat5 = telat5 || validationResult.telat5;
        let clockOutTime = cur.attendanceOut ? 
          (_produceFlagManualClock(cur.attendanceOut) || validateClockOutRange(cur.attendanceOut.date.format("HH:mm:ss"))) : _produceFlag('orange', '[empty]', 'incomplete clock');
        let durationTime = cur.duration ? `(${ validateDurationRange(cur.duration.format("HH:mm:ss")) })` : '';
        return acc + `${clockInTime} - ${clockOutTime} ${durationTime}<br><br>`
      }, '');
    } else if (options.jamMasuk) { // terdapat jam masuk
      // let jamMasukToleransi = moment.utc(options.jamMasuk, 'HH:mm:ss').add(15,'minutes');
      // let validateJamMasuk15 = _clockValidatorFactory([["00:00", jamMasukToleransi.format('HH:mm:ss')]], "rgb(244,72,66)");
      let batasJamMasukToleransi5Ms = _toMiliSeconds(options.jamMasuk) + _toMiliSeconds('00:05:00');
      let batasJamMasukToleransi15Ms = _toMiliSeconds(options.jamMasuk) + _toMiliSeconds('00:15:00');
      let validateJamMasuk5 = _clockValidatorFactory([["00:00", _toHHMMSS(batasJamMasukToleransi5Ms)]], "rgb(244,72,66)", 'Telat 5 menit');
      let validateJamMasuk15 = _clockValidatorFactory([["00:00", _toHHMMSS(batasJamMasukToleransi15Ms)]], "rgb(244,72,66)", 'Telat 15 menit');
      attendancePairsDisplay = (cur => {
        // assign status telat
        if (!['Dosen Tidak Tetap', 'Mahasiswa Magang'].includes(options.department.trim())) {
          if (validateJamMasuk5(cur.attendanceIn.date.format("HH:mm:ss")).length > 8) telat5 = true;
          if (validateJamMasuk15(cur.attendanceIn.date.format("HH:mm:ss")).length > 8) telat15 = true;
        }

        let clockInTime = 
          _produceFlagManualClock(cur.attendanceIn) || validateJamMasuk15(cur.attendanceIn.date.format("HH:mm:ss"));
        let clockOutTime = cur.attendanceOut ? 
          (_produceFlagManualClock(cur.attendanceOut) || cur.attendanceOut.date.format("HH:mm:ss")) : _produceFlag('orange', '[empty]', 'incomplete clock');
        let durationTime = cur.duration ? `(${cur.duration.format("HH:mm:ss")})` : '';
        return `${clockInTime} - ${clockOutTime} ${durationTime}<br><br>`
      })(attendancePairs[0]);
      attendancePairs.shift();
      attendancePairsDisplay += attendancePairs.reduce((acc, cur) => {
        let clockInTime = _produceFlagManualClock(cur.attendanceIn) || cur.attendanceIn.date.format("HH:mm:ss");
        let clockOutTime = cur.attendanceOut ? 
          (_produceFlagManualClock(cur.attendanceOut) || cur.attendanceOut.date.format("HH:mm:ss")) : _produceFlag('orange', '[empty]', 'incomplete clock');
        let durationTime = cur.duration ? `(${cur.duration.format("HH:mm:ss")})` : '';
        return acc + `${clockInTime} - ${clockOutTime} ${durationTime}<br><br>`
      }, '');
    } else { // tidak ketentuan khusus
      attendancePairsDisplay = attendancePairs.reduce((acc, cur) => {
        let clockInTime = _produceFlagManualClock(cur.attendanceIn) || cur.attendanceIn.date.format("HH:mm:ss");
        let clockOutTime = cur.attendanceOut ? 
          (_produceFlagManualClock(cur.attendanceOut) || cur.attendanceOut.date.format("HH:mm:ss")) : _produceFlag('orange', '[empty]', 'incomplete clock');
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
      let validateDuration = _clockValidatorFactory([['02:00', '23:59']], 'rgb(173,244,66)', 'Weekend < 2 jam');
      flaggedTotalWorkingTime = validateDuration(totalWorkingTime);
    } else if (['Dosen Tidak Tetap', 'Mahasiswa Magang'].includes(options.department.trim())) { // jika Pegawai Tidak Tetap
      flaggedTotalWorkingTime = totalWorkingTime;
    } else {    // jika Pegawai Tetap
      if (clockPairs.length == 1) {
        let validateDuration = _clockValidatorFactory([['09:00', '23:59']], 'rgb(173,244,66)', 'Karyawan Tetap < 9 jam');
        flaggedTotalWorkingTime = validateDuration(totalWorkingTime);
      } else if (clockPairs.length >= 2) {
        let validateDuration = _clockValidatorFactory([['08:00', '23:59']], 'rgb(173,244,66)', 'Karyawan Tetap < 8 jam');
        flaggedTotalWorkingTime = validateDuration(totalWorkingTime);
      }
    }
    return flaggedTotalWorkingTime;
  }

  function process(attendances, options) {
    telat5 = false;
    telat15 = false;
    tidakClockOut = false;
    let clocks = attendances.map(att => moment(att.date));
    let clockPairs = _getClockPairs(clocks);
    let attendancePairs = _getAttendancePairs(attendances);

    let flaggedClockPairs = _getFlaggedClockPairs(attendancePairs, options);
    let totalWorkingTime = _getTotalWorkingTime(clockPairs, options);
    let flaggedTotalWorkingTime = _getFlaggedTotalWorkingTime(clockPairs, options);
    
    if (clockPairs && !clockPairs[clockPairs.length-1].clockOut) tidakClockOut = true;
    let totalSesi = 0;
    if (clockPairs) {
      totalSesi = clockPairs.length;
      if (tidakClockOut) totalSesi -= 1;
    }

    return {
      clockPairs: clockPairs,
      flaggedClockPairs: flaggedClockPairs,
      totalWorkingTime: totalWorkingTime,
      flaggedTotalWorkingTime: flaggedTotalWorkingTime,
      telat5: telat5,
      telat15: telat15,
      tidakClockOut: tidakClockOut,
      totalSesi: totalSesi
    };
  }

  return {
    process: process
  };
})();
