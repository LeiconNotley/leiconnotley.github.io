/* ============================================================
   emv.js — EMVCo Merchant-Presented Mode (MPM) helpers
   Used only for "Advanced" mode where the merchant pastes an
   NPP / bank-provided EMVCo QR payload. We inject the sale
   amount (tag 54) and recompute the CRC (tag 63).

   The AusPayNet / NPP QR Code Standard is based on the EMVCo
   Merchant-Presented Mode specification, so the amount + CRC
   tags are handled the same way regardless of the scheme GUID.
   ============================================================ */

const EMV = (() => {
  // --- CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) : EMVCo tag 63 ---
  function crc16(str) {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  // --- Parse a top-level EMV TLV string into [{id, len, value}] ---
  function parse(payload) {
    const out = [];
    let i = 0;
    while (i + 4 <= payload.length) {
      const id = payload.substr(i, 2);
      const len = parseInt(payload.substr(i + 2, 2), 10);
      if (isNaN(len)) break;
      const value = payload.substr(i + 4, len);
      out.push({ id, len, value });
      i += 4 + len;
    }
    return out;
  }

  // --- Serialise a single TLV field with 2-digit length ---
  function field(id, value) {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  }

  // --- Rebuild payload from a list of {id,value}, appending CRC (63) ---
  function build(fields) {
    // Remove any existing CRC field; it is always recomputed last.
    const body = fields
      .filter((f) => f.id !== "63")
      .map((f) => field(f.id, f.value))
      .join("");
    // Per spec the CRC is calculated over everything up to and
    // including "6304".
    const toHash = body + "6304";
    return toHash + crc16(toHash);
  }

  /**
   * Inject / replace the transaction amount (tag 54) into an existing
   * EMVCo payload and recompute the CRC.
   *  - Sets Point of Initiation Method (tag 01) to "12" (dynamic).
   *  - amount: number or numeric string, e.g. 24.50 -> "24.50"
   */
  function setAmount(payload, amount) {
    const fields = parse(payload).map((f) => ({ id: f.id, value: f.value }));
    const amtStr = Number(amount).toFixed(2);

    const upsert = (id, value) => {
      const existing = fields.find((f) => f.id === id);
      if (existing) existing.value = value;
      else fields.push({ id, value });
      // Keep numeric-ish ordering so the payload stays tidy/spec-friendly.
      fields.sort((a, b) => a.id.localeCompare(b.id));
    };

    upsert("01", "12"); // dynamic (amount present)
    upsert("54", amtStr); // transaction amount
    return build(fields);
  }

  /** Basic sanity check that a pasted string looks like an EMV payload. */
  function looksValid(payload) {
    if (!payload || payload.length < 8) return false;
    const fields = parse(payload);
    // Must start with Payload Format Indicator "00" and contain a CRC "63".
    return fields.length > 1 && fields[0].id === "00";
  }

  return { crc16, parse, field, build, setAmount, looksValid };
})();
