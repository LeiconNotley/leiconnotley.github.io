/* ============================================================
   app.js — Merchant register logic
   - Amount keypad (cents-based)
   - Settings persisted in localStorage
   - QR generation (default: customer payment page URL;
     advanced: bank EMVCo NPP payload with injected amount)
   ============================================================ */

(() => {
  "use strict";

  const LS_KEY = "payid-register-settings-v1";
  const $ = (id) => document.getElementById(id);

  // ---- State ----
  let cents = 0; // amount in cents
  let settings = loadSettings();

  // ---- Elements ----
  const amountDisplay = $("amountDisplay");
  const refInput = $("refInput");
  const qrBox = $("qrBox");
  const qrPlaceholder = $("qrPlaceholder");
  const paySummary = $("paySummary");
  const qrActions = $("qrActions");
  const modeHint = $("modeHint");

  // =========================================================
  //  Settings
  // =========================================================
  function loadSettings() {
    try {
      return Object.assign(
        { biz: "", type: "Email", payid: "", useEmv: false, emv: "" },
        JSON.parse(localStorage.getItem(LS_KEY) || "{}")
      );
    } catch {
      return { biz: "", type: "Email", payid: "", useEmv: false, emv: "" };
    }
  }
  function saveSettings() {
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
  }
  function applySettingsToHeader() {
    $("bizName").textContent = settings.biz || "TerryWhite Chemmart Ashfield";
    $("payidLabel").textContent = settings.payid
      ? `PayID (${settings.type}): ${settings.payid}`
      : "PayID not set — tap ⚙️ to configure";
  }

  // Populate + open dialog
  const dialog = $("settingsDialog");
  $("openSettings").addEventListener("click", () => {
    $("setBiz").value = settings.biz;
    $("setType").value = settings.type;
    $("setPayid").value = settings.payid;
    $("setEmvToggle").checked = !!settings.useEmv;
    $("setEmv").value = settings.emv;
    $("emvField").hidden = !settings.useEmv;
    dialog.showModal();
  });
  $("setEmvToggle").addEventListener("change", (e) => {
    $("emvField").hidden = !e.target.checked;
  });
  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "save") return;
    settings.biz = $("setBiz").value.trim();
    settings.type = $("setType").value;
    settings.payid = $("setPayid").value.trim();
    settings.useEmv = $("setEmvToggle").checked;
    settings.emv = $("setEmv").value.trim();
    saveSettings();
    applySettingsToHeader();
    toast("Settings saved");
  });

  // =========================================================
  //  Keypad
  // =========================================================
  function renderAmount() {
    amountDisplay.textContent = (cents / 100).toFixed(2);
  }
  function pressKey(k) {
    if (k === "clear") cents = 0;
    else if (k === "back") cents = Math.floor(cents / 10);
    else {
      const d = parseInt(k, 10);
      if (cents < 1_00000000) cents = cents * 10 + d; // cap to avoid overflow
    }
    renderAmount();
  }
  document.querySelectorAll(".key").forEach((btn) => {
    btn.addEventListener("click", () => pressKey(btn.dataset.k));
  });
  // Physical keyboard support
  window.addEventListener("keydown", (e) => {
    if (dialog.open) return;
    if (e.key >= "0" && e.key <= "9") pressKey(e.key);
    else if (e.key === "Backspace") pressKey("back");
    else if (e.key === "Escape") pressKey("clear");
    else if (e.key === "Enter") generate();
  });

  // =========================================================
  //  QR generation
  // =========================================================
  function currentAmount() {
    return cents / 100;
  }

  function buildPayUrl(amount, ref) {
    const url = new URL("pay.html", location.href);
    const p = url.searchParams;
    p.set("n", settings.biz || "TerryWhite Chemmart Ashfield");
    p.set("t", settings.type || "Email");
    p.set("p", settings.payid);
    p.set("a", amount.toFixed(2));
    if (ref) p.set("r", ref);
    return url.toString();
  }

  function renderQr(data) {
    if (!window.qrcode) {
      qrBox.innerHTML =
        '<div class="qr-placeholder">Could not load the QR engine. Check the internet connection and reload.</div>';
      return false;
    }
    // typeNumber 0 = auto-size; error correction "M" is a good balance.
    const qr = qrcode(0, "M");
    qr.addData(data);
    qr.make();
    qrBox.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    return true;
  }

  function generate() {
    if (!settings.payid && !settings.useEmv) {
      toast("Set your PayID first (⚙️)");
      $("openSettings").click();
      return;
    }
    if (cents <= 0) {
      toast("Enter an amount");
      return;
    }
    const amount = currentAmount();
    const ref = refInput.value.trim();

    let data, hint;
    if (settings.useEmv && settings.emv) {
      if (!EMV.looksValid(settings.emv)) {
        toast("The bank NPP payload looks invalid — check Settings");
        return;
      }
      data = EMV.setAmount(settings.emv, amount);
      hint =
        "Advanced NPP mode: the customer scans this with a banking app that supports NPP QR. " +
        "The amount is embedded in the code.";
    } else {
      data = buildPayUrl(amount, ref);
      hint =
        "The customer scans with their phone camera to open a page showing your PayID and the " +
        "amount, then pastes it into their banking app (Pay Anyone → PayID).";
    }

    if (!renderQr(data)) return;

    // Summary
    $("sumBiz").textContent = settings.biz || "TerryWhite Chemmart Ashfield";
    $("sumAmt").textContent = "$" + amount.toFixed(2);
    $("sumPayid").innerHTML = settings.useEmv
      ? "🏦 NPP QR (amount embedded)"
      : `📇 PayID (${settings.type}): ${settings.payid}`;
    $("sumRef").textContent = ref ? "Ref: " + ref : "";
    paySummary.hidden = false;
    qrActions.hidden = false;
    qrPlaceholder.style.display = "none";
    modeHint.textContent = hint;
  }

  function newSale() {
    cents = 0;
    refInput.value = "";
    renderAmount();
    qrBox.innerHTML = "";
    qrBox.appendChild(qrPlaceholder);
    qrPlaceholder.style.display = "";
    paySummary.hidden = true;
    qrActions.hidden = true;
    modeHint.textContent = "";
  }

  $("generateBtn").addEventListener("click", generate);
  $("newSaleBtn").addEventListener("click", newSale);
  $("printBtn").addEventListener("click", () => window.print());

  // =========================================================
  //  Toast
  // =========================================================
  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  // =========================================================
  //  Init
  // =========================================================
  applySettingsToHeader();
  renderAmount();
  if (!settings.payid && !settings.useEmv) {
    // First run — nudge the user to configure.
    setTimeout(() => $("openSettings").click(), 400);
  }

  // Register service worker for offline app shell (optional, best-effort).
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
