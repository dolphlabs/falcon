import bs58 from "bs58";

const secretKeyArray = [
  15, 77, 121, 160, 220, 153, 86, 17, 121, 99, 180, 225, 36, 7, 92, 29, 81, 205,
  39, 14, 242, 81, 96, 56, 188, 152, 32, 189, 70, 29, 209, 71, 55, 250, 22, 77,
  111, 197, 225, 102, 15, 152, 118, 243, 68, 197, 198, 38, 188, 168, 78, 226,
  163, 163, 133, 82, 56, 106, 33, 222, 172, 20, 88, 195,
];

const secretKey = bs58.encode(Uint8Array.from(secretKeyArray));
console.log("Base58 Secret Key:", secretKey);
