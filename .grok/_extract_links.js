const fs = require("fs");
const h = fs.readFileSync("data/sources/kurume-mokuzo-taishin-kaishu/_probe_index.utf8.html", "utf8");
const re = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
const seen = new Set();
let m;
while ((m = re.exec(h))) {
  const href = m[1];
  const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (!text || text.length < 2) continue;
  if (href.startsWith("#") || href.includes("Languages") || href.includes("form_mail")) continue;
  const key = href + "|" + text;
  if (seen.has(key)) continue;
  seen.add(key);
  const blob = text + href;
  if (/耐震|補助|助成|診断|木造|移転|がけ|改修|計画|セミナー|マップ|除却|危険|命|補助金|制度/.test(blob) || /3140|taishin|gaketi|\d{4}-\d{4}/.test(href)) {
    console.log(text + " | " + href);
  }
}
