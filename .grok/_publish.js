const fs = require("fs");
const p = "content/subsidy/jutaku/kurume-mokuzo-taishin-kaishu.mdx";
let t = fs.readFileSync(p, "utf8");
if (!/status:\s*"draft"/.test(t)) {
  console.log("unexpected status", t.match(/status:.*/));
  process.exit(1);
}
t = t.replace(/status:\s*"draft"/, 'status: "published"');
fs.writeFileSync(p, t);
console.log(t.match(/status:.*/)[0]);
