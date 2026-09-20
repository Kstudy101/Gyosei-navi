const fs = require("fs");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const htmlPath = process.argv[2];
const html = fs.readFileSync(htmlPath, "utf8");
const base = "https://www.city.kurume.fukuoka.jp/1050kurashi/2080juutaku/3140taishinkaisyuu/";
const re = /href="([^"]+\.pdf)"/gi;
const urls = new Set();
let m;
while ((m = re.exec(html))) {
  try {
    urls.add(new URL(m[1], base).href);
  } catch {}
}
console.log([...urls].join("\n"));
