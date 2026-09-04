/* ============================================================
   pay.js — Customer-facing payment page
   Reads payment details from the URL query string and renders
   them with one-tap copy buttons. No network, no storage.
   ============================================================ */

(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const q = new URLSearchParams(location.search);

  const biz = (q.get("n") || "").trim();
  const type = (q.get("t") || "Email").trim();
  const payid = (q.get("p") || "").trim();
  const amount = (q.get("a") || "").trim();
  const ref = (q.get("r") || "").trim();

  if (!payid || !amount) {
    $("error").hidden = false;
    return;
  }

  const amt = "$" + Number(amount).toFixed(2);
  $("biz").textContent = biz || "Pharmacy";
  $("amount").textContent = amt;
  $("amount2").textContent = amt;
  $("ptype").textContent = type;
  $("payid").textContent = payid;

  if (ref) {
    $("ref").textContent = ref;
    $("refCard").hidden = false;
    $("copyRef").addEventListener("click", () => copy(ref, "Reference copied"));
  }

  $("copyPayid").addEventListener("click", () => copy(payid, "PayID copied"));
  $("copyAmount").addEventListener("click", () =>
    copy(Number(amount).toFixed(2), "Amount copied")
  );

  document.title = `Pay ${amt} to ${biz || "Pharmacy"}`;
  $("content").hidden = false;

  // ---- Clipboard with graceful fallback ----
  async function copy(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
      toast(msg);
    } catch {
      // Fallback for older / non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast(msg);
      } catch {
        toast("Copy not supported — select manually");
      }
      document.body.removeChild(ta);
    }
  }

  let timer;
  function toast(m) {
    const t = $("toast");
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => t.classList.remove("show"), 1800);
  }
})();
