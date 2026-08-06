/* ---------- Setup Supabase ---------- */

const SUPABASE_URL = "https://xtyahgoipkrtcejbirrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_EMCUNoKr1o7Cbvc0_SNQhA_2HDK4ZUu";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    pesanAuth.textContent = "Isi email dan password dulu ya.";
    pesanAuth.style.color = "red";
    return;
  }

  pesanAuth.textContent = "Mendaftarkan...";
  pesanAuth.style.color = "";

  const { error } = await supabaseClient.auth.signUp({
    email: authEmail.value,
    password: authPassword.value,
  });

  if (error) {
    pesanAuth.textContent = "Gagal daftar: " + error.message;
    pesanAuth.style.color = "red";
    return;
  }

  pesanAuth.textContent = "Berhasil daftar! Cek email kamu buat konfirmasi, baru bisa masuk.";
  pesanAuth.style.color = "#1F7A3D";
});

btnMasuk.addEventListener("click", async function () {
  if (authEmail.value === "" || authPassword.value === "") {
    pesanAuth.textContent = "Isi email dan password dulu ya.";
    pesanAuth.style.color = "red";
    return;
  }

  pesanAuth.textContent = "Masuk...";
  pesanAuth.style.color = "";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: authEmail.value,
    password: authPassword.value,
  });

  if (error) {
    pesanAuth.textContent = "Gagal masuk: " + error.message;
    pesanAuth.style.color = "red";
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
    pesanAuth.textContent = "";
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

// Baca nilai mentah dari sebuah input berat, dan selalu kembalikan dalam kg —
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

/* ---------- Pengingat harian ---------- */

const inputJamPengingat = document.getElementById("jamPengingat");
const btnAktifkanPengingat = document.getElementById("btnAktifkanPengingat");
const btnTesPengingat = document.getElementById("btnTesPengingat");
const statusPengingat = document.getElementById("statusPengingat");

btnTesPengingat.addEventListener("click", function () {
  if (!("Notification" in window)) {
    statusPengingat.textContent = "Browser kamu nggak mendukung notifikasi.";
    statusPengingat.style.color = "red";
    return;
  }

  Notification.requestPermission().then(function (izin) {
    if (izin !== "granted") {
      statusPengingat.textContent = "Izin notifikasi belum aktif. Klik ikon gembok/info di address bar browser, cari 'Notifications', pastikan di-Allow.";
      statusPengingat.style.color = "red";
      return;
    }

    new Notification("Weight Cut Tracker", {
      body: "Ini notifikasi tes — kalau ini muncul, pengingat kamu bakal jalan!",
    });

    statusPengingat.textContent = "Notifikasi tes terkirim. Muncul di layar kamu nggak?";
    statusPengingat.style.color = "#1F7A3D";
  });
});

btnAktifkanPengingat.addEventListener("click", function () {
  if (!("Notification" in window)) {
    statusPengingat.textContent = "Browser kamu nggak mendukung notifikasi.";
    statusPengingat.style.color = "red";
    return;
  }

  if (inputJamPengingat.value === "") {
    statusPengingat.textContent = "Pilih jam pengingat dulu.";
    statusPengingat.style.color = "red";
    return;
  }

  Notification.requestPermission().then(function (izin) {
    if (izin !== "granted") {
      statusPengingat.textContent = "Izin notifikasi ditolak. Kamu bisa ubah lagi lewat setting browser.";
      statusPengingat.style.color = "red";
      return;
    }

    const bagianJam = inputJamPengingat.value.split(":").map(Number);
    const jam = bagianJam[0];
    const menit = bagianJam[1];

    const sekarang = new Date();
    const waktuPengingat = new Date();
    waktuPengingat.setHours(jam, menit, 0, 0);

    if (waktuPengingat <= sekarang) {
      waktuPengingat.setDate(waktuPengingat.getDate() + 1);
    }

    const selisihMs = waktuPengingat - sekarang;

    setTimeout(function () {
      new Notification("Weight Cut Tracker", {
        body: "Waktunya catat progres weight cut kamu hari ini! 💪",
      });
    }, selisihMs);

    statusPengingat.textContent = `Pengingat aktif jam ${inputJamPengingat.value} (selama halaman ini masih kebuka).`;
    statusPengingat.style.color = "#1F7A3D";
  });
});

/* ---------- Navigasi antar langkah ---------- */

const semuaLangkah = document.querySelectorAll(".langkah");
const semuaNavBtn = document.querySelectorAll(".nav-btn");
const semuaBtnLanjut = document.querySelectorAll(".btn-lanjut");

function pindahKe(idTujuan) {
  semuaLangkah.forEach(function (langkah) {
    langkah.classList.remove("aktif");
  });
  document.getElementById(idTujuan).classList.add("aktif");

  semuaNavBtn.forEach(function (btn) {
    btn.classList.toggle("aktif", btn.dataset.tujuan === idTujuan);
  });

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
    pesanProfil.textContent = "Nama wajib diisi dulu ya.";
    pesanProfil.style.color = "red";
    return;
  }

  if (beratRaw === "") {
    pesanProfil.textContent = "Berat badan harus diisi dengan angka yang valid.";
    pesanProfil.style.color = "red";
    return;
  }

  const beratKg = bacaBeratKg(beratRaw);

  if (beratKg <= 0) {
    pesanProfil.textContent = "Berat badan harus diisi dengan angka yang valid.";
    pesanProfil.style.color = "red";
    return;
  }

  pesanProfil.textContent = "Nyimpen...";
  pesanProfil.style.color = "";

  const { error } = await supabaseClient
    .from("profil")
    .insert({ nama: nama, peran: peran, berat_awal: beratKg, user_id: userSaatIni });

  if (error) {
    pesanProfil.textContent = "Gagal nyimpen ke database: " + error.message;
    pesanProfil.style.color = "red";
    return;
  }

  pesanProfil.textContent = `Profil untuk ${nama} berhasil dibuat! Berat awal: ${formatBerat(beratKg)}.`;
  pesanProfil.style.color = "#1F7A3D";
});

async function muatProfilTerbaru() {
  const { data, error } = await supabaseClient
    .from("profil")
    .select("*")
    .eq("user_id", userSaatIni)
    .order("created_at", { ascending: false })
    .limit(1);

  // Selalu kosongin dulu — biar nggak kebawa sisa data akun sebelumnya
  // kalau akun yang lagi login ini ternyata belum punya profil.
  document.getElementById("nama").value = "";
  document.getElementById("peran").value = "atlet";
  document.getElementById("berat-sekarang").value = "";
  pesanProfil.textContent = "";

  if (error || !data || data.length === 0) return;

  const profil = data[0];
  document.getElementById("nama").value = profil.nama;
  document.getElementById("peran").value = profil.peran;
  document.getElementById("berat-sekarang").value = profil.berat_awal;

  pesanProfil.textContent = `Selamat datang kembali, ${profil.nama}!`;
  pesanProfil.style.color = "#1F7A3D";
}

/* ---------- Form Target ---------- */

const formTarget = document.getElementById("targetForm");
const pesanTarget = document.getElementById("pesanTarget");
const layarTarget = document.getElementById("layarTarget");
const angkaHari = document.getElementById("angkaHari");

formTarget.addEventListener("submit", async function (event) {
  event.preventDefault();

  const targetBeratRaw = document.getElementById("target-berat").value;
  const tanggalWeighin = document.getElementById("tanggal-weighin").value;

  if (targetBeratRaw === "") {
    pesanTarget.textContent = "Target berat harus diisi angka yang valid.";
    pesanTarget.style.color = "red";
    return;
  }

  const targetBeratKg = bacaBeratKg(targetBeratRaw);

  if (targetBeratKg <= 0) {
    pesanTarget.textContent = "Target berat harus diisi angka yang valid.";
    pesanTarget.style.color = "red";
    return;
  }

  if (targetBeratKg < 45) {
    pesanTarget.textContent = "⚠️ Target ini berisiko tinggi buat kesehatan. Sebaiknya diskusikan dulu sama dokter/nutrisionis olahraga sebelum lanjut.";
    pesanTarget.style.color = "red";
    return;
  }

  if (tanggalWeighin === "") {
    pesanTarget.textContent = "Tanggal weigh-in wajib diisi.";
    pesanTarget.style.color = "red";
    return;
  }

  const hariIni = new Date();
  const tanggalTarget = new Date(tanggalWeighin);
  const selisihMs = tanggalTarget - hariIni;
  const selisihHari = Math.ceil(selisihMs / (1000 * 60 * 60 * 24));

  if (selisihHari < 0) {
    pesanTarget.textContent = "Tanggal weigh-in itu udah lewat, coba cek lagi tanggalnya.";
    pesanTarget.style.color = "red";
    return;
  }

  pesanTarget.textContent = "Nyimpen...";
  pesanTarget.style.color = "";

  const { error } = await supabaseClient
    .from("target")
    .insert({ target_berat: targetBeratKg, tanggal_weighin: tanggalWeighin, user_id: userSaatIni });

  if (error) {
    pesanTarget.textContent = "Gagal nyimpen ke database: " + error.message;
    pesanTarget.style.color = "red";
    return;
  }

  pesanTarget.textContent = `Target ${formatBerat(targetBeratKg)} tersimpan.`;
  pesanTarget.style.color = "#1F7A3D";

  angkaHari.textContent = selisihHari;
  layarTarget.classList.remove("layar-tersembunyi");

  gambarGrafik();
});

async function muatTargetTerbaru() {
  const { data, error } = await supabaseClient
    .from("target")
    .select("*")
    .eq("user_id", userSaatIni)
    .order("created_at", { ascending: false })
    .limit(1);

  // Sama kayak profil — kosongin dulu, biar nggak kebawa sisa data
  // akun sebelumnya.
  document.getElementById("target-berat").value = "";
  document.getElementById("tanggal-weighin").value = "";
  pesanTarget.textContent = "";
  layarTarget.classList.add("layar-tersembunyi");

  if (error || !data || data.length === 0) return;

  const target = data[0];
  document.getElementById("target-berat").value = target.target_berat;
  document.getElementById("tanggal-weighin").value = target.tanggal_weighin;

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

async function muatDataDariSupabase() {
  const { data, error } = await supabaseClient
    .from("catatan_harian")
    .select("*")
    .eq("user_id", userSaatIni)
    .order("tanggal", { ascending: true });

  if (error) {
    pesanHarian.textContent = "Gagal ambil data dari database: " + error.message;
    pesanHarian.style.color = "red";
    return;
  }

  catatanHarian = data;
  tampilkanCatatan();
  gambarGrafik();
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
    pesanHarian.textContent = "Tanggal dan berat badan wajib diisi dengan benar.";
    pesanHarian.style.color = "red";
    return;
  }

  const beratKg = bacaBeratKg(beratRaw);

  if (beratKg <= 0) {
    pesanHarian.textContent = "Tanggal dan berat badan wajib diisi dengan benar.";
    pesanHarian.style.color = "red";
    return;
  }

  pesanHarian.textContent = "Nyimpen...";
  pesanHarian.style.color = "";

  const { data, error } = await supabaseClient
    .from("catatan_harian")
    .insert({
      tanggal: tanggal,
      berat: beratKg,
      air: Number(air) || 0,
      latihan: latihan,
      nutrisi: nutrisi,
      user_id: userSaatIni,
    })
    .select();

  if (error) {
    pesanHarian.textContent = "Gagal nyimpen ke database: " + error.message;
    pesanHarian.style.color = "red";
    return;
  }

  catatanHarian.push(data[0]);

  pesanHarian.textContent = "Catatan tersimpan ke database!";
  pesanHarian.style.color = "#1F7A3D";

  tampilkanCatatan();
  gambarGrafik();
  formHarian.reset();
});

function tampilkanCatatan() {
  daftarCatatan.innerHTML = "";

  catatanHarian.forEach(function (catatan) {
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

  if (catatanHarian.length === 0) return;

  const semuaBerat = catatanHarian.map(function (catatan) {
    return Number(catatan.berat);
  });

  const beratMin = Math.min(...semuaBerat);
  const beratMax = Math.max(...semuaBerat);
  const rentang = beratMax - beratMin || 1;

  function hitungTinggiPersen(berat) {
    return ((berat - beratMin) / rentang) * 80 + 20;
  }

  catatanHarian.forEach(function (catatan, index) {
    const tinggiPersen = hitungTinggiPersen(Number(catatan.berat));

    const bar = document.createElement("div");
    bar.className = "bar";

    if (index > 0) {
      const beratSebelumnya = Number(catatanHarian[index - 1].berat);
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
  // "ringkasan mingguan" — bukan rata-rata dari semua data sepanjang waktu.
  const tujuhHariLalu = new Date();
  tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 7);

  const catatanMingguIni = catatanHarian.filter(function (c) {
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
    elPerubahan.style.color = "#C1272D";
  } else {
    elPerubahan.textContent = `${perubahanTampil.toFixed(1)} ${satuanAktif}`;
    elPerubahan.style.color = "";
  }

  document.getElementById("statRataBerat").textContent = formatBerat(rataBerat);
  document.getElementById("statRataAir").textContent = rataAir.toFixed(1);
  document.getElementById("statJumlahHari").textContent = catatanMingguIni.length;
}
