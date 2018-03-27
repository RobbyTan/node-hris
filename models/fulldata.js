let mongoose = require('mongoose')

let fulldataSchema = new mongoose.Schema({
  kategori_pegawai: String,
  nik: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  nama_depan : String,
  nama_tegah : String,
  nama_belakang : String,
  tanggal_mulai_kerja_medan: Date,
  tanggal_mulai_kerja_karawaci : Date,
  tanggal_mutasi_kerja_medan: Date,
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
  jalan_domisili : String,
  kota_domisili : String,
  kode_pos_domisili : String,
  tanggal_lahir_yang_benar : String,
  golongan_darah : String,
  nama_ibu_kandung : String,
  no_telepon_rumah : String,
  no_telepon_seluler : String,
  alamat_email_pribadi : String,
  alamat_email_uph : String,
  nama_gereja : String,
  alamat_gereja : String,
  sesi_kelas : String,
  lokasi_kampus : String,
  tanggal_cv_diterima : String,
  posisi_yang_diterima : String,
  pekerjaan_terakhir : String,
  informasi_lowongan : String,
  jabatan : String,
  grade : String,
  department : String,
  spesialisasi : String,
  cost_center : String,
  status_jam_kerja: String,
  senin_kerja : String,
  selasa_kerja : String,
  rabu_kerja : String,
  kamis_kerja : String,
  jumat_kerja : String,
  sabtu_kerja : String,
  minggu_kerja : String,
  shift_kerja : String,
  jam_kerja : String,
  lokasi_kerja : String,
  total_jam_kerja : String,
  status_pegawai : String,
  nomor_kontrak : String,
  tanggal_kontrak_mulai : Date,
  tanggal_kontrak_berakhir : Date,
  nomor_sk_rektor : String,
  tanggal_isk_berlaku : Date,
  tanggal_isk_berhenti_berlaku: Date,
  nama_lengkap_sesuai_ijazah : String,
  nama_gelar : String,
  nama_institusi_pendidikan : String,
  tanggal_tamat : String,
  npwp : String,
  nama_pajak : String,
  alamat_pajak : String,
  nama_kpp : String,
  status_ptkp : String,
  atas_nama_bank : String,
  nama_bank : String,
  no_rekening : String,
  bpjstk: String,
  bpjskis: String,
  no_induk_dosen_nasional : String,
  jenjang : String,
  golongan_dosen : String,
  tanggal_jja_diperoleh : String,
  berkas_cv : Boolean,
  berkas_formulir_data_pribadi : Boolean,
  berkas_formulir_spiritual : Boolean,
  berkas_pernyataan_iman : Boolean,
  berkas_pas_foto : Boolean,
  berkas_ktp : Boolean,
  berkas_npwp : Boolean,
  berkas_kk : Boolean,
  berkas_ijazah : Boolean,
  berkas_transkrip_nilai : Boolean,
  berkas_surat_baptis : Boolean,
  berkas_surat_referen_kerja : Boolean,
  nik_keluarga_uph : String,
  perhitungan_gaji : String,
  jenis_mata_uang : String,
  jumlah_gaji_saat_ini : String,
  penerimaan_gaji : String

})
let Fulldata = mongoose.model('Fulldata', fulldataSchema);

module.exports = Fulldata;
