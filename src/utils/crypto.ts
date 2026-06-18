export function encryptLink(link: string): string {
  if (!link) return "";
  try {
    const base64 = btoa(unescape(encodeURIComponent(link)));
    const reversed = base64.split("").reverse().join("");
    const key = "kimo_secure_pack_2026";
    let cipherText = "";
    for (let i = 0; i < reversed.length; i++) {
      const charCode = reversed.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      cipherText += String.fromCharCode(charCode ^ keyChar);
    }
    return btoa(unescape(encodeURIComponent(cipherText)));
  } catch (e) {
    console.error("Link encryption failed:", e);
    return encodeURIComponent(link);
  }
}

export function decryptLink(encrypted: string): string {
  if (!encrypted) return "";
  try {
    // Some browsers or decoders might have decoded % encoded values first, test if it is a valid base-64
    const cleanEncrypted = decodeURIComponent(encrypted);
    const cipherText = decodeURIComponent(escape(atob(cleanEncrypted)));
    const key = "kimo_secure_pack_2026";
    let reversed = "";
    for (let i = 0; i < cipherText.length; i++) {
      const charCode = cipherText.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      reversed += String.fromCharCode(charCode ^ keyChar);
    }
    const base64 = reversed.split("").reverse().join("");
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    // If decryption fails, check if the input is a raw URL fallback
    if (encrypted.startsWith("http://") || encrypted.startsWith("https://")) {
      return encrypted;
    }
    try {
      return decodeURIComponent(encrypted);
    } catch {
      return encrypted;
    }
  }
}
