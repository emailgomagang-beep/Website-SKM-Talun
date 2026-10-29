(function () {
  "use strict";

  var ENDPOINT =
    "https://script.google.com/macros/s/AKfycbym1dBJooKvTFjRCfPe83OU4W8ek4ZbevBIb6AAjyfVWmfvHmD0h2mCw-xX91lDwPLUeg/exec";
  var DRAFT_KEY = "skm_talun_draft_v1";
  var SCALE_KEY = "skm_talun_scale";
  var MIN_SCALE = 1;
  var MAX_SCALE = 1.4;
  var STEP = 0.1;

  var form = document.getElementById("skmForm");
  var msg = document.getElementById("msg");
  var submitBtn = document.getElementById("submitBtn");
  var clearBtn = document.getElementById("clearBtn");
  var toTop = document.getElementById("toTop");
  var fill = document.getElementById("progressFill");
  var text = document.getElementById("progressText");
  var bar = document.getElementById("progressBar");
  var tanggal = document.getElementById("tanggal");

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function setToday() {
    var now = new Date();
    tanggal.value =
      now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  }

  var required = Array.prototype.slice.call(form.querySelectorAll("[required]"));
  var fields = [];
  var radioGroups = [];

  required.forEach(function (el) {
    if (el.type === "radio" || el.type === "checkbox") {
      if (radioGroups.indexOf(el.name) === -1) radioGroups.push(el.name);
    } else {
      fields.push(el);
    }
  });

  var total = fields.length + radioGroups.length;

  function isFilled(el) {
    if (el.type === "radio" || el.type === "checkbox") {
      return form.querySelector('[name="' + el.name + '"]:checked') !== null;
    }
    return String(el.value).trim() !== "";
  }

  function updateProgress() {
    var done = 0;
    fields.forEach(function (el) {
      if (isFilled(el)) done++;
    });
    radioGroups.forEach(function (name) {
      if (form.querySelector('[name="' + name + '"]:checked')) done++;
    });
    var pct = Math.round((done / total) * 100);
    fill.style.width = pct + "%";
    text.textContent = done + " dari " + total + " terisi";
    bar.setAttribute("aria-valuenow", String(pct));
  }

  function clearMarks() {
    Array.prototype.forEach.call(
      form.querySelectorAll(".question.invalid, .field.invalid"),
      function (el) {
        el.classList.remove("invalid");
      }
    );
    Array.prototype.forEach.call(form.querySelectorAll(".help"), function (el) {
      el.hidden = true;
    });
  }

  function markInvalid(el) {
    var wrap = el.closest(".question") || el.closest(".field");
    if (wrap) wrap.classList.add("invalid");
    var help = wrap ? wrap.querySelector(".help") : null;
    if (help) help.hidden = false;
  }

  function validate() {
    clearMarks();
    var firstBad = null;
    required.forEach(function (el) {
      if (!isFilled(el)) {
        markInvalid(el);
        if (!firstBad) firstBad = el;
      }
    });
    if (firstBad) {
      var target = firstBad.closest(".question") || firstBad;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      var focusable = target.querySelector("input, select, textarea");
      if (focusable) focusable.focus({ preventScroll: true });
      showMessage(
        "Masih ada isian yang belum lengkap. Mohon lengkapi bagian yang ditandai.",
        true
      );
      return false;
    }
    return true;
  }

  function showMessage(content, isError) {
    msg.textContent = content;
    msg.classList.add("show");
    msg.classList.toggle("error", !!isError);
  }

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(serialize()));
    } catch (e) {}
  }

  function loadDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
  }

  function serialize() {
    var data = {};
    var fd = new FormData(form);
    fd.forEach(function (value, key) {
      data[key] = value;
    });
    return data;
  }

  function restore(data) {
    Object.keys(data).forEach(function (key) {
      var nodes = form.querySelectorAll('[name="' + key + '"]');
      Array.prototype.forEach.call(nodes, function (field) {
        if (field.type === "radio" || field.type === "checkbox") {
          field.checked = field.value === data[key];
        } else {
          field.value = data[key];
        }
      });
    });
  }

  var scale = 1;
  try {
    var saved = parseFloat(localStorage.getItem(SCALE_KEY));
    if (!isNaN(saved)) scale = saved;
  } catch (e) {}

  function applyScale() {
    document.documentElement.style.setProperty("--scale", scale.toFixed(2));
    try {
      localStorage.setItem(SCALE_KEY, String(scale));
    } catch (e) {}
  }

  applyScale();

  document.getElementById("fontUp").addEventListener("click", function () {
    scale = Math.min(MAX_SCALE, Math.round((scale + STEP) * 10) / 10);
    applyScale();
  });

  document.getElementById("fontDown").addEventListener("click", function () {
    scale = Math.max(MIN_SCALE, Math.round((scale - STEP) * 10) / 10);
    applyScale();
  });

  var draft = loadDraft();
  if (draft) {
    restore(draft);
    showMessage("Isian sebelumnya berhasil dipulihkan. Silakan lanjutkan.", false);
  }

  setToday();

  form.addEventListener("input", function (e) {
    updateProgress();
    saveDraft();
    unmarkIfFilled(e.target);
  });

  form.addEventListener("change", function (e) {
    if (e.target.type === "radio" || e.target.type === "checkbox") {
      var box = e.target.closest(".question");
      if (box) {
        box.classList.remove("invalid");
        var help = box.querySelector(".help");
        if (help) help.hidden = true;
      }
    }
    updateProgress();
    saveDraft();
  });

  function unmarkIfFilled(el) {
    var wrap = el.closest(".field");
    if (!wrap || !wrap.classList.contains("invalid")) return;
    if (String(el.value).trim() !== "") {
      wrap.classList.remove("invalid");
      var help = wrap.querySelector(".help");
      if (help) help.hidden = true;
    }
  }

  var confirmBox = document.getElementById("confirmBox");
  var reviewBody = document.getElementById("confirmBody");

  function clean(s) {
    return String(s).replace(/\s+/g, " ").trim();
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function prettyDate(value) {
    if (!value) return "-";
    var parts = value.split("-");
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function reviewGroup(title, rows) {
    var html = '<div class="review-group"><h3>' + esc(title) + "</h3>";
    rows.forEach(function (r) {
      html +=
        '<div class="review-row"><span class="k">' +
        esc(r[0]) +
        '</span><span class="v">' +
        esc(r[1]) +
        "</span></div>";
    });
    return html + "</div>";
  }

  function renderReview() {
    var html = "";
    html += reviewGroup("Tanggal Survei", [
      ["Tanggal", prettyDate(tanggal.value)],
    ]);

    function nilaiDanLabel(name) {
      var group = form.querySelectorAll('[name="' + name + '"]');
      if (group.length && group[0].type === "radio") {
        var checked = form.querySelector('[name="' + name + '"]:checked');
        var nilai = checked ? checked.value : "-";
        return nilai;
      }
      return clean(form.elements[name].value);
    }

    var identitas = [];
    [
      "jenis_kelamin",
      "pendidikan",
      "pekerjaan",
      "usia",
      "jenis_layanan",
    ].forEach(function (name) {
      var field = form.querySelector('[name="' + name + '"]').closest(".field");
      var label = field.querySelector("label, .field-label");
      var clone = label.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll(".hint"), function (h) {
        h.remove();
      });
      identitas.push([clean(clone.textContent), nilaiDanLabel(name)]);
    });
    html += reviewGroup("Identitas Responden", identitas);

    var penilaian = [];
    form.querySelectorAll(".question").forEach(function (q, i) {
      var checked = q.querySelector('input[type="radio"]:checked');
      var jawaban = checked
        ? clean(checked.closest("label").querySelector("span").textContent)
        : "-";
      var tanya = clean(
        q.querySelector(".q-text span:last-child").textContent
      );
      if (tanya.length > 78) tanya = tanya.slice(0, 78).trim() + "...";
      penilaian.push([(i + 1) + ". " + tanya, jawaban]);
    });
    html += reviewGroup("Pendapat Tentang Pelayanan", penilaian);

    var saran = clean(form.elements.saran.value);
    html += reviewGroup("Saran dan Masukan", [
      ["Saran", saran || "(tidak diisi)"],
    ]);

    reviewBody.innerHTML = html;
    reviewBody.scrollTop = 0;
  }

  function openConfirm() {
    renderReview();
    if (typeof confirmBox.showModal === "function") {
      confirmBox.showModal();
    } else {
      confirmBox.setAttribute("open", "");
    }
  }

  function closeConfirm() {
    if (typeof confirmBox.close === "function") {
      confirmBox.close();
    } else {
      confirmBox.removeAttribute("open");
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.classList.remove("show", "error");
    if (!validate()) return;
    openConfirm();
  });

  document.getElementById("reviewBack").addEventListener("click", function () {
    closeConfirm();
    submitBtn.focus();
  });

  document.getElementById("confirmClose").addEventListener("click", function () {
    closeConfirm();
    submitBtn.focus();
  });

  confirmBox.addEventListener("click", function (e) {
    if (e.target === confirmBox) {
      closeConfirm();
      submitBtn.focus();
    }
  });

  document.getElementById("reviewSend").addEventListener("click", function () {
    closeConfirm();
    sendSurvey();
  });

  function sendSurvey() {
    submitBtn.disabled = true;
    submitBtn.textContent = "Mengirim...";

    var formData = new FormData();
    new FormData(form).forEach(function (value, key) {
      formData.append(key, value);
    });

    fetch(ENDPOINT, {
      method: "POST",
      body: formData,
      mode: "no-cors",
      cache: "no-store",
    })
      .then(function () {
        showMessage(
          "Terima kasih, survei berhasil dikirim. Atas bantuan Saudara kami ucapkan terima kasih.",
          false
        );
        form.reset();
        setToday();
        clearMarks();
        clearDraft();
        updateProgress();
        msg.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        showMessage(
          "Maaf, survei gagal terkirim. Periksa koneksi internet Saudara lalu coba lagi.",
          true
        );
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Kirim Survei";
      });
  }

  clearBtn.addEventListener("click", function () {
    if (!confirm("Hapus semua isian dan mulai dari awal?")) return;
    form.reset();
    setToday();
    clearMarks();
    clearDraft();
    msg.classList.remove("show", "error");
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener(
    "scroll",
    function () {
      toTop.classList.toggle("show", window.scrollY > 400);
    },
    { passive: true }
  );

  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateProgress();
})();