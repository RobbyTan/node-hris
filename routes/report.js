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
  db.Pph.find({}, function (err, allData) {
    if (err) {
      console.log(err)
    } else {
      res.render('./report/viewPphReport', {pph: allData})
    }
  })
})
router.delete("/:id",authentication.isLoggedIn,function(req,res){
  db.Pph.findByIdAndRemove(req.params.id,function(err){
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
		data.forEach(async (pph, idx) => {
      if (idx === data.length - 1) return

            if(pph.length<10){
                 return 
            }else {
      let newPph = {
      	kategori_pegawai: pph[0],
      	nik: pph[1],
      	tanggal_mulai_kerja: pph[2],
      	tanggal_mutasi_kerja: pph[3],
            tanggal_berhenti_kerja : pph[4],
      	no_ktp: pph[5],
      	tempat_lahir: pph[6],
      	tanggal_lahir: pph[7],
      	jenis_kelamin: pph[8],
      	alamat : pph[9],
      	rtrw : pph[10],
      	kelurahan_desa : pph[11],
      	kecamatan : pph[12],
      	agama : pph[13],
      	status_perkawinan : pph[14],
      	kewarganegaraan : pph[15],
      	jabatan : pph[16],
      	grade : pph[17],
      	department : pph[18],
      	spesialisasi : pph[19],
      	cost_center : pph[20],
      	status_pegawai : pph[21],
      	nomor_kontrak : pph[22],
      	tanggal_kontrak_mulai : pph[23],
      	tanggal_kontrak_berakhir : pph[24],
      	nomor_sk_rektor : pph[25],
      	tanggal_isk_berlaku : pph[26],
      	tanggal_isk_berhenti_berlaku: pph[27],
      	npwp : pph[28],
      	nama_pajak : pph[29],
      	alamat_pajak : pph[30],
      	nama_kpp : pph[31],
      	status_ptkp : pph[32],
      	atas_nama_bank : pph[33],
      	nama_bank : pph[34],
      	no_rekening : pph[35],
      	bpjstk: pph[36],
      	bpjskis: pph[37]
      }

      console.log(newPph)

      await db.Pph.create(newPph, function (err, newlyCreated) {
      	if (err) {

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