(function () {
  "use strict";

  // URL Web App Apps Script untuk data dashboard (lihat apps-script/dashboard-api.gs).
  // Biarkan kosong agar dashboard memakai data contoh tanpa permintaan jaringan.
  var ENDPOINT = "";
  var DEMO_SEED = 20261030;
  var PALETTE = ["#1b7f4b", "#2f9e8f", "#f4a300", "#e07b00", "#c0392b"];
  var MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  var CLUSTER_NAMES = {
    2: ["Puas Tinggi", "Puas Rendah"],
    3: ["Puas Tinggi", "Puas Sedang", "Puas Rendah"],
    4: ["Sangat Puas", "Puas", "Cukup", "Kurang"],
    5: ["Sangat Puas", "Puas", "Cukup", "Kurang", "Sangat Kurang"],
  };

  // Sembilan unsur SKM beserta pilihan jawaban pada formulir survei.
  var DIMS = [
    {
      key: "q1",
      label: "Persyaratan",
      group: "core",
      options: [
        { value: "Tidak sesuai", aliases: ["Tidak sesuai", "Kurang sesuai"] },
        { value: "Sesuai", aliases: ["Sesuai", "Cukup sesuai"] },
        { value: "Sangat sesuai", aliases: ["Sangat sesuai"] },
      ],
    },
    {
      key: "q2",
      label: "Prosedur",
      group: "core",
      options: [
        { value: "Tidak mudah", aliases: ["Tidak mudah"] },
        { value: "Kurang mudah", aliases: ["Kurang mudah"] },
        { value: "Mudah", aliases: ["Mudah"] },
        { value: "Sangat mudah", aliases: ["Sangat mudah"] },
      ],
    },
    {
      key: "q3",
      label: "Waktu Pelayanan",
      group: "core",
      options: [
        { value: "Tidak cepat", aliases: ["Tidak cepat"] },
        { value: "Kurang cepat", aliases: ["Kurang cepat"] },
        { value: "Cepat", aliases: ["Cepat"] },
        { value: "Sangat cepat", aliases: ["Sangat cepat", "Selalu tepat"] },
      ],
    },
    {
      key: "q4",
      label: "Biaya/Tarif",
      group: "core",
      options: [
        { value: "Sangat mahal", aliases: ["Sangat mahal"] },
        { value: "Cukup mahal", aliases: ["Cukup mahal"] },
        { value: "Murah", aliases: ["Murah"] },
        { value: "Gratis", aliases: ["Gratis"] },
      ],
    },
    {
      key: "q5",
      label: "Produk Layanan",
      group: "mutu",
      options: [
        {
          value: "Tidak sesuai",
          aliases: ["Tidak sesuai", "Kurang ramah/kurang sopan"],
        },
        {
          value: "Kurang sesuai",
          aliases: [
            "Kurang sesuai",
            "Cuku Ramah/cukup sopan",
            "Cukup ramah/cukup sopan",
          ],
        },
        { value: "Sesuai", aliases: ["Sesuai", "Ramah/sopan"] },
        {
          value: "Sangat sesuai",
          aliases: [
            "Sangat sesuai",
            "Sangat Ramah/sangat sopan",
            "Sangat ramah/sangat sopan",
          ],
        },
      ],
    },
    {
      key: "q6",
      label: "Kompetensi Petugas",
      group: "mutu",
      options: [
        { value: "Tidak mampu", aliases: ["Tidak mampu"] },
        { value: "Kurang mampu", aliases: ["Kurang mampu"] },
        { value: "Mampu", aliases: ["Mampu"] },
        { value: "Sangat mampu", aliases: ["Sangat mampu"] },
      ],
    },
    {
      key: "q7",
      label: "Perilaku Petugas",
      group: "mutu",
      options: [
        {
          value: "Tidak sopan dan ramah",
          aliases: ["Tidak sopan dan ramah"],
        },
        {
          value: "Kurang sopan dan ramah",
          aliases: ["Kurang sopan dan ramah"],
        },
        { value: "Sopan dan ramah", aliases: ["Sopan dan ramah"] },
        {
          value: "Sangat sopan dan ramah",
          aliases: ["Sangat sopan dan ramah"],
        },
      ],
    },
    {
      key: "q8",
      label: "Sarana & Prasarana",
      group: "mutu",
      options: [
        { value: "Buruk", aliases: ["Buruk"] },
        { value: "Cukup", aliases: ["Cukup"] },
        { value: "Baik", aliases: ["Baik"] },
        { value: "Sangat baik", aliases: ["Sangat baik"] },
      ],
    },
    {
      key: "q9",
      label: "Penanganan Pengaduan",
      group: "mutu",
      options: [
        { value: "Tidak ada", aliases: ["Tidak ada", "Tidak ada penanganan"] },
        {
          value: "Ada tapi tidak berfungsi",
          aliases: [
            "Ada tapi tidak berfungsi",
            "Kurang Tertangani",
            "Kurang tertangani",
          ],
        },
        {
          value: "Berfungsi kurang maksimal",
          aliases: ["Berfungsi kurang maksimal", "Tertangani"],
        },
        {
          value: "Dikelola dengan baik",
          aliases: ["Dikelola dengan baik", "Tertangani dengan baik"],
        },
      ],
    },
  ];

  var els = {
    sourceBadge: document.getElementById("sourceBadge"),
    refreshBtn: document.getElementById("refreshBtn"),
    dataNote: document.getElementById("dataNote"),
    filterFrom: document.getElementById("filterFrom"),
    filterTo: document.getElementById("filterTo"),
    filterService: document.getElementById("filterService"),
    filterGender: document.getElementById("filterGender"),
    resetFilter: document.getElementById("resetFilter"),
    filterStatus: document.getElementById("filterStatus"),
    kpiTotal: document.getElementById("kpiTotal"),
    kpiTotalSub: document.getElementById("kpiTotalSub"),
    kpiIndex: document.getElementById("kpiIndex"),
    kpiIndexCat: document.getElementById("kpiIndexCat"),
    kpiK: document.getElementById("kpiK"),
    kpiAttention: document.getElementById("kpiAttention"),
    kpiAttentionSub: document.getElementById("kpiAttentionSub"),
    kRange: document.getElementById("kRange"),
    kOut: document.getElementById("kOut"),
    scatter: document.getElementById("scatter"),
    clusterLegend: document.getElementById("clusterLegend"),
    clusterBars: document.getElementById("clusterBars"),
    histogram: document.getElementById("histogram"),
    unsurBars: document.getElementById("unsurBars"),
    serviceBars: document.getElementById("serviceBars"),
    trendChart: document.getElementById("trendChart"),
    recommendations: document.getElementById("recommendations"),
    clusterTableBody: document.getElementById("clusterTableBody"),
    dataTableBody: document.getElementById("dataTableBody"),
    dataSummary: document.getElementById("dataSummary"),
  };

  var state = {
    all: [],
    filtered: [],
    k: 3,
    clusters: null,
    source: "demo",
  };

  /* ----------------------------- Utilities ----------------------------- */

  function mean(arr) {
    return arr.length
      ? arr.reduce(function (a, b) {
          return a + b;
        }, 0) / arr.length
      : 0;
  }

  function stdev(arr) {
    if (arr.length < 2) return 0;
    var m = mean(arr);
    return Math.sqrt(
      mean(
        arr.map(function (v) {
          return (v - m) * (v - m);
        })
      )
    );
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function num(v, d) {
    d = d == null ? 1 : d;
    return Number(v).toLocaleString("id-ID", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeText(s) {
    return String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function unique(arr) {
    var seen = {};
    var out = [];
    arr.forEach(function (v) {
      if (!seen[v]) {
        seen[v] = 1;
        out.push(v);
      }
    });
    return out;
  }

  function category(v) {
    if (v >= 81.26) return { code: "A", label: "Sangat Baik", tone: "best" };
    if (v >= 62.51) return { code: "B", label: "Baik", tone: "good" };
    if (v >= 43.76) return { code: "C", label: "Cukup", tone: "fair" };
    return { code: "D", label: "Kurang", tone: "poor" };
  }

  function binColor(mid) {
    if (mid >= 81.25) return "#1b7f4b";
    if (mid >= 62.5) return "#2f9e8f";
    if (mid >= 43.75) return "#f4a300";
    return "#c0392b";
  }

  function toDateKey(value) {
    if (value === null || value === undefined || value === "") return "";
    var s = String(value).trim();
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[1] + "-" + m[2] + "-" + m[3];
    var m2 = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
    if (m2) {
      return m2[3] + "-" + pad2(Number(m2[2])) + "-" + pad2(Number(m2[1]));
    }
    var d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
    }
    return "";
  }

  function prettyDate(key) {
    if (!key) return "-";
    var p = key.split("-");
    if (p.length !== 3) return key;
    return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0];
  }

  function monthLabel(key) {
    var p = key.split("-");
    return MONTHS[Number(p[1]) - 1] + " " + p[0];
  }

  function dateLabel(key) {
    var p = key.split("-");
    return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1];
  }

  /* --------------------------- Data parsing ---------------------------- */

  function parseAnswer(dimIndex, raw) {
    if (raw === null || raw === undefined || raw === "") return null;
    var dim = DIMS[dimIndex];
    var n = dim.options.length;

    if (typeof raw === "number") {
      if (raw >= 0 && raw <= n - 1) return Math.round(raw);
      if (raw >= 1 && raw <= 4) return Math.round(((raw - 1) * (n - 1)) / 3);
      return null;
    }

    var s = String(raw).trim();
    var numeric = s.replace(",", ".");
    if (/^[0-9]+([.,][0-9]+)?$/.test(s)) {
      var v = Number(numeric);
      if (v >= 0 && v <= n - 1 && Math.floor(v) === v) return v;
      if (v >= 1 && v <= 4) return Math.round(((v - 1) * (n - 1)) / 3);
    }

    var norm = normalizeText(s);
    if (!norm) return null;

    for (var i = 0; i < n; i++) {
      var aliases = dim.options[i].aliases || [dim.options[i].value];
      for (var j = 0; j < aliases.length; j++) {
        if (normalizeText(aliases[j]) === norm) return i;
      }
    }
    return null;
  }

  function pickField(obj, names) {
    var keys = Object.keys(obj);
    for (var i = 0; i < names.length; i++) {
      var target = normalizeText(names[i]);
      for (var j = 0; j < keys.length; j++) {
        if (normalizeText(keys[j]) === target) return obj[keys[j]];
      }
    }
    return "";
  }

  function getAnswerRaw(obj, n) {
    var keys = Object.keys(obj);
    var targets = [
      "q" + n,
      "p" + n,
      "pertanyaan" + n,
      "soal" + n,
      "unsur" + n,
      "q" + ("0" + n).slice(-2),
    ];
    for (var i = 0; i < keys.length; i++) {
      if (targets.indexOf(normalizeText(keys[i])) !== -1) return obj[keys[i]];
    }
    return null;
  }

  function buildRespondent(obj) {
    if (!obj || typeof obj !== "object") return null;
    var scores = [];
    for (var i = 0; i < DIMS.length; i++) {
      var idx = parseAnswer(i, getAnswerRaw(obj, i + 1));
      if (idx === null) return null;
      var n = DIMS[i].options.length;
      scores.push(1 + (idx / (n - 1)) * 3);
    }
    var index = (mean(scores) / 4) * 100;
    var core = (mean(scores.slice(0, 4)) / 4) * 100;
    var mutu = (mean(scores.slice(4, 9)) / 4) * 100;
    var tanggal = String(
      pickField(obj, ["tanggal", "timestamp", "waktu", "date"]) || ""
    );
    return {
      tanggal: tanggal,
      dateKey: toDateKey(tanggal),
      gender: String(
        pickField(obj, ["jenis_kelamin", "jenis kelamin", "gender", "jk"]) || ""
      ),
      usia: String(pickField(obj, ["usia", "umur", "age"]) || ""),
      pendidikan: String(pickField(obj, ["pendidikan", "education"]) || ""),
      pekerjaan: String(
        pickField(obj, ["pekerjaan", "job", "profesi"]) || ""
      ),
      layanan: String(
        pickField(obj, ["jenis_layanan", "jenis layanan", "layanan", "service"]) || ""
      ),
      scores: scores,
      index: index,
      core: core,
      mutu: mutu,
      category: category(index),
    };
  }

  /* ----------------------------- Demo data ----------------------------- */

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomDate(rng) {
    var now = new Date();
    var d = new Date(now.getTime() - Math.floor(rng() * 75) * 86400000);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function generateDemoData() {
    var rng = mulberry32(DEMO_SEED);
    var target = 68;
    var mix = [
      { w: 0.3, b: 0.78 },
      { w: 0.42, b: 0.52 },
      { w: 0.28, b: 0.28 },
    ];
    var basePool = [];
    mix.forEach(function (m) {
      var count = Math.round(target * m.w);
      for (var i = 0; i < count; i++) basePool.push(m.b);
    });
    while (basePool.length < target) basePool.push(0.52);
    basePool = basePool.slice(0, target);
    for (var i = basePool.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = basePool[i];
      basePool[i] = basePool[j];
      basePool[j] = t;
    }

    var pendidikan = ["SD", "SMP", "SMA/SMK", "D3", "S1", "S2"];
    var pekerjaan = [
      "Petani",
      "Pedagang",
      "Guru",
      "Karyawan Swasta",
      "Ibu Rumah Tangga",
      "PNS",
      "Wirausaha",
      "Buruh",
    ];
    var layanan = [
      "Surat Pengantar",
      "Legalisasi Dokumen",
      "Keterangan Domisili",
      "Perizinan",
      "Pengaduan",
      "Lainnya",
    ];

    var out = [];
    for (var r = 0; r < target; r++) {
      var base = basePool[r];
      var coreBias = clamp(base + (rng() - 0.5) * 0.26, 0.05, 0.98);
      var mutuBias = clamp(base + (rng() - 0.5) * 0.34, 0.05, 0.98);
      var obj = {
        tanggal: randomDate(rng),
        jenis_kelamin: rng() < 0.5 ? "Laki-laki" : "Perempuan",
        pendidikan: pendidikan[Math.floor(rng() * pendidikan.length)],
        pekerjaan: pekerjaan[Math.floor(rng() * pekerjaan.length)],
        usia: 18 + Math.floor(rng() * 53),
        jenis_layanan: layanan[Math.floor(rng() * layanan.length)],
      };
      DIMS.forEach(function (dim, di) {
        var n = dim.options.length;
        var bias = di < 4 ? coreBias : mutuBias;
        var frac = clamp(bias + (rng() - 0.5) * 0.55, 0, 1);
        var idx = Math.round(frac * (n - 1));
        obj["q" + (di + 1)] = dim.options[idx].value;
      });
      var resp = buildRespondent(obj);
      if (resp) out.push(resp);
    }
    return out;
  }

  /* ------------------------------ K-Means ------------------------------ */

  function dist2(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    return dx * dx + dy * dy;
  }

  function minDist2(p, cents) {
    var m = Infinity;
    for (var i = 0; i < cents.length; i++) {
      var d = dist2(p, cents[i]);
      if (d < m) m = d;
    }
    return m;
  }

  function kmeans(points, k, seed) {
    var n = points.length;
    if (k > n) k = n;
    var rng = mulberry32(seed || 12345);

    var means = [0, 0];
    var stds = [1, 1];
    for (var d = 0; d < 2; d++) {
      var col = points.map(function (p) {
        return p[d];
      });
      means[d] = mean(col);
      stds[d] = stdev(col) || 1;
    }
    var pts = points.map(function (p) {
      return [(p[0] - means[0]) / stds[0], (p[1] - means[1]) / stds[1]];
    });

    // Inisialisasi k-means++ agar hasil lebih stabil.
    var cents = [pts[Math.floor(rng() * n)].slice()];
    while (cents.length < k) {
      var dists = pts.map(function (p) {
        return minDist2(p, cents);
      });
      var sum = dists.reduce(function (a, b) {
        return a + b;
      }, 0);
      var target = sum * rng();
      var idx = 0;
      for (var i = 0; i < n; i++) {
        target -= dists[i];
        if (target <= 0) {
          idx = i;
          break;
        }
      }
      cents.push(pts[idx].slice());
    }

    var assign = new Array(n).fill(-1);
    var iter = 0;
    var changed = true;
    while (changed && iter < 120) {
      changed = false;
      for (var i2 = 0; i2 < n; i2++) {
        var best = 0;
        var bd = Infinity;
        for (var c = 0; c < k; c++) {
          var dd = dist2(pts[i2], cents[c]);
          if (dd < bd) {
            bd = dd;
            best = c;
          }
        }
        if (assign[i2] !== best) {
          assign[i2] = best;
          changed = true;
        }
      }

      var sums = [];
      var counts = [];
      for (var c2 = 0; c2 < k; c2++) {
        sums.push([0, 0]);
        counts.push(0);
      }
      for (var i3 = 0; i3 < n; i3++) {
        var a = assign[i3];
        sums[a][0] += pts[i3][0];
        sums[a][1] += pts[i3][1];
        counts[a]++;
      }
      for (var c3 = 0; c3 < k; c3++) {
        if (counts[c3] > 0) {
          cents[c3][0] = sums[c3][0] / counts[c3];
          cents[c3][1] = sums[c3][1] / counts[c3];
        }
      }
      iter++;
    }

    var centsRaw = cents.map(function (c) {
      return [c[0] * stds[0] + means[0], c[1] * stds[1] + means[1]];
    });
    return { assignments: assign, centroids: centsRaw, iterations: iter, k: k };
  }

  function organizeClusters(respondents, raw, k) {
    var stats = [];
    for (var c = 0; c < k; c++) {
      stats.push({ sum: 0, count: 0, scores: new Array(DIMS.length).fill(0) });
    }
    raw.assignments.forEach(function (cluster, i) {
      var s = stats[cluster];
      s.sum += respondents[i].index;
      s.count++;
      respondents[i].scores.forEach(function (v, d) {
        s.scores[d] += v;
      });
    });

    var order = stats
      .map(function (s, i) {
        return { raw: i, avg: s.count ? s.sum / s.count : 0 };
      })
      .sort(function (a, b) {
        return b.avg - a.avg;
      });

    var rankOf = {};
    order.forEach(function (o, rank) {
      rankOf[o.raw] = rank;
    });

    var names = CLUSTER_NAMES[k] || CLUSTER_NAMES[3];
    var groups = [];
    order.forEach(function (o, rank) {
      var s = stats[o.raw];
      groups.push({
        rank: rank,
        name: names[rank] || "Kelompok " + (rank + 1),
        color: PALETTE[rank],
        count: s.count,
        avgIndex: s.count ? s.sum / s.count : 0,
        avgScores: s.scores.map(function (v) {
          return s.count ? v / s.count : 0;
        }),
      });
    });

    raw.assignments.forEach(function (cluster, i) {
      respondents[i].cluster = rankOf[cluster];
    });

    var centroids = new Array(k);
    order.forEach(function (o, rank) {
      centroids[rank] = raw.centroids[o.raw];
    });

    return {
      assignments: raw.assignments.map(function (c) {
        return rankOf[c];
      }),
      centroids: centroids,
      groups: groups,
      k: k,
      iterations: raw.iterations,
    };
  }

  /* ----------------------------- Filtering ----------------------------- */

  function populateFilters() {
    var dates = state.all
      .map(function (r) {
        return r.dateKey;
      })
      .filter(Boolean)
      .sort();
    var min = dates[0] || "";
    var max = dates[dates.length - 1] || "";

    els.filterFrom.min = min;
    els.filterFrom.max = max;
    els.filterTo.min = min;
    els.filterTo.max = max;
    els.filterFrom.value = min;
    els.filterTo.value = max;

    var services = unique(
      state.all
        .map(function (r) {
          return r.layanan;
        })
        .filter(Boolean)
    ).sort();

    els.filterService.innerHTML =
      '<option value="">Semua layanan</option>' +
      services
        .map(function (s) {
          return '<option value="' + esc(s) + '">' + esc(s) + "</option>";
        })
        .join("");

    var genders = unique(
      state.all
        .map(function (r) {
          return r.gender;
        })
        .filter(Boolean)
    ).sort();

    els.filterGender.innerHTML =
      '<option value="">Semua</option>' +
      genders
        .map(function (g) {
          return '<option value="' + esc(g) + '">' + esc(g) + "</option>";
        })
        .join("");
  }

  function applyFilters() {
    var from = els.filterFrom.value;
    var to = els.filterTo.value;
    var service = els.filterService.value;
    var gender = els.filterGender.value;

    state.filtered = state.all.filter(function (r) {
      if (from && r.dateKey && r.dateKey < from) return false;
      if (to && r.dateKey && r.dateKey > to) return false;
      if (service && r.layanan !== service) return false;
      if (gender && r.gender !== gender) return false;
      return true;
    });

    updateFilterStatus();
    renderAll();
  }

  function resetFilters() {
    var dates = state.all
      .map(function (r) {
        return r.dateKey;
      })
      .filter(Boolean)
      .sort();
    els.filterFrom.value = dates[0] || "";
    els.filterTo.value = dates[dates.length - 1] || "";
    els.filterService.value = "";
    els.filterGender.value = "";
    applyFilters();
  }

  function updateFilterStatus() {
    var parts = [];
    if (els.filterFrom.value) parts.push("dari " + prettyDate(els.filterFrom.value));
    if (els.filterTo.value) parts.push("sampai " + prettyDate(els.filterTo.value));
    if (els.filterService.value) parts.push("layanan: " + els.filterService.value);
    if (els.filterGender.value) parts.push("jenis kelamin: " + els.filterGender.value);
    els.filterStatus.textContent =
      "Menampilkan " +
      state.filtered.length +
      " dari " +
      state.all.length +
      " responden (" +
      (parts.length ? parts.join(", ") : "semua data") +
      ").";
  }

  function serviceStats(respondents) {
    var map = {};
    respondents.forEach(function (r) {
      var key = r.layanan || "Tidak disebutkan";
      if (!map[key]) map[key] = { sum: 0, count: 0 };
      map[key].sum += r.index;
      map[key].count++;
    });
    return Object.keys(map)
      .map(function (key) {
        return {
          name: key,
          avg: map[key].sum / map[key].count,
          count: map[key].count,
        };
      })
      .sort(function (a, b) {
        return b.avg - a.avg;
      });
  }

  function trendBuckets(respondents) {
    var withDate = respondents.filter(function (r) {
      return r.dateKey;
    });
    if (!withDate.length) return [];

    var dates = withDate
      .map(function (r) {
        return r.dateKey;
      })
      .sort();
    var monthSet = {};
    var daySet = {};
    dates.forEach(function (d) {
      monthSet[d.slice(0, 7)] = 1;
      daySet[d] = 1;
    });

    var mode =
      Object.keys(monthSet).length >= 2
        ? "month"
        : Object.keys(daySet).length > 15
        ? "week"
        : "day";

    var base = mode === "week" ? new Date(dates[0] + "T00:00:00") : null;
    var groups = {};

    withDate.forEach(function (r) {
      var key;
      var label;
      var order;
      if (mode === "month") {
        key = r.dateKey.slice(0, 7);
        label = monthLabel(key);
        order = Number(key.replace("-", ""));
      } else if (mode === "day") {
        key = r.dateKey;
        label = dateLabel(key);
        order = Number(r.dateKey.replace(/-/g, ""));
      } else {
        var d = new Date(r.dateKey + "T00:00:00");
        var w = Math.floor((d - base) / 604800000);
        key = "w" + w;
        order = w;
        var start = new Date(base.getTime() + w * 604800000);
        label = start.getDate() + " " + MONTHS[start.getMonth()];
      }
      if (!groups[key]) groups[key] = { sum: 0, count: 0, label: label, order: order };
      groups[key].sum += r.index;
      groups[key].count++;
    });

    return Object.keys(groups)
      .map(function (key) {
        var g = groups[key];
        return {
          key: key,
          label: g.label,
          avg: g.sum / g.count,
          count: g.count,
          order: g.order,
        };
      })
      .sort(function (a, b) {
        return a.order - b.order;
      });
  }

  /* ----------------------------- Rendering ----------------------------- */

  function renderAll() {
    var rs = state.filtered;
    if (!rs || rs.length < 2) {
      renderEmpty();
      return;
    }

    var points = rs.map(function (r) {
      return [r.core, r.mutu];
    });
    var k = clamp(state.k, 2, Math.min(5, rs.length));
    var raw = kmeans(points, k, DEMO_SEED + rs.length);
    state.clusters = organizeClusters(rs, raw, k);

    renderKpis();
    renderLegend();
    renderScatter();
    renderClusterBars();
    renderHistogram();
    renderUnsurBars();
    renderServiceBars();
    renderTrend();
    renderRecommendations();
    renderClusterTable();
    renderDataTable();

    els.dataSummary.textContent =
      "Lihat Data Responden (" + rs.length + " orang)";
  }

  function renderEmpty() {
    state.clusters = null;
    els.kpiTotal.textContent = "0";
    els.kpiTotalSub.textContent = "tidak ada responden pada filter ini";
    els.kpiIndex.textContent = "-";
    els.kpiIndexCat.textContent = "-";
    els.kpiIndexCat.className = "kpi-cat";
    els.kpiK.textContent = "-";
    els.kpiAttention.textContent = "0";
    els.kpiAttentionSub.textContent = "tidak ada data";
    els.scatter.innerHTML =
      '<div class="loading-box">Tidak ada cukup data pada filter ini. Coba ubah atau reset filter.</div>';
    els.histogram.innerHTML = "";
    els.trendChart.innerHTML = "";
    els.clusterLegend.innerHTML = "";
    els.clusterBars.innerHTML = "";
    els.unsurBars.innerHTML = "";
    els.serviceBars.innerHTML = "";
    els.recommendations.innerHTML =
      '<div class="loading-box">Belum ada data untuk dianalisis.</div>';
    els.clusterTableBody.innerHTML = "";
    els.dataTableBody.innerHTML = "";
    els.dataSummary.textContent = "Lihat Data Responden";
  }

  function renderKpis() {
    var rs = state.filtered;
    var avg = mean(
      rs.map(function (r) {
        return r.index;
      })
    );
    var cat = category(avg);

    var lowest = null;
    state.clusters.groups.forEach(function (g) {
      if (g.count > 0 && (!lowest || g.avgIndex < lowest.avgIndex)) lowest = g;
    });

    els.kpiTotal.textContent = num(rs.length, 0);
    els.kpiTotalSub.textContent =
      "dari " + num(state.all.length, 0) + " responden total";
    els.kpiIndex.textContent = num(avg, 1);
    els.kpiIndexCat.textContent = cat.code + " \u00b7 " + cat.label;
    els.kpiIndexCat.className = "kpi-cat tone-" + cat.tone;
    els.kpiK.textContent = state.clusters.k;
    if (lowest) {
      els.kpiAttention.textContent = num(lowest.count, 0);
      els.kpiAttentionSub.textContent =
        "kelompok " + lowest.name + " (" + num(lowest.avgIndex, 1) + ")";
    } else {
      els.kpiAttention.textContent = "0";
      els.kpiAttentionSub.textContent = "tidak ada kelompok";
    }
  }

  function renderLegend() {
    els.clusterLegend.innerHTML = state.clusters.groups
      .map(function (g) {
        return (
          '<span class="legend-item"><span class="dot" style="background:' +
          g.color +
          '"></span>K' +
          (g.rank + 1) +
          " \u00b7 " +
          esc(g.name) +
          " (" +
          g.count +
          ")</span>"
        );
      })
      .join("");
  }

  function renderScatter() {
    var rs = state.filtered;
    var groups = state.clusters.groups;
    var W = 720;
    var H = 460;
    var m = { top: 24, right: 28, bottom: 62, left: 70 };
    var iw = W - m.left - m.right;
    var ih = H - m.top - m.bottom;

    function X(v) {
      return m.left + (v / 100) * iw;
    }
    function Y(v) {
      return m.top + (1 - v / 100) * ih;
    }

    var s =
      '<svg viewBox="0 0 ' +
      W +
      " " +
      H +
      '" class="chart-svg" role="img" aria-label="Diagram sebaran responden berdasarkan kepuasan layanan inti dan mutu petugas, diwarnai menurut kelompok K-Means">';

    s +=
      '<rect x="' +
      m.left +
      '" y="' +
      m.top +
      '" width="' +
      iw +
      '" height="' +
      ih +
      '" fill="#fbfdff" stroke="#e2eaf3"/>';

    for (var g = 0; g <= 5; g++) {
      var vv = g * 20;
      var gx = X(vv);
      var gy = Y(vv);
      s +=
        '<line x1="' +
        gx +
        '" y1="' +
        m.top +
        '" x2="' +
        gx +
        '" y2="' +
        (m.top + ih) +
        '" stroke="#e8eff7"/>';
      s +=
        '<line x1="' +
        m.left +
        '" y1="' +
        gy +
        '" x2="' +
        (m.left + iw) +
        '" y2="' +
        gy +
        '" stroke="#e8eff7"/>';
      s +=
        '<text x="' +
        gx +
        '" y="' +
        (m.top + ih + 20) +
        '" text-anchor="middle" class="axis-text">' +
        vv +
        "</text>";
      s +=
        '<text x="' +
        (m.left - 10) +
        '" y="' +
        (gy + 4) +
        '" text-anchor="end" class="axis-text">' +
        vv +
        "</text>";
    }

    rs.forEach(function (r, i) {
      var grp = groups[r.cluster] || groups[0];
      var cx = X(r.core).toFixed(1);
      var cy = Y(r.mutu).toFixed(1);
      s +=
        '<circle cx="' +
        cx +
        '" cy="' +
        cy +
        '" r="5" fill="' +
        grp.color +
        '" fill-opacity="0.72" stroke="#ffffff" stroke-width="1.2">';
      s +=
        "<title>Responden " +
        (i + 1) +
        " \u00b7 Indeks " +
        num(r.index, 1) +
        " (" +
        r.category.label +
        ") \u00b7 Kelompok " +
        grp.name +
        "</title>";
      s += "</circle>";
    });

    state.clusters.centroids.forEach(function (c, ci) {
      var grp = groups[ci] || groups[0];
      var cx = X(c[0]).toFixed(1);
      var cy = Y(c[1]).toFixed(1);
      s += "<g>";
      s +=
        '<circle cx="' +
        cx +
        '" cy="' +
        cy +
        '" r="11" fill="#fff" stroke="' +
        grp.color +
        '" stroke-width="3.5"/>';
      s +=
        '<circle cx="' +
        cx +
        '" cy="' +
        cy +
        '" r="4" fill="' +
        grp.color +
        '"/>';
      s +=
        '<text x="' +
        cx +
        '" y="' +
        (Number(cy) - 17).toFixed(1) +
        '" text-anchor="middle" class="centroid-label" fill="' +
        grp.color +
        '">K' +
        (ci + 1) +
        "</text>";
      s +=
        "<title>Pusat kelompok K" +
        (ci + 1) +
        " \u00b7 " +
        grp.name +
        "</title>";
      s += "</g>";
    });

    s +=
      '<text x="' +
      (m.left + iw / 2) +
      '" y="' +
      (H - 16) +
      '" text-anchor="middle" class="axis-title">Kepuasan Layanan Inti (0\u2013100) \u2192</text>';
    s +=
      '<text x="18" y="' +
      (m.top + ih / 2) +
      '" text-anchor="middle" class="axis-title" transform="rotate(-90 18 ' +
      (m.top + ih / 2) +
      ')">Mutu Petugas &amp; Sarana (0\u2013100) \u2192</text>';
    s += "</svg>";

    els.scatter.innerHTML = s;
  }

  function renderClusterBars() {
    els.clusterBars.innerHTML = state.clusters.groups
      .map(function (g) {
        var pct = clamp(g.avgIndex, 0, 100);
        return (
          '<div class="hbar-row">' +
          '<span class="hbar-label"><span class="dot" style="background:' +
          g.color +
          '"></span> ' +
          esc(g.name) +
          " <small>(" +
          g.count +
          " org)</small></span>" +
          '<div class="hbar-track"><span style="width:' +
          pct.toFixed(1) +
          "%;background:" +
          g.color +
          '"></span></div>' +
          '<span class="hbar-value">' +
          num(g.avgIndex, 1) +
          "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderHistogram() {
    var rs = state.filtered;
    var bins = [];
    for (var i = 0; i < 10; i++) {
      bins.push({ from: i * 10, to: i * 10 + 10, count: 0 });
    }
    rs.forEach(function (r) {
      var b = Math.min(9, Math.floor(r.index / 10));
      bins[b].count++;
    });

    var max = Math.max.apply(
      null,
      bins
        .map(function (b) {
          return b.count;
        })
        .concat([1])
    );

    var W = 560;
    var H = 280;
    var m = { top: 26, right: 16, bottom: 46, left: 36 };
    var iw = W - m.left - m.right;
    var ih = H - m.top - m.bottom;
    var bw = iw / bins.length;

    var s =
      '<svg viewBox="0 0 ' +
      W +
      " " +
      H +
      '" class="chart-svg" role="img" aria-label="Histogram sebaran nilai indeks">';

    for (var g = 0; g <= 4; g++) {
      var val = Math.round((max * g) / 4);
      var yy = m.top + ih - (ih * g) / 4;
      s +=
        '<line x1="' +
        m.left +
        '" y1="' +
        yy +
        '" x2="' +
        (W - m.right) +
        '" y2="' +
        yy +
        '" stroke="#e8eff7"/>';
      s +=
        '<text x="' +
        (m.left - 8) +
        '" y="' +
        (yy + 4) +
        '" text-anchor="end" class="axis-text">' +
        val +
        "</text>";
    }

    bins.forEach(function (b, i) {
      var h = (b.count / max) * ih;
      var x = m.left + i * bw + bw * 0.16;
      var y = m.top + ih - h;
      var color = binColor((b.from + b.to) / 2);
      s +=
        '<rect x="' +
        x.toFixed(1) +
        '" y="' +
        y.toFixed(1) +
        '" width="' +
        (bw * 0.68).toFixed(1) +
        '" height="' +
        Math.max(h, 0).toFixed(1) +
        '" rx="5" fill="' +
        color +
        '" opacity="0.9"><title>' +
        b.from +
        "\u2013" +
        b.to +
        ": " +
        b.count +
        " responden</title></rect>";
      if (b.count > 0) {
        s +=
          '<text x="' +
          (x + bw * 0.34).toFixed(1) +
          '" y="' +
          (y - 6).toFixed(1) +
          '" text-anchor="middle" class="bar-value">' +
          b.count +
          "</text>";
      }
      s +=
        '<text x="' +
        (m.left + i * bw + bw / 2).toFixed(1) +
        '" y="' +
        (H - m.bottom + 18) +
        '" text-anchor="middle" class="axis-text">' +
        b.from +
        "</text>";
    });

    s +=
      '<text x="' +
      (m.left + iw / 2) +
      '" y="' +
      (H - 6) +
      '" text-anchor="middle" class="axis-title">Rentang Nilai Indeks</text>';
    s += "</svg>";

    els.histogram.innerHTML = s;
  }

  function renderUnsurBars() {
    var rs = state.filtered;
    els.unsurBars.innerHTML = DIMS.map(function (dim, i) {
      var avg = mean(
        rs.map(function (r) {
          return r.scores[i];
        })
      );
      var pct = (avg / 4) * 100;
      var color = binColor(pct);
      var tag =
        dim.group === "core"
          ? '<span class="tag">Inti</span>'
          : '<span class="tag tag-mutu">Mutu</span>';
      return (
        '<div class="hbar-row">' +
        '<span class="hbar-label"><b>' +
        (i + 1) +
        ".</b> " +
        esc(dim.label) +
        " " +
        tag +
        "</span>" +
        '<div class="hbar-track"><span style="width:' +
        pct.toFixed(1) +
        "%;background:" +
        color +
        '"></span></div>' +
        '<span class="hbar-value">' +
        num(avg, 2) +
        "</span>" +
        "</div>"
      );
    }).join("");
  }

  function renderServiceBars() {
    var rows = serviceStats(state.filtered);
    if (!rows.length) {
      els.serviceBars.innerHTML = '<p class="muted">Belum ada data layanan.</p>';
      return;
    }
    els.serviceBars.innerHTML = rows
      .map(function (row) {
        var pct = clamp(row.avg, 0, 100);
        var color = binColor(row.avg);
        return (
          '<div class="hbar-row">' +
          '<span class="hbar-label">' +
          esc(row.name) +
          " <small>(" +
          row.count +
          ")</small></span>" +
          '<div class="hbar-track"><span style="width:' +
          pct.toFixed(1) +
          "%;background:" +
          color +
          '"></span></div>' +
          '<span class="hbar-value">' +
          num(row.avg, 1) +
          "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderTrend() {
    var data = trendBuckets(state.filtered);
    if (!data.length) {
      els.trendChart.innerHTML =
        '<p class="muted">Tanggal survei tidak tersedia pada data ini.</p>';
      return;
    }

    var W = 560;
    var H = 290;
    var m = { top: 28, right: 16, bottom: 62, left: 38 };
    var iw = W - m.left - m.right;
    var ih = H - m.top - m.bottom;
    var n = data.length;
    var slot = iw / n;
    var bw = Math.min(slot * 0.62, 46);

    var s =
      '<svg viewBox="0 0 ' +
      W +
      " " +
      H +
      '" class="chart-svg" role="img" aria-label="Grafik tren indeks per periode">';

    for (var g = 0; g <= 4; g++) {
      var val = g * 25;
      var yy = m.top + ih - (ih * val) / 100;
      s +=
        '<line x1="' +
        m.left +
        '" y1="' +
        yy +
        '" x2="' +
        (W - m.right) +
        '" y2="' +
        yy +
        '" stroke="#e8eff7"/>';
      s +=
        '<text x="' +
        (m.left - 8) +
        '" y="' +
        (yy + 4) +
        '" text-anchor="end" class="axis-text">' +
        val +
        "</text>";
    }

    data.forEach(function (d, i) {
      var h = (d.avg / 100) * ih;
      var x = m.left + i * slot + (slot - bw) / 2;
      var y = m.top + ih - h;
      var color = binColor(d.avg);
      s +=
        '<rect x="' +
        x.toFixed(1) +
        '" y="' +
        y.toFixed(1) +
        '" width="' +
        bw.toFixed(1) +
        '" height="' +
        Math.max(h, 1).toFixed(1) +
        '" rx="5" fill="' +
        color +
        '" opacity="0.9"><title>' +
        esc(d.label) +
        " \u00b7 " +
        num(d.avg, 1) +
        " \u00b7 " +
        d.count +
        " responden</title></rect>";
      s +=
        '<text x="' +
        (x + bw / 2).toFixed(1) +
        '" y="' +
        (y - 6).toFixed(1) +
        '" text-anchor="middle" class="bar-value">' +
        num(d.avg, 1) +
        "</text>";

      var lx = (m.left + i * slot + slot / 2).toFixed(1);
      if (n > 7) {
        s +=
          '<text x="' +
          lx +
          '" y="' +
          (m.top + ih + 16) +
          '" text-anchor="end" class="axis-text" transform="rotate(-35 ' +
          lx +
          " " +
          (m.top + ih + 16) +
          ')">' +
          esc(d.label) +
          "</text>";
      } else {
        s +=
          '<text x="' +
          lx +
          '" y="' +
          (m.top + ih + 20) +
          '" text-anchor="middle" class="axis-text">' +
          esc(d.label) +
          "</text>";
      }
    });

    s +=
      '<text x="' +
      (m.left + iw / 2) +
      '" y="' +
      (H - 8) +
      '" text-anchor="middle" class="axis-title">Periode Survei</text>';
    s += "</svg>";

    els.trendChart.innerHTML = s;
  }

  function renderRecommendations() {
    var rs = state.filtered;
    var cards = [];

    var dimAvg = DIMS.map(function (dim, i) {
      var a = mean(
        rs.map(function (r) {
          return r.scores[i];
        })
      );
      return { label: dim.label, avg: a, pct: (a / 4) * 100 };
    });
    var sortedDims = dimAvg.slice().sort(function (a, b) {
      return a.avg - b.avg;
    });
    var lowestDim = sortedDims[0];
    var highestDim = sortedDims[sortedDims.length - 1];

    if (lowestDim) {
      cards.push({
        tone: "warn",
        title: "Unsur terendah",
        main: lowestDim.label,
        desc:
          "Nilai " +
          num(lowestDim.avg, 2) +
          " dari 4 (" +
          num(lowestDim.pct, 1) +
          "). Jadikan prioritas perbaikan.",
      });
    }

    var svc = serviceStats(rs);
    if (svc.length > 1) {
      var lowSvc = svc[svc.length - 1];
      cards.push({
        tone: "warn",
        title: "Layanan dengan indeks terendah",
        main: lowSvc.name,
        desc:
          "Indeks " +
          num(lowSvc.avg, 1) +
          " dari " +
          lowSvc.count +
          " responden. Perlu evaluasi alur layanan.",
      });
    }

    if (state.clusters) {
      var lowGroup = null;
      state.clusters.groups.forEach(function (g) {
        if (g.count > 0 && (!lowGroup || g.avgIndex < lowGroup.avgIndex)) {
          lowGroup = g;
        }
      });
      if (lowGroup) {
        cards.push({
          tone: "warn",
          title: "Kelompok perlu perhatian",
          main: lowGroup.name,
          desc:
            lowGroup.count +
            " responden dengan indeks rata-rata " +
            num(lowGroup.avgIndex, 1) +
            ".",
        });
      }
    }

    if (highestDim) {
      cards.push({
        tone: "good",
        title: "Kekuatan pelayanan",
        main: highestDim.label,
        desc:
          "Nilai " +
          num(highestDim.avg, 2) +
          " dari 4 (" +
          num(highestDim.pct, 1) +
          "). Pertahankan kualitasnya.",
      });
    }

    els.recommendations.innerHTML = cards
      .map(function (c) {
        return (
          '<div class="insight-card ' +
          c.tone +
          '">' +
          '<div class="insight-title">' +
          esc(c.title) +
          "</div>" +
          '<div class="insight-main">' +
          esc(c.main) +
          "</div>" +
          '<div class="insight-desc">' +
          esc(c.desc) +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderClusterTable() {
    els.clusterTableBody.innerHTML = state.clusters.groups
      .map(function (g) {
        var scores = g.avgScores;
        var maxI = 0;
        var minI = 0;
        for (var i = 1; i < scores.length; i++) {
          if (scores[i] > scores[maxI]) maxI = i;
          if (scores[i] < scores[minI]) minI = i;
        }
        var cat = category(g.avgIndex);
        return (
          "<tr>" +
          '<td><span class="dot" style="background:' +
          g.color +
          '"></span> <strong>' +
          esc(g.name) +
          "</strong></td>" +
          "<td>" +
          g.count +
          "</td>" +
          "<td><strong>" +
          num(g.avgIndex, 1) +
          "</strong></td>" +
          '<td><span class="pill tone-' +
          cat.tone +
          '">' +
          cat.code +
          " \u00b7 " +
          cat.label +
          "</span></td>" +
          '<td class="small">Tertinggi: ' +
          esc(DIMS[maxI].label) +
          " (" +
          num(scores[maxI], 2) +
          ")<br>Terendah: " +
          esc(DIMS[minI].label) +
          " (" +
          num(scores[minI], 2) +
          ")</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderDataTable() {
    var rs = state.filtered.slice().sort(function (a, b) {
      return b.index - a.index;
    });
    els.dataTableBody.innerHTML = rs
      .map(function (r, i) {
        var grp =
          state.clusters.groups[r.cluster] || state.clusters.groups[0];
        return (
          "<tr>" +
          "<td>" +
          (i + 1) +
          "</td>" +
          "<td>" +
          esc(r.dateKey ? prettyDate(r.dateKey) : r.tanggal || "-") +
          "</td>" +
          "<td>" +
          esc(r.gender || "-") +
          "</td>" +
          "<td>" +
          esc(r.usia || "-") +
          "</td>" +
          "<td>" +
          esc(r.layanan || "-") +
          "</td>" +
          "<td><strong>" +
          num(r.index, 1) +
          "</strong></td>" +
          '<td><span class="pill tone-' +
          r.category.tone +
          '">' +
          r.category.label +
          "</span></td>" +
          "<td><span class=\"dot\" style=\"background:" +
          grp.color +
          '"></span> ' +
          esc(grp.name) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  /* ------------------------------- Loading ----------------------------- */

  function setBadge(text, cls, title) {
    els.sourceBadge.textContent = text;
    els.sourceBadge.className = "source-badge " + (cls || "");
    els.sourceBadge.title = title || "";
  }

  function setNote(text) {
    if (text) {
      els.dataNote.textContent = text;
      els.dataNote.hidden = false;
    } else {
      els.dataNote.textContent = "";
      els.dataNote.hidden = true;
    }
  }

  function normalizeRows(data) {
    var rows = Array.isArray(data)
      ? data
      : data &&
        (data.data || data.rows || data.values || data.result || data.records);
    return Array.isArray(rows) ? rows : null;
  }

  function parseRows(rows) {
    if (!rows) throw new Error("format data tidak dikenali");
    var parsed = rows.map(buildRespondent).filter(Boolean);
    if (parsed.length < 2) throw new Error("data tidak cukup");
    return parsed;
  }

  function fetchJsonLive() {
    var url =
      ENDPOINT +
      (ENDPOINT.indexOf("?") === -1 ? "?" : "&") +
      "action=dashboard";
    return fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (txt) {
        var data;
        try {
          data = JSON.parse(txt);
        } catch (e) {
          var err = new Error("respons bukan JSON");
          err.skipJsonp = true;
          throw err;
        }
        return parseRows(normalizeRows(data));
      });
  }

  function jsonpLive() {
    return new Promise(function (resolve, reject) {
      var cbName =
        "__skmDashboard" + Date.now() + Math.floor(Math.random() * 1000);
      var script = document.createElement("script");
      var done = false;
      var timer = setTimeout(function () {
        finish(new Error("JSONP timeout"));
      }, 8000);

      function finish(err, data) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (script.parentNode) script.parentNode.removeChild(script);
        try {
          delete window[cbName];
        } catch (e) {
          window[cbName] = undefined;
        }
        if (err) reject(err);
        else resolve(data);
      }

      window[cbName] = function (data) {
        try {
          finish(null, parseRows(normalizeRows(data)));
        } catch (e) {
          finish(e);
        }
      };
      script.onerror = function () {
        finish(new Error("JSONP gagal dimuat"));
      };
      script.src =
        ENDPOINT +
        (ENDPOINT.indexOf("?") === -1 ? "?" : "&") +
        "action=dashboard&callback=" +
        cbName +
        "&_=" +
        Date.now();
      document.body.appendChild(script);
    });
  }

  function loadLive() {
    return fetchJsonLive().catch(function (err) {
      if (err && err.skipJsonp) throw err;
      return jsonpLive();
    });
  }

  function loadData() {
    setBadge("Memuat data\u2026", "loading");
    setNote("");
    els.refreshBtn.disabled = true;
    els.scatter.innerHTML =
      '<div class="loading-box">Mengambil dan mengolah data\u2026</div>';

    var live = ENDPOINT
      ? loadLive()
      : Promise.reject(new Error("endpoint dashboard belum diatur"));

    live
      .then(function (respondents) {
        return { respondents: respondents, source: "live" };
      })
      .catch(function () {
        return { respondents: generateDemoData(), source: "demo" };
      })
      .then(function (result) {
        state.all = result.respondents;
        state.source = result.source;

        if (result.source === "live") {
          setBadge(
            "Data live \u00b7 " + result.respondents.length + " responden",
            "live"
          );
          setNote("");
        } else {
          setBadge(
            "Mode contoh \u00b7 " + result.respondents.length + " responden",
            "demo",
            "Data live belum tersedia"
          );
          setNote(
            "Dashboard menampilkan data contoh agar tampilan dan cara kerja K-Means tetap dapat dipelajari. Untuk memakai data responden sebenarnya, deploy Apps Script dashboard lalu isi ENDPOINT di dashboard.js."
          );
        }

        populateFilters();
        applyFilters();
        els.refreshBtn.disabled = false;
      });
  }

  /* -------------------------------- Init ------------------------------- */

  function bindEvents() {
    els.refreshBtn.addEventListener("click", loadData);
    els.kRange.addEventListener("input", function () {
      state.k = parseInt(els.kRange.value, 10);
      els.kOut.textContent = state.k;
      renderAll();
    });
    els.filterFrom.addEventListener("change", applyFilters);
    els.filterTo.addEventListener("change", applyFilters);
    els.filterService.addEventListener("change", applyFilters);
    els.filterGender.addEventListener("change", applyFilters);
    els.resetFilter.addEventListener("click", resetFilters);
  }

  state.k = parseInt(els.kRange.value, 10) || 3;
  els.kOut.textContent = state.k;
  bindEvents();
  loadData();
})();
