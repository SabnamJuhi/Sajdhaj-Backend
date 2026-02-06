const crypto = require("crypto");

exports.encrypt = (plainText, key) => {
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);

  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");

  return encrypted;
};

exports.decrypt = (encryptedText, key) => {
  const iv = Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

  let decrypted = decipher.update(encryptedText, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

