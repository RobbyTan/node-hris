const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const { upload } = require('../middleware/upload')
const db = require('../models')
const moment = require('moment')
const authentication = require('../middleware/authentication.js')
const bcrypt = require('bcrypt')

router.get("/access/view/pph",authentication.reportAccess,(req,res)=>{
    res.render('./report/accessView')
})
router.get("/access/upload/pph",authentication.reportAccess,(req,res)=>{
    res.render('./report/accessUpload')
})
router.post("/access/view/pph",authentication.reportAccess,(req,res)=>{ 
    db.Configuration.findOne({}, (err, configuration) => {
        hash=configuration.password;
        if(bcrypt.compareSync(req.body.password, hash)) {
            session=req.session;
            session.name=req.user.username;
            res.redirect("/report/view/pph")
            console.log(session.name)
        } else {
            res.redirect('/report/access/view/pph')
        }
    })
    // if(req.body.password == process.env.PASS){
    //     session=req.session;
    //     session.name=req.user.username;
    //     res.redirect("/report/view/pph")
    //     console.log(session.name)
    // }else{
    //     res.redirect('/report/access')
    // }
    
})
router.post("/access/upload/pph",authentication.reportAccess,(req,res)=>{ 
    db.Configuration.findOne({}, (err, configuration) => {
        hash=configuration.password;
        if(bcrypt.compareSync(req.body.password, hash)) {
            session=req.session;
            session.name=req.user.username;
            res.redirect("/report/upload/pph")
            console.log(session.name)
        } else {
            res.redirect('/report/access/upload/pph')
        }
    })
    // if(req.body.password == process.env.PASS){
    //     session=req.session;
    //     session.name=req.user.username;
    //     res.redirect("/report/upload/pph")
    //     console.log(session.name)
    // }else{
    //     res.redirect('/report/access')
    // }
    
})
router.get('/upload/pph',authentication.reportAccess, (req, res) => {
    if(req.session.name){
     res.render('./report/uploadPph');
 }else{
    res.redirect('/report/access/upload/pph')
}
})
router.get('/upload/pphexcel',authentication.reportAccess, (req, res) => {
    if(req.session.name){
       res.render('./report/uploadPphExcel')
   }else{
    res.redirect('/report/access/upload/pph')
}
})
router.get('/view/pph',authentication.reportAccess, (req, res) => {
    if(req.session.name){
      db.Fulldata.find({}, function (err, allData) {
        if (err) {
          console.log(err)
      } else {
          res.render('./report/viewPphReport', {pph: allData})
      }
  })
  }else{
    res.redirect('/report/access/view/pph')
}
})
router.delete("/:id",authentication.reportAccess,function(req,res){
  db.Fulldata.findByIdAndRemove(req.params.id,function(err){
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
          // if (idx === data.length - 3) return
            if(idx<=3){
                return
            }
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
             atasan_langsung : fulldata[40],
             department : fulldata[41],
             spesialisasi : fulldata[42],
             cost_center : fulldata[43],
             status_jam_kerja: fulldata[44],
             senin_kerja : fulldata[45],
             selasa_kerja : fulldata[46],
             rabu_kerja : fulldata[47],
             kamis_kerja : fulldata[48],
             jumat_kerja : fulldata[49],
             sabtu_kerja : fulldata[50],
             minggu_kerja : fulldata[51],
             shift_kerja : fulldata[52],
             jam_masuk : fulldata[53],
             jam_keluar : fulldata[54],
             lokasi_kerja : fulldata[55],
             total_jam_kerja : fulldata[56],
             status_pegawai : fulldata[57],
             nomor_kontrak : fulldata[58],
             tanggal_kontrak_mulai : fulldata[59],
             tanggal_kontrak_berakhir : fulldata[60],
             nomor_sk_rektor : fulldata[61],
             tanggal_isk_berlaku : fulldata[62],
             tanggal_isk_berhenti_berlaku : fulldata[63],
             nama_lengkap_sesuai_ijazah : fulldata[64],
             nama_gelar_sma : fulldata[65],
             nama_gelar_d1 : fulldata[66],
             nama_gelar_d2 : fulldata[67],
             nama_gelar_d3 : fulldata[68],
             nama_gelar_d4 : fulldata[69],
             nama_gelar_s1 : fulldata[70],
             nama_gelar_s2 : fulldata[71],
             nama_gelar_s3 : fulldata[72],
             nama_institusi_pendidikan_sma : fulldata[73],
             nama_institusi_pendidikan_d1 : fulldata[74],
             nama_institusi_pendidikan_d2 : fulldata[75],
             nama_institusi_pendidikan_d3 : fulldata[76],
             nama_institusi_pendidikan_d4 : fulldata[77],
             nama_institusi_pendidikan_s1 : fulldata[78],
             nama_institusi_pendidikan_s2 : fulldata[79],
             nama_institusi_pendidikan_s3: fulldata[80],
             tanggal_tamat : fulldata[81],
             npwp : fulldata[82],
             nama_pajak : fulldata[83],
             alamat_pajak : fulldata[84],
             nama_kpp : fulldata[85],
             status_ptkp : fulldata[86],
             atas_nama_bank : fulldata[87],
             nama_bank : fulldata[88],
             no_rekening : fulldata[89],
             bpjstk: fulldata[90],
             bpjskis: fulldata[91],
             no_induk_dosen_nasional : fulldata[92],
             jenjang : fulldata[93],
             golongan_dosen : fulldata[94],
             tanggal_jja_diperoleh : fulldata[95],
             berkas_cv : fulldata[96],
             berkas_formulir_data_pribadi : fulldata[97],
             berkas_formulir_spiritual : fulldata[98],
             berkas_pernyataan_iman : fulldata[99],
             berkas_pas_foto : fulldata[100],
             berkas_ktp : fulldata[101],
             berkas_npwp : fulldata[102],
             berkas_kk : fulldata[103],
             berkas_ijazah : fulldata[104],
             berkas_transkrip_nilai : fulldata[105],
             berkas_surat_baptis : fulldata[106],
             berkas_surat_referen_kerja : fulldata[107],
             nik_keluarga_uph : fulldata[108],
             perhitungan_gaji : fulldata[109],
             jenis_mata_uang : fulldata[110],
             jumlah_gaji_saat_ini : fulldata[111],
             penerimaan_gaji : fulldata[112]
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