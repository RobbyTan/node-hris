let mongoose = require('mongoose')

let pphSchema = new mongoose.Schema({
  nik: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  kategori_pegawai: String,
  tanggal_mulai_kerja: Date,
  tanggal_mutasi_kerja: Date,
  tanggal_berhenti_kerja : Date,
  no_ktp: String,
  tempat_lahir: String,
  tanggal_lahir: Date,
  jenis_kelamin: String,
  alamat : String,
  rtrw : String,
  kelurahan_desa : String,
  kecamatan : String,
  agama : String,
  status_perkawinan : String,
  kewarganegaraan : String,
  jabatan : String,
  grade : String,
  department : String,
  spesialisasi : String,
  cost_center : String,
  status_pegawai : String,
  nomor_kontrak : String,
  tanggal_kontrak_mulai : Date,
  tanggal_kontrak_berakhir : Date,
  nomor_sk_rektor : String,
  tanggal_isk_berlaku : Date,
  tanggal_isk_berhenti_berlaku: Date,
  npwp : String,
  nama_pajak : String,
  alamat_pajak : String,
  nama_kpp : String,
  status_ptkp : String,
  atas_nama_bank : String,
  nama_bank : String,
  no_rekening : String,
  bpjstk: String,
  bpjskis: String
})
let Pph = mongoose.model('Pph', pphSchema);

module.exports = Pph;
