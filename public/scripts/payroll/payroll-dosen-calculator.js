let PayrollDosenCalculator = (function() {
  let fullDataDictionary = {};

  function _toMiliSeconds(time) {
    let timeParts = time.split(":");
    let h = timeParts[0] ? +timeParts[0] * 60 * 60 * 1000 : 0;
    let m = timeParts[1] ? +timeParts[1] * 60 * 1000 : 0;
    let s = timeParts[2] ? +timeParts[2] * 1000 : 0;
    return h + m + s;
  }

  function _initFullDataDictionary() {
    $.getJSON("/api/pph", rows => {
      for (let row of rows) {
        fullDataDictionary[row.nik] = {
          kategori_pegawai: row.kategori_pegawai,
          nik: row.nik,

          //nama lengkap sesuai KTP
          nama_depan: row.nama_depan,
          nama_tengah: row.nama_tengah,
          nama_belakang: row.nama_belakang,
  
          //posisi kerja
          department: row.department,
          spesialisasi: row.spesialisasi,
          cost_center: row.cost_center,
  
          //data payroll
          perhitungan_gaji: row.perhitungan_gaji,
          jenis_mata_uang: row.jenis_mata_uang,
          jumlah_gaji_saat_ini: row.jumlah_gaji_saat_ini,
          penerimaan_gaji: row.penerimaan_gaji,

          //data perhitungan gaji dan ayroll
          gaji_pokok: row.gaji_pokok
        };
      }
    });
  }

  function process(attendances, options) {
    attendances = attendances.filter(attendance => attendance.kategori_pegawai==='Dosen Tidak Tetap');
    let totalDurasiKerjaMs = {};
    for (let attendance of attendances) {
      let clocks = attendance.absensi.map(clock => moment(clock.date));
      let clockPairingResult = ClockPairing.process(clocks, {
        dosenTidakTetapMaxTime: options.dosenTidakTetapMaxTime,
        department: attendance.department
      });
      // akumulasi durasi kerja dosen
      if (!totalDurasiKerjaMs[attendance.nik]) totalDurasiKerjaMs[attendance.nik] = 0;
      totalDurasiKerjaMs[attendance.nik] += _toMiliSeconds(clockPairingResult.totalWorkingTime);
    }
    let payrollResult = [];
    for (let nik in totalDurasiKerjaMs) {
      if (!fullDataDictionary[nik]) continue;
      let rateGajiPerJamStr = fullDataDictionary[nik].jumlah_gaji_saat_ini;
      let rateGajiPerJam = +(rateGajiPerJamStr.replace(/[,\. ]/g, ''));
      let gajiPokok = (totalDurasiKerjaMs[nik]/(60*60*1000.0))*rateGajiPerJam;
      let totalGaji = gajiPokok;
      let payrollObject = {
        ...fullDataDictionary[nik],
        total_durasi_kerja_ms: totalDurasiKerjaMs[nik],
        gaji_pokok: gajiPokok,
        total_gaji: totalGaji
      };
      payrollResult.push(payrollObject);
    }
    console.log('payrollResult', payrollResult);
    return payrollResult;
  }

  /* initialization */
  _initFullDataDictionary();

  return {
    process: process
  };
})();