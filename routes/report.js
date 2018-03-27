const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const { upload } = require('../middleware/upload')
const db = require('../models')
const moment = require('moment')
const authentication = require('../middleware/authentication.js')

router.get('/upload/pph',authentication.isLoggedIn, (req, res) => {
	res.render('./report/uploadPph');
})
router.get('/upload/pphexcel',authentication.isLoggedIn, (req, res) => {
	res.render('./report/uploadPphExcel')
})
router.get('/view/pph',authentication.isLoggedIn, (req, res) => {
  db.Fulldata.find({}, function (err, allData) {
    if (err) {
      console.log(err)
    } else {
      res.render('./report/viewPphReport', {pph: allData})
    }
  })
})
router.delete("/:id",authentication.isLoggedIn,function(req,res){
  db.FullData.findByIdAndRemove(req.params.id,function(err){
    if(err){
      console.log(err);
      res.redirect("/report/view/pph");
    }else{
      res.redirect("/report/view/pph");
    }
  })
});

router.post('/new/upload', upload.single('file'), async (req, res) => {
	if (!req.file) {
		return res.status(422).json({
			error: 'Please Upload a file'
		})
	}
	let workbook
	let toJson = function toJson (workbook) {
		let result = {}
		workbook.SheetNames.forEach(function (sheetName) {
			let roa = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1})
			if (roa.length) result[sheetName] = roa
		})
		return JSON.stringify(result, 2, 2)
	}
	try {
		workbook = xlsx.readFile(req.file.path)

		let result = {}
		workbook.SheetNames.forEach(function (sheetName) {
			let roa = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1})
			if (roa.length) result[sheetName] = roa
		})
		let data = result['Sheet1']
    console.log(data);
    data.forEach(async (fulldata, idx) => {
      if (idx === data.length - 3) return

        if(data.length<10){
         return 
       }else {
        let newFullData = {
         kategori_pegawai: fulldata[0],
         nik: fulldata[1],
         nama_depan : fulldata[2],
         nama_tegah : fulldata[3],
         nama_belakang : fulldata[4],
         tanggal_mulai_kerja_medan :fulldata[5],
         tanggal_mulai_kerja_karawaci : fulldata[6],
         tanggal_mutasi_kerja_medan : fulldata[7],
         tanggal_berhenti_kerja : fulldata[8],
         no_ktp: fulldata[9],
         tempat_lahir: fulldata[10],
         tanggal_lahir : fulldata[11],
         jenis_kelamin: fulldata[12],
         alamat : fulldata[13],
         rtrw : fulldata[14],
         kelurahan_desa : fulldata[15],
         kecamatan : fulldata[16],
         agama : fulldata[17],
         status_perkawinan : fulldata[18],
         kewarganegaraan : fulldata[19],
         jalan_domisili : fulldata[20],
         kota_domisili : fulldata[21],
         kode_pos_domisili : fulldata[22],
         tanggal_lahir_yang_benar : fulldata[23],
         golongan_darah : fulldata[24],
         nama_ibu_kandung : fulldata[25],
         no_telepon_rumah : fulldata[26],
         no_telepon_seluler : fulldata[27],
         alamat_email_pribadi : fulldata[28],
         alamat_email_uph : fulldata[29],
         nama_gereja : fulldata[30],
         alamat_gereja : fulldata[31],
         sesi_kelas : fulldata[32],
         lokasi_kampus : fulldata[33],
         tanggal_cv_diterima : fulldata[34],
         posisi_yang_diterima : fulldata[35],
         pekerjaan_terakhir : fulldata[36],
         informasi_lowongan : fulldata[37],
         jabatan : fulldata[38],
         grade : fulldata[39],
         department : fulldata[40],
         spesialisasi : fulldata[41],
         cost_center : fulldata[42],
         status_jam_kerja: fulldata[43],
         senin_kerja : fulldata[44],
         selasa_kerja : fulldata[45],
         rabu_kerja : fulldata[46],
         kamis_kerja : fulldata[47],
         jumat_kerja : fulldata[48],
         sabtu_kerja : fulldata[49],
         minggu_kerja : fulldata[50],
         shift_kerja : fulldata[51],
         jam_kerja : fulldata[52],
         lokasi_kerja : fulldata[53],
         total_jam_kerja : fulldata[54],
         status_pegawai : fulldata[55],
         nomor_kontrak : fulldata[56],
         tanggal_kontrak_mulai : fulldata[57],
         tanggal_kontrak_berakhir : fulldata[58],
         nomor_sk_rektor : fulldata[59],
         tanggal_isk_berlaku : fulldata[60],
         tanggal_isk_berhenti_berlaku : fulldata[61],
         nama_lengkap_sesuai_ijazah : fulldata[62],
         nama_gelar : fulldata[63],
         nama_institusi_pendidikan : fulldata[64],
         tanggal_tamat : fulldata[65],
         npwp : fulldata[66],
         nama_pajak : fulldata[67],
         alamat_pajak : fulldata[68],
         nama_kpp : fulldata[69],
         status_ptkp : fulldata[70],
         atas_nama_bank : fulldata[71],
         nama_bank : fulldata[72],
         no_rekening : fulldata[73],
         bpjstk: fulldata[74],
         bpjskis: fulldata[75],
         no_induk_dosen_nasional : fulldata[76],
         jenjang : fulldata[77],
         golongan_dosen : fulldata[78],
         tanggal_jja_diperoleh : fulldata[79],
         berkas_cv : fulldata[80],
         berkas_formulir_data_pribadi : fulldata[81],
         berkas_formulir_spiritual : fulldata[82],
         berkas_pernyataan_iman : fulldata[83],
         berkas_pas_foto : fulldata[84],
         berkas_ktp : fulldata[85],
         berkas_npwp : fulldata[86],
         berkas_kk : fulldata[87],
         berkas_ijazah : fulldata[88],
         berkas_transkrip_nilai : fulldata[89],
         berkas_surat_baptis : fulldata[90],
         berkas_surat_referen_kerja : fulldata[91],
         nik_keluarga_uph : fulldata[92],
         perhitungan_gaji : fulldata[93],
         jenis_mata_uang : fulldata[94],
         jumlah_gaji_saat_ini : fulldata[95],
         penerimaan_gaji : fulldata[96]
       }

       console.log(newFullData)

       await db.Fulldata.create(newFullData, function (err, newlyCreated) {
         if (err) {
            console.log(err)
         } else {
            // redirect back to events page
            console.log('Employee created')
          }
        })
     }
   })
  } catch (err) {
    console.log(err)
    return res.status(422).json({
     error: 'Error'
   })
  }
  return res.status(200).send(toJson(workbook))
})

module.exports = router