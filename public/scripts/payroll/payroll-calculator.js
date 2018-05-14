let PayrollCalculator = (function() {
  let fullDataDictionary = {};

  function _initFullDataDictionary() {
    $.getJSON("/api/pph", rows => {
      for (let row of rows) {
        fullDataDictionary[row.nik] = {
          kategori_pegawai: row.kategori_pegawai,
  
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
    let totalDurasiKerja = {};
    for (let attendance of attendances) {
      let clocks = attendance.absensi.map(clock => moment(clock.date));
      let clockPairingResult = ClockPairing.process(clocks, {
        dosenTidakTetapMaxTime: options.dosenTidakTetapMaxTime,
        department: attendance.department
      });
      // akumulasi durasi kerja dosen
      if (!totalDurasiKerja[attendance.nik]) totalDurasiKerja[attendance.nik] = 0;
      totalDurasiKerja[attendance.nik] += clockPairingResult.totalWorkingTime;
    }

    let payrollResult = [];
    for (let nik in totalDurasiKerja) {
      let payrollObject = {
        ...fullDataDictionary[nik],
        total_durasi_kerja: totalDurasiKerja[nik],
        total_gaji: totalDurasiKerja[nik]*fullDataDictionary[nik].gaji_pokok
      };
      payrollResult.push(payrollObject);
    }
    return payrollResult;
  }

  /* initialization */
  _initFullDataDictionary();

  return {
    process: process
  };
})();