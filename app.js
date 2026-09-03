/* ---------- Setup Supabase ---------- */

const SUPABASE_URL = "https://xtyahgoipkrtcejbirrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_EMCUNoKr1o7Cbvc0_SNQhA_2HDK4ZUu";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- Helper pesan sukses/error ---------- */

// Dulu warna pesan (merah/ijo) di-hardcode langsung lewat style.color di
// tiap tempat. Masalahnya warna yang di-hardcode gitu nggak ikut berubah
// pas mode gelap aktif (ijo tua jadi susah kebaca di background gelap).
// Sekarang pakai kelas CSS (.pesan-error / .pesan-sukses) yang warnanya
// diatur lewat variabel tema di style.css, jadi otomatis nyesuain.
function tampilkanPesan(elemen, teks, jenis) {
  // jenis: "error", "sukses", atau "" (netral, misal pas lagi nyimpen)
  elemen.textContent = teks;
  elemen.classList.remove("pesan-error", "pesan-sukses");
  if (jenis === "error") elemen.classList.add("pesan-error");
  if (jenis === "sukses") elemen.classList.add("pesan-sukses");
}

/* ---------- Modal Konfirmasi (custom, gantiin confirm() bawaan) ---------- */

const modalKonfirmasi = document.getElementById("modalKonfirmasi");
const modalJudul = document.getElementById("modalJudul");
const modalPesan = document.getElementById("modalPesan");
const modalBatal = document.getElementById("modalBatal");
const modalLanjut = document.getElementById("modalLanjut");

// Dipake kayak: const jawaban = await tampilkanKonfirmasi("Judul", "Pesan");
// jawaban isinya true kalau user klik Lanjut, false kalau Batal.
function tampilkanKonfirmasi(judul, pesan) {
  modalJudul.textContent = judul;
  modalPesan.textContent = pesan;
  modalKonfirmasi.classList.remove("modal-tersembunyi");

  return new Promise(function (resolve) {
    function bersihkan(hasil) {
      modalKonfirmasi.classList.add("modal-tersembunyi");
      modalBatal.removeEventListener("click", klikBatal);
      modalLanjut.removeEventListener("click", klikLanjut);
      resolve(hasil);
    }
    function klikBatal() {
      bersihkan(false);
    }
    function klikLanjut() {
      bersihkan(true);
    }

    modalBatal.addEventListener("click", klikBatal);
    modalLanjut.addEventListener("click", klikLanjut);
  });
}

/* ---------- Mode Gelap/Terang ---------- */

const btnModeGelap = document.getElementById("btnModeGelap");

// Ikon SVG (Lucide: moon & sun) buat tombol mode gelap/terang. Ditulis
// di JS (bukan cuma HTML) soalnya ikonnya emang ganti-ganti tergantung
// tema yang lagi aktif.
const ikonBulan = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>';
const ikonMatahari = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>';

// Samain tampilan ikon tombol sama tema yang lagi aktif sekarang.
// Dipanggil pas load (buat nyesuain kalau tema gelap udah aktif dari
// script di <head>) dan tiap kali tombolnya diklik.
function perbaruiIkonMode() {
  const modeGelapAktif = document.documentElement.getAttribute("data-theme") === "dark";
  btnModeGelap.innerHTML = modeGelapAktif ? ikonMatahari : ikonBulan;
  btnModeGelap.setAttribute("aria-label", modeGelapAktif ? "Ganti ke mode terang" : "Ganti ke mode gelap");
}

btnModeGelap.addEventListener("click", function () {
  const modeGelapAktif = document.documentElement.getAttribute("data-theme") === "dark";

  if (modeGelapAktif) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("temaWCT", "terang");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("temaWCT", "gelap");
  }

  perbaruiIkonMode();
});

perbaruiIkonMode();

/* ---------- Autentikasi ---------- */

const authBox = document.getElementById("authBox");
const appContent = document.getElementById("appContent");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const pesanAuth = document.getElementById("pesanAuth");
const btnMasuk = document.getElementById("btnMasuk");
const btnDaftar = document.getElementById("btnDaftar");
const btnKeluar = document.getElementById("btnKeluar");

btnDaftar.addEventListener("click", async function () {
  if (authEmail.value === "" || authPassword.value === "") {
    tampilkanPesan(pesanAuth, "Email dan password wajib diisi.", "error");
    return;
  }

  tampilkanPesan(pesanAuth, "Mendaftarkan...", "");

  const { error } = await supabaseClient.auth.signUp({
    email: authEmail.value,
    password: authPassword.value,
  });

  if (error) {
    tampilkanPesan(pesanAuth, "Gagal daftar: " + error.message, "error");
    return;
  }

  tampilkanPesan(pesanAuth, "Pendaftaran berhasil! Silakan periksa email Anda untuk konfirmasi sebelum masuk.", "sukses");
});

btnMasuk.addEventListener("click", async function () {
  if (authEmail.value === "" || authPassword.value === "") {
    tampilkanPesan(pesanAuth, "Email dan password wajib diisi.", "error");
    return;
  }

  tampilkanPesan(pesanAuth, "Masuk...", "");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: authEmail.value,
    password: authPassword.value,
  });

  if (error) {
    tampilkanPesan(pesanAuth, "Gagal masuk: " + error.message, "error");
    return;
  }
});

btnKeluar.addEventListener("click", async function () {
  await supabaseClient.auth.signOut();
});

let userSaatIni = null;

supabaseClient.auth.onAuthStateChange(function (event, session) {
  if (session) {
    userSaatIni = session.user.id;
    authBox.classList.add("auth-tersembunyi");
    appContent.classList.remove("app-tersembunyi");
    authEmail.value = "";
    authPassword.value = "";
    tampilkanPesan(pesanAuth, "", "");
    muatSemuaData();
  } else {
    userSaatIni = null;
    authBox.classList.remove("auth-tersembunyi");
    appContent.classList.add("app-tersembunyi");
  }
});

/* ---------- Satuan (kg/lb) ---------- */

let satuanAktif = "kg";
const KG_KE_LB = 2.20462;

function kgKeLb(kg) {
  return kg * KG_KE_LB;
}

function lbKeKg(lb) {
  return lb / KG_KE_LB;
}

// Ubah angka kg (yang selalu jadi satuan penyimpanan internal) jadi teks
// sesuai satuan yang lagi aktif dipilih user.
function formatBerat(kg) {
  const nilai = satuanAktif === "kg" ? kg : kgKeLb(kg);
  return `${nilai.toFixed(1)} ${satuanAktif}`;
}

// Baca nilai mentah dari sebuah input berat, dan selalu kembalikan dalam kg -
// biar semua perhitungan di bawah nggak perlu peduli satuan apa yang lagi aktif.
function bacaBeratKg(nilaiString) {
  const angka = Number(nilaiString);
  return satuanAktif === "kg" ? angka : lbKeKg(angka);
}

const semuaTombolSatuan = document.querySelectorAll(".satuan-btn");
const semuaLabelUnit = document.querySelectorAll(".unit-teks");

semuaTombolSatuan.forEach(function (btn) {
  btn.addEventListener("click", function () {
    satuanAktif = btn.dataset.satuan;

    semuaTombolSatuan.forEach(function (b) {
      b.classList.toggle("aktif", b.dataset.satuan === satuanAktif);
    });

    semuaLabelUnit.forEach(function (label) {
      label.textContent = satuanAktif;
    });

    // Render ulang semua tampilan yang nunjukkin angka berat, biar
    // langsung ke-update ke satuan baru tanpa perlu refresh.
    tampilkanCatatan();
    gambarGrafik();
    tampilkanRingkasan();
  });
});

/* ---------- Notifikasi Push ---------- */

const btnAktifkanPush = document.getElementById("btnAktifkanPush");
const inputJamPengingat = document.getElementById("jamPengingat");

// Server jalan pakai jam UTC, sedangkan kamu milih jam pakai waktu lokal
// (WIB, dst) - ini konversinya, biar jam yang tersimpan udah "pas" buat
// dibandingin server nanti.
function konversiJamKeUTC(jamLokal) {
  const bagian = jamLokal.split(":").map(Number);
  const d = new Date();
  d.setHours(bagian[0], bagian[1], 0, 0);
  const jamUTC = String(d.getUTCHours()).padStart(2, "0");
  const menitUTC = String(d.getUTCMinutes()).padStart(2, "0");
  return `${jamUTC}:${menitUTC}`;
}
const statusPengingat = document.getElementById("statusPengingat");

const VAPID_PUBLIC_KEY = "BE8r2yQcvwzjbL9vZ_5SjH7N4loU4AXBhv0zns1HcaVMnhhFqmhbi_qP5bFreCSes1Vs5BNAXfbYlZcRBoVGluc";

// Web Push butuh applicationServerKey dalam bentuk Uint8Array,
// bukan string - ini fungsi konversinya.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Satu tombol ini ngerjain semuanya: daftar Service Worker, minta izin,
// subscribe ke push, simpan ke Supabase, LALU langsung minta server
// kirim 1 notifikasi konfirmasi - jadi aktivasi + tes jadi satu langkah.
btnAktifkanPush.addEventListener("click", async function () {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    // Deteksi iPhone/iPad yang BELUM di-"Add to Home Screen" - di
    // Safari iOS, PushManager cuma tersedia kalau web-nya udah
    // "diinstall" ke Home Screen dulu (batasan dari Apple, bukan
    // dari app ini). Kasih instruksi yang jelas, bukan pesan generik.
    const iOSBelumInstall =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      window.navigator.standalone !== true;

    if (iOSBelumInstall) {
      tampilkanPesan(
        statusPengingat,
        "Di iPhone/iPad, notifikasi cuma bisa aktif kalau web ini di-\"Add to Home Screen\" dulu. Tap ikon Share di Safari, lalu pilih \"Add to Home Screen\".",
        "error"
      );
      return;
    }

    tampilkanPesan(statusPengingat, "Browser Anda tidak mendukung push notification.", "error");
    return;
  }

  if (inputJamPengingat.value === "") {
    tampilkanPesan(statusPengingat, "Jam pengingat wajib dipilih terlebih dahulu.", "error");
    return;
  }

  try {
    tampilkanPesan(statusPengingat, "Mendaftarkan...", "");

    const registration = await navigator.serviceWorker.register("sw.js");

    const izin = await Notification.requestPermission();
    if (izin !== "granted") {
      tampilkanPesan(statusPengingat, "Izin notifikasi ditolak.", "error");
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const subJson = subscription.toJSON();
    const jamUTC = konversiJamKeUTC(inputJamPengingat.value);

    const { error } = await supabaseClient.from("push_subscriptions").insert({
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth,
      user_id: userSaatIni,
      jam_pengingat: jamUTC,
    });

    if (error) {
      tampilkanPesan(statusPengingat, "Gagal menyimpan subscription: " + error.message, "error");
      return;
    }

    tampilkanPesan(statusPengingat, "Aktif! Mengirim notifikasi konfirmasi...", "");

    const { error: errorKirim } = await supabaseClient.functions.invoke("kirim-push");

    if (errorKirim) {
      tampilkanPesan(statusPengingat, "Notifikasi aktif, tetapi pengujian pengiriman gagal: " + errorKirim.message, "error");
      return;
    }

    tampilkanPesan(statusPengingat, `Notifikasi aktif! Anda akan diingatkan setiap jam ${inputJamPengingat.value}. Silakan periksa notifikasi konfirmasi yang baru saja dikirim.`, "sukses");
  } catch (err) {
    tampilkanPesan(statusPengingat, "Gagal mengaktifkan notifikasi: " + err.message, "error");
  }
});

/* ---------- Navigasi antar langkah ---------- */

const semuaLangkah = document.querySelectorAll(".langkah");
const semuaNavBtn = document.querySelectorAll(".nav-btn");
const semuaBtnLanjut = document.querySelectorAll(".btn-lanjut");

// Urutan tab dipakai buat deteksi arah geser (kiri atau kanan)
const urutanTab = ["langkah-profil", "langkah-target", "langkah-harian", "langkah-ringkasan"];

// Semua kelas yang mungkin nempel di .langkah - dibersihkan sebelum transisi
const kelasGeser = ["aktif", "dari-kanan", "dari-kiri", "keluar-ke-kiri", "keluar-ke-kanan"];

function pindahKe(idTujuan) {
  const langkahAktif = document.querySelector(".langkah.aktif");
  const langkahTujuan = document.getElementById(idTujuan);

  if (!langkahAktif || langkahAktif === langkahTujuan) return;

  const indexAktif = urutanTab.indexOf(langkahAktif.id);
  const indexTujuan = urutanTab.indexOf(idTujuan);
  const geserKanan = indexTujuan > indexAktif;

  // Update nav tab
  semuaNavBtn.forEach(function (btn) {
    btn.classList.toggle("aktif", btn.dataset.tujuan === idTujuan);
  });

  // 1. Posisikan langkah tujuan di luar layar (TANPA transition dulu)
  //    Caranya: hapus semua kelas geser dulu, lalu pasang posisi awal
  kelasGeser.forEach(function (k) { langkahTujuan.classList.remove(k); });
  langkahTujuan.classList.add(geserKanan ? "dari-kanan" : "dari-kiri");

  // 2. Paksa browser "menggambar" posisi awal itu dulu sebelum transition
  //    dimulai. Tanpa ini, browser mungkin skip ke posisi akhir (blink).
  //    void langkahTujuan.offsetWidth adalah cara standar untuk flush layout.
  void langkahTujuan.offsetWidth;

  // 3. Sekarang aktifkan langkah tujuan (transition jalan otomatis ke translateX(0))
  //    dan geser langkah lama keluar
  langkahAktif.classList.remove("aktif");
  langkahAktif.classList.add(geserKanan ? "keluar-ke-kiri" : "keluar-ke-kanan");
  langkahTujuan.classList.remove("dari-kanan", "dari-kiri");
  langkahTujuan.classList.add("aktif");

  // 4. Bersihkan kelas keluar setelah animasi selesai (sedikit lebih lama
  //    dari durasi CSS 0.35s biar nggak kepotong di device lambat)
  setTimeout(function () {
    langkahAktif.classList.remove("keluar-ke-kiri", "keluar-ke-kanan");
  }, 400);

  if (idTujuan === "langkah-ringkasan") {
    tampilkanRingkasan();
  }
}

semuaNavBtn.forEach(function (btn) {
  btn.addEventListener("click", function () {
    pindahKe(btn.dataset.tujuan);
  });
});

semuaBtnLanjut.forEach(function (btn) {
  btn.addEventListener("click", function () {
    pindahKe(btn.dataset.tujuan);
  });
});

/* ---------- Form Profil ---------- */

const formProfil = document.getElementById("profilForm");
const pesanProfil = document.getElementById("pesanProfil");

formProfil.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nama = document.getElementById("nama").value;
  const peran = document.getElementById("peran").value;
  const beratRaw = document.getElementById("berat-sekarang").value;

  if (nama === "") {
    tampilkanPesan(pesanProfil, "Nama wajib diisi.", "error");
    return;
  }

  if (beratRaw === "") {
    tampilkanPesan(pesanProfil, "Berat badan harus diisi dengan angka yang valid.", "error");
    return;
  }

  const beratKg = bacaBeratKg(beratRaw);

  if (beratKg <= 0) {
    tampilkanPesan(pesanProfil, "Berat badan harus diisi dengan angka yang valid.", "error");
    return;
  }

  tampilkanPesan(pesanProfil, "Menyimpan...", "");

  const { error } = await supabaseClient
    .from("profil")
    .insert({ nama: nama, peran: peran, berat_awal: beratKg, user_id: userSaatIni });

  if (error) {
    tampilkanPesan(pesanProfil, "Gagal menyimpan ke database: " + error.message, "error");
    return;
  }

  tampilkanPesan(pesanProfil, `Profil untuk ${nama} berhasil dibuat! Berat awal: ${formatBerat(beratKg)}.`, "sukses");
});

async function muatProfilTerbaru() {
  const { data, error } = await supabaseClient
    .from("profil")
    .select("*")
    .eq("user_id", userSaatIni)
    .order("created_at", { ascending: false })
    .limit(1);

  // Selalu kosongin dulu - biar nggak kebawa sisa data akun sebelumnya
  // kalau akun yang lagi login ini ternyata belum punya profil.
  document.getElementById("nama").value = "";
  document.getElementById("peran").value = "atlet";
  document.getElementById("berat-sekarang").value = "";
  tampilkanPesan(pesanProfil, "", "");

  if (error || !data || data.length === 0) return;

  const profil = data[0];
  document.getElementById("nama").value = profil.nama;
  document.getElementById("peran").value = profil.peran;
  document.getElementById("berat-sekarang").value = profil.berat_awal;

  tampilkanPesan(pesanProfil, `Selamat datang kembali, ${profil.nama}!`, "sukses");
}

/* ---------- Form Target ---------- */

const formTarget = document.getElementById("targetForm");
const pesanTarget = document.getElementById("pesanTarget");
const layarTarget = document.getElementById("layarTarget");
const angkaHari = document.getElementById("angkaHari");
const badgeTercapai = document.getElementById("badgeTercapai");
const btnPeriodeBaru = document.getElementById("btnPeriodeBaru");

formTarget.addEventListener("submit", async function (event) {
  event.preventDefault();

  const targetBeratRaw = document.getElementById("target-berat").value;
  const tanggalWeighin = document.getElementById("tanggal-weighin").value;

  if (targetBeratRaw === "") {
    tampilkanPesan(pesanTarget, "Target berat harus diisi angka yang valid.", "error");
    return;
  }

  const targetBeratKg = bacaBeratKg(targetBeratRaw);

  if (targetBeratKg <= 0) {
    tampilkanPesan(pesanTarget, "Target berat harus diisi angka yang valid.", "error");
    return;
  }

  if (targetBeratKg < 45) {
    tampilkanPesan(pesanTarget, "⚠️ Target ini berisiko tinggi bagi kesehatan. Sebaiknya konsultasikan terlebih dahulu dengan dokter/nutrisionis olahraga sebelum melanjutkan.", "error");
    return;
  }

  if (tanggalWeighin === "") {
    tampilkanPesan(pesanTarget, "Tanggal weigh-in wajib diisi.", "error");
    return;
  }

  const hariIni = new Date();
  const tanggalTarget = new Date(tanggalWeighin);
  const selisihMs = tanggalTarget - hariIni;
  const selisihHari = Math.ceil(selisihMs / (1000 * 60 * 60 * 24));

  if (selisihHari < 0) {
    tampilkanPesan(pesanTarget, "Tanggal weigh-in sudah lewat. Silakan periksa kembali tanggal yang dimasukkan.", "error");
    return;
  }

  tampilkanPesan(pesanTarget, "Menyimpan...", "");

  const { data, error } = await supabaseClient
    .from("target")
    .insert({ target_berat: targetBeratKg, tanggal_weighin: tanggalWeighin, user_id: userSaatIni })
    .select();

  if (error) {
    tampilkanPesan(pesanTarget, "Gagal menyimpan ke database: " + error.message, "error");
    return;
  }

  idTargetAktif = data[0].id;

  tampilkanPesan(pesanTarget, `Target ${formatBerat(targetBeratKg)} tersimpan.`, "sukses");

  angkaHari.textContent = selisihHari;
  layarTarget.classList.remove("layar-tersembunyi");

  perbaruiStatusTargetTercapai();
  gambarGrafik();
});

// Tombol ini nggak langsung nyimpen apa-apa ke database - dia cuma
// ngosongin form Target biar siap diisi target BARU. Periode baru itu
// baru beneran "mulai" pas kamu submit target barunya. Data periode
// yang sekarang tetep utuh aman di database, cuma nanti nggak ikut
// ditampilin lagi di grafik/ringkasan/badge begitu ada periode baru.
btnPeriodeBaru.addEventListener("click", async function () {
  const konfirmasi = await tampilkanKonfirmasi(
    "Mulai Periode Baru?",
    "Data & grafik periode SEKARANG tetap aman tersimpan. Form Target bakal dikosongin, dan grafik bakal mulai dari nol lagi buat periode barunya."
  );

  if (!konfirmasi) return;

  document.getElementById("target-berat").value = "";
  document.getElementById("tanggal-weighin").value = "";
  tampilkanPesan(pesanTarget, "", "");
  layarTarget.classList.add("layar-tersembunyi");
  badgeTercapai.classList.add("badge-tersembunyi");
  document.getElementById("target-berat").focus();
});

// Badge "Target Tercapai" dicek dengan bandingin berat CATATAN HARIAN
// yang paling baru sama target berat. Dipanggil ulang tiap kali data
// target ATAU data harian berubah (submit form, atau pas load awal),
// soalnya dua-duanya bisa mempengaruhi status tercapai/belumnya.
function perbaruiStatusTargetTercapai() {
  const targetBeratRaw = document.getElementById("target-berat").value;
  const data = catatanPeriodeAktif();

  if (targetBeratRaw === "" || data.length === 0) {
    badgeTercapai.classList.add("badge-tersembunyi");
    return;
  }

  const targetBeratKg = bacaBeratKg(targetBeratRaw);
  const beratTerakhir = Number(data[data.length - 1].berat);

  if (beratTerakhir <= targetBeratKg) {
    badgeTercapai.classList.remove("badge-tersembunyi");
  } else {
    badgeTercapai.classList.add("badge-tersembunyi");
  }
}

async function muatTargetTerbaru() {
  const { data, error } = await supabaseClient
    .from("target")
    .select("*")
    .eq("user_id", userSaatIni)
    .order("created_at", { ascending: false })
    .limit(1);

  // Sama kayak profil - kosongin dulu, biar nggak kebawa sisa data
  // akun sebelumnya.
  document.getElementById("target-berat").value = "";
  document.getElementById("tanggal-weighin").value = "";
  tampilkanPesan(pesanTarget, "", "");
  layarTarget.classList.add("layar-tersembunyi");
  badgeTercapai.classList.add("badge-tersembunyi");
  idTargetAktif = null;

  if (error || !data || data.length === 0) return;

  const target = data[0];
  document.getElementById("target-berat").value = target.target_berat;
  document.getElementById("tanggal-weighin").value = target.tanggal_weighin;
  idTargetAktif = target.id;

  const hariIni = new Date();
  const tanggalTarget = new Date(target.tanggal_weighin);
  const selisihHari = Math.ceil((tanggalTarget - hariIni) / (1000 * 60 * 60 * 24));

  if (selisihHari >= 0) {
    angkaHari.textContent = selisihHari;
    layarTarget.classList.remove("layar-tersembunyi");
  }
}

/* ---------- Form Harian ---------- */

const formHarian = document.getElementById("harianForm");
const pesanHarian = document.getElementById("pesanHarian");
const daftarCatatan = document.getElementById("daftarCatatan");
const grafikBerat = document.getElementById("grafikBerat");
const grafikTanggal = document.getElementById("grafikTanggal");

// Catatan selalu disimpan dalam kg (satuan baku), apapun satuan yang
// lagi aktif dipilih user pas nge-input. "let" (bukan "const") karena
// nanti nilainya diganti total sama data yang diambil dari Supabase.
let catatanHarian = [];

// ID dari target yang lagi AKTIF sekarang (target paling baru). Dipakai
// buat "menandai" tiap catatan harian itu punya periode/cut yang mana,
// biar grafik/ringkasan/badge nggak nyampur data dari periode lama.
let idTargetAktif = null;

// Cuma ambil catatan harian yang tanda periode-nya (target_id) SAMA
// dengan periode yang lagi aktif sekarang. Data dari periode lama tetep
// aman tersimpan di database, cuma nggak ikut ditampilin di sini.
function catatanPeriodeAktif() {
  if (idTargetAktif === null) return [];
  return catatanHarian.filter(function (c) {
    return c.target_id === idTargetAktif;
  });
}

async function muatDataDariSupabase() {
  const { data, error } = await supabaseClient
    .from("catatan_harian")
    .select("*")
    .eq("user_id", userSaatIni)
    .order("tanggal", { ascending: true });

  if (error) {
    tampilkanPesan(pesanHarian, "Gagal mengambil data dari database: " + error.message, "error");
    return;
  }

  catatanHarian = data;
  tampilkanCatatan();
  gambarGrafik();
  perbaruiStatusTargetTercapai();
}

async function muatSemuaData() {
  await muatProfilTerbaru();
  await muatTargetTerbaru();
  await muatDataDariSupabase();
}


formHarian.addEventListener("submit", async function (event) {
  event.preventDefault();

  const tanggal = document.getElementById("tanggal").value;
  const beratRaw = document.getElementById("berat").value;
  const air = document.getElementById("air").value;
  const latihan = document.getElementById("latihan").value;
  const nutrisi = document.getElementById("nutrisi").value;

  if (tanggal === "" || beratRaw === "") {
    tampilkanPesan(pesanHarian, "Tanggal dan berat badan wajib diisi dengan benar.", "error");
    return;
  }

  const beratKg = bacaBeratKg(beratRaw);

  if (beratKg <= 0) {
    tampilkanPesan(pesanHarian, "Tanggal dan berat badan wajib diisi dengan benar.", "error");
    return;
  }

  tampilkanPesan(pesanHarian, "Menyimpan...", "");

  const { data, error } = await supabaseClient
    .from("catatan_harian")
    .insert({
      tanggal: tanggal,
      berat: beratKg,
      air: Number(air) || 0,
      latihan: latihan,
      nutrisi: nutrisi,
      user_id: userSaatIni,
      target_id: idTargetAktif,
    })
    .select();

  if (error) {
    tampilkanPesan(pesanHarian, "Gagal menyimpan ke database: " + error.message, "error");
    return;
  }

  catatanHarian.push(data[0]);

  tampilkanPesan(pesanHarian, "Catatan tersimpan ke database!", "sukses");

  tampilkanCatatan();
  gambarGrafik();
  perbaruiStatusTargetTercapai();
  formHarian.reset();
});

function tampilkanCatatan() {
  daftarCatatan.innerHTML = "";

  catatanPeriodeAktif().forEach(function (catatan) {
    const item = document.createElement("div");
    item.className = "log-item";
    item.innerHTML = `
      <span class="log-tanggal">${catatan.tanggal}</span>
      <span class="log-detail">${formatBerat(catatan.berat)} · ${catatan.air} L · ${catatan.latihan}${catatan.nutrisi ? " · " + catatan.nutrisi : ""}</span>
    `;
    daftarCatatan.appendChild(item);
  });
}

function formatTanggalSingkat(tanggalISO) {
  const bagian = tanggalISO.split("-");
  return `${bagian[2]}/${bagian[1]}`;
}

function gambarGrafik() {
  grafikBerat.innerHTML = "";
  grafikTanggal.innerHTML = "";

  const data = catatanPeriodeAktif();

  if (data.length === 0) return;

  const semuaBerat = data.map(function (catatan) {
    return Number(catatan.berat);
  });

  const beratMin = Math.min(...semuaBerat);
  const beratMax = Math.max(...semuaBerat);
  const rentang = beratMax - beratMin || 1;

  function hitungTinggiPersen(berat) {
    return ((berat - beratMin) / rentang) * 80 + 20;
  }

  data.forEach(function (catatan, index) {
    const tinggiPersen = hitungTinggiPersen(Number(catatan.berat));

    const bar = document.createElement("div");
    bar.className = "bar";

    if (index > 0) {
      const beratSebelumnya = Number(data[index - 1].berat);
      bar.classList.add(Number(catatan.berat) <= beratSebelumnya ? "bar-turun" : "bar-naik");
    }

    const label = document.createElement("span");
    label.textContent = formatBerat(catatan.berat);
    bar.appendChild(label);

    grafikBerat.appendChild(bar);

    bar.style.height = "0%";
    requestAnimationFrame(function () {
      bar.style.height = tinggiPersen + "%";
    });

    const labelTanggal = document.createElement("span");
    labelTanggal.textContent = formatTanggalSingkat(catatan.tanggal);
    grafikTanggal.appendChild(labelTanggal);
  });

  const targetBeratRaw = document.getElementById("target-berat").value;
  if (targetBeratRaw !== "") {
    const targetBeratKg = bacaBeratKg(targetBeratRaw);
    let posisiPersen = hitungTinggiPersen(targetBeratKg);
    posisiPersen = Math.max(0, Math.min(100, posisiPersen));

    const garis = document.createElement("div");
    garis.className = "garis-target";
    garis.style.bottom = posisiPersen + "%";

    const labelGaris = document.createElement("span");
    labelGaris.textContent = `Target: ${formatBerat(targetBeratKg)}`;
    garis.appendChild(labelGaris);

    grafikBerat.appendChild(garis);
  }
}

/* ---------- Ringkasan Mingguan ---------- */

function tampilkanRingkasan() {
  const ringkasanKosong = document.getElementById("ringkasanKosong");
  const ringkasanIsi = document.getElementById("ringkasanIsi");

  // Cuma ambil catatan dari 7 hari terakhir, biar ini beneran
  // "ringkasan mingguan" - bukan rata-rata dari semua data sepanjang waktu.
  const tujuhHariLalu = new Date();
  tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 7);

  const catatanMingguIni = catatanPeriodeAktif().filter(function (c) {
    return new Date(c.tanggal) >= tujuhHariLalu;
  });

  if (catatanMingguIni.length === 0) {
    ringkasanKosong.style.display = "block";
    ringkasanIsi.classList.add("ringkasan-tersembunyi");
    return;
  }

  ringkasanKosong.style.display = "none";
  ringkasanIsi.classList.remove("ringkasan-tersembunyi");

  const beratArray = catatanMingguIni.map(function (c) {
    return Number(c.berat);
  });
  const airArray = catatanMingguIni.map(function (c) {
    return Number(c.air) || 0;
  });

  const rataBerat = beratArray.reduce(function (total, angka) {
    return total + angka;
  }, 0) / beratArray.length;

  const rataAir = airArray.reduce(function (total, angka) {
    return total + angka;
  }, 0) / airArray.length;

  const beratAwal = beratArray[0];
  const beratAkhir = beratArray[beratArray.length - 1];
  const perubahanKg = beratAkhir - beratAwal;

  const elPerubahan = document.getElementById("ringkasanPerubahan");
  const perubahanTampil = satuanAktif === "kg" ? perubahanKg : kgKeLb(perubahanKg);

  if (perubahanKg > 0) {
    elPerubahan.textContent = `+${perubahanTampil.toFixed(1)} ${satuanAktif}`;
    // Warna ini SENGAJA di-hardcode (bukan ngikut var(--danger) yang beda
    // per tema terang/gelap), soalnya layar LCD ini bg-nya emang selalu
    // gelap biarpun tema halamannya lagi terang atau gelap.
    elPerubahan.style.color = "#FF6B61";
  } else {
    elPerubahan.textContent = `${perubahanTampil.toFixed(1)} ${satuanAktif}`;
    elPerubahan.style.color = "";
  }

  document.getElementById("statRataBerat").textContent = formatBerat(rataBerat);
  document.getElementById("statRataAir").textContent = rataAir.toFixed(1);
  document.getElementById("statJumlahHari").textContent = catatanMingguIni.length;
}

/* ---------- Kasih Masukan ---------- */

const formMasukan = document.getElementById("masukanForm");
const pesanMasukan = document.getElementById("pesanMasukan");
const statusMasukan = document.getElementById("statusMasukan");

formMasukan.addEventListener("submit", async function (event) {
  event.preventDefault();

  const pesan = pesanMasukan.value.trim();

  if (pesan === "") {
    tampilkanPesan(statusMasukan, "Masukan wajib diisi terlebih dahulu.", "error");
    return;
  }

  tampilkanPesan(statusMasukan, "Mengirim...", "");

  const { error } = await supabaseClient
    .from("masukan")
    .insert({ pesan: pesan, user_id: userSaatIni });

  if (error) {
    tampilkanPesan(statusMasukan, "Gagal mengirim: " + error.message, "error");
    return;
  }

  tampilkanPesan(statusMasukan, "Terima kasih! Masukan Anda telah terkirim.", "sukses");
  formMasukan.reset();
});

/* ---------- Getar (Haptic Feedback) ---------- */

// Getar tipis tiap kali nge-tap TOMBOL apapun di app ini (nav, submit,
// dll) - kayak feedback yang biasa dirasain di app native. Cuma jalan
// di HP yang browser-nya dukung Vibration API (kebanyakan Android;
// iPhone/Safari belum dukung, jadi di situ ya diem aja, nggak error).
document.addEventListener("click", function (event) {
  if (event.target.closest("button") && navigator.vibrate) {
    navigator.vibrate(10);
  }
});

/* ---------- Swipe Kiri/Kanan Buat Pindah Tab ---------- */

// urutanLangkah dipakai di sini - pakai urutanTab yang sudah didefinisikan
// di bagian navigasi di atas (nggak perlu didefinisikan ulang)
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener(
  "touchstart",
  function (event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  },
  { passive: true }
);

document.addEventListener(
  "touchend",
  function (event) {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;

    // Cuma dianggap "swipe pindah tab" kalau geraknya jelas lebih
    // horizontal daripada vertikal (biar nggak ke-trigger pas orang
    // scroll biasa), dan jaraknya cukup jauh (bukan cuma nge-tap).
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) {
      return;
    }

    const langkahAktifSaatIni = document.querySelector(".langkah.aktif");
    if (!langkahAktifSaatIni) return;

    const indexSekarang = urutanTab.indexOf(langkahAktifSaatIni.id);
    if (indexSekarang === -1) return;

    if (deltaX < 0 && indexSekarang < urutanTab.length - 1) {
      pindahKe(urutanTab[indexSekarang + 1]);
    } else if (deltaX > 0 && indexSekarang > 0) {
      pindahKe(urutanTab[indexSekarang - 1]);
    }
  },
  { passive: true }
);
