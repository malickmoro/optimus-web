// src/utils/validateLitecoin.js

// Base58 alphabet for legacy Litecoin addresses
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decodeBase58(address) {
  let num = BigInt(0);
  for (const char of address) {
    const index = BASE58.indexOf(char);
    if (index < 0) return null; // invalid char
    num = num * 58n + BigInt(index);
  }
  return num;
}

async function validateBase58Check(address) {
  try {
    const num = decodeBase58(address);
    if (!num) return false;

    // Convert to hex with leading zeros
    let hex = num.toString(16);
    if (hex.length % 2) hex = "0" + hex;

    // A Litecoin Base58Check address should be 25 bytes (50 hex chars)
    if (hex.length !== 50) return false;

    // Extract payload + checksum
    const data = hex.slice(0, -8);
    const checksum = hex.slice(-8);

    // Convert to bytes safely
    const bytes = hexToBytes(data);

    // Double SHA256 using Web Crypto API
    const first = await crypto.subtle.digest("SHA-256", bytes);
    const second = await crypto.subtle.digest("SHA-256", new Uint8Array(first));

    const fullHash = Array.from(new Uint8Array(second))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return fullHash.startsWith(checksum);
  } catch {
    return false;
  }
}

function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return new Uint8Array(bytes);
}


// Bech32 validation (for ltc1…)
function validateBech32(address) {
  return /^ltc1[0-9a-z]{11,87}$/.test(address);
}

// Main exported function
export async function validateLitecoinAddress(address) {
  if (address.startsWith("ltc1")) {
    return validateBech32(address);
  }
  if (address.startsWith("L") || address.startsWith("M") || address.startsWith("3")) {
    return await validateBase58Check(address);
  }
  return false;
}
