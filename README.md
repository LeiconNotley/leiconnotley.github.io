# PayID Register — TerryWhite Chemmart Ashfield

A tiny, production-ready web app for **TerryWhite Chemmart Ashfield** (walk-in pharmacy) to take **PayID** payments.
Styled in the TerryWhite Chemmart brand green (`#009641`) with the cross-in-square mark.
The cashier types the amount, taps **Generate payment QR**, and the customer scans it to
see the **PayID** and **amount** to pay from their own banking app.

It's a **static site** — pure HTML/CSS/JS, no backend, no build step, no data collection.
Perfect for **GitHub Pages**.

---

## ⚠️ Read this first (how PayID QR really works in Australia)

There is **no universal deep-link** in Australia that makes a third-party QR auto-open *any*
banking app with the PayID **and** amount already filled in (unlike India's UPI). The official
NPP / AusPayNet **Merchant-Presented Mode** QR standard (EMVCo-based) exists, but consumer
banking-app support is still limited.

So this app gives you **two modes**:

| Mode | What the QR contains | Who reads it | Reliability |
|------|----------------------|--------------|-------------|
| **Default** (recommended) | A link to a clean payment page hosted on your own site, showing the PayID + amount with one-tap **Copy** buttons | The customer's **phone camera** (every phone) | ✅ Works everywhere |
| **Advanced (NPP)** | A bank-provided **EMVCo NPP QR payload** with the sale amount injected (tag 54) and CRC recomputed (tag 63) | A **banking app that supports NPP QR** | ⚠️ Only some banks |

**Payment confirmation is done by the merchant** — the app never verifies funds. Always check the
money has landed in your banking app before releasing goods (banks may hold a customer's *first*
PayID payment for up to 24 hours).

---

## 🚀 Deploy to GitHub Pages

1. Create a new repository (e.g. `payid-register`) and upload **all** the files in this folder,
   keeping the structure intact:
   ```
   index.html
   pay.html
   manifest.webmanifest
   sw.js
   .nojekyll
   assets/styles.css
   assets/app.js
   assets/pay.js
   assets/emv.js
   ```
2. In the repo: **Settings → Pages → Build and deployment → Source: _Deploy from a branch_**,
   choose `main` and `/ (root)`, then **Save**.
3. Wait ~1 minute. Your app is live at
   `https://<your-username>.github.io/payid-register/`.

> The `.nojekyll` file tells GitHub Pages to serve everything as-is.

### Use it
- Open the site on the counter device (phone/tablet/PC).
- Tap **⚙️ Settings**, enter your **pharmacy name** and **PayID**, and Save.
- Optionally tap **Add to Home Screen** to run it full-screen like an app (PWA).

---

## 🧾 Day-to-day use

1. Type the amount on the keypad (works like a till — `250` = `$2.50`).
2. (Optional) add a reference, e.g. a script number.
3. Tap **Generate payment QR**.
4. Turn the screen to the customer; they scan and pay.
5. **Confirm the payment in your banking app**, then tap **New sale**.

Print a paper copy anytime with **🖨️ Print receipt**.

---

## 🔧 Advanced (NPP) mode

If your bank or payment provider gave you an **EMVCo NPP QR string** (starts with `000201…`):

1. **⚙️ Settings → toggle "Advanced: use a bank NPP QR payload"**.
2. Paste the payload and Save.

For each sale the app parses the payload, sets the **transaction amount** (EMV tag `54`),
forces a **dynamic** point-of-initiation (`01 = 12`) and recomputes the **CRC-16/CCITT-FALSE**
checksum (tag `63`) — all client-side. The customer scans it with an NPP-QR-capable banking app.

---

## 🔒 Privacy & security

- 100% client-side. Your PayID and settings are stored only in **your browser's localStorage**.
- No analytics, no cookies, no servers, nothing sent anywhere.
- The only external request is loading the QR-drawing library from a public CDN (with a fallback CDN).

---

## 🛠️ Tech

- Vanilla HTML/CSS/JS. No frameworks, no bundler.
- QR rendering: [`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator) via CDN.
- PWA (installable, offline app shell via `sw.js`).

---

## 📄 Notes / disclaimer

PayID and Osko are services of Australian Payments Plus. This project is **not affiliated with,
or endorsed by**, any bank or AP+. Verify your PayID is registered in your business banking before
use, and follow your bank's terms.

MIT-style: use it, change it, ship it.
