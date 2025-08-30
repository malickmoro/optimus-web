// utils/ltcValidate.js
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function b58decodeToBytes(s) {
  let num = 0n;
  for (const c of s) {
    const i = BASE58.indexOf(c);
    if (i < 0) return null;
    num = num * 58n + BigInt(i);
  }
  // convert BigInt -> bytes
  let hex = num.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  // preserve leading zeros (Base58 leading '1's)
  let leading = 0;
  for (const c of s) { if (c === '1') leading++; else break; }
  const bytes = hexToBytes(hex);
  const out = new Uint8Array(leading + bytes.length);
  out.set(bytes, leading);
  return out;
}

function hexToBytes(hex){ const a=[]; for(let i=0;i<hex.length;i+=2)a.push(parseInt(hex.slice(i,i+2),16)); return new Uint8Array(a); }
function bytesToHex(u8){ return [...u8].map(b=>b.toString(16).padStart(2,'0')).join(''); }

async function sha256(u8){ return new Uint8Array(await crypto.subtle.digest("SHA-256", u8)); }

async function base58checkValidAndVersion(addr) {
  const buf = b58decodeToBytes(addr);
  if (!buf || buf.length < 5) return { ok:false };
  const data = buf.slice(0, -4);
  const chk  = buf.slice(-4);
  const h1 = await sha256(data);
  const h2 = await sha256(h1);
  const calc = h2.slice(0,4);
  const ok = bytesToHex(calc) === bytesToHex(chk);
  const version = data[0]; // first byte
  return { ok, version };
}

export async function validateLitecoinAddress(addr) {
  // Bech32 (native segwit) must start with 'ltc1'
  if (/^ltc1[0-9ac-hj-np-z]{11,87}$/.test(addr)) return true;

  // Base58 (legacy)
  const { ok, version } = await base58checkValidAndVersion(addr);
  if (!ok) return false;

  // Enforce Litecoin versions:
  // pubKeyHash (L...) = 0x30, scriptHash (M...) = 0x32
  if (version === 0x30 || version === 0x32) return true;

  // Optionally accept old LTC P2SH ('3' / 0x05) – NOT recommended:
  // if (version === 0x05) return true;

  return false;
}
