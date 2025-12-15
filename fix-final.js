const fs = require("fs");
const path = require("path");

function fix(filepath) {
  let text = fs.readFileSync(filepath, "utf8");
  const orig = text;
  
  text = text.replace(/ó/g, "ó");
  text = text.replace(/ó/g, "í");
  text = text.replace(/ó¡/g, "á");
  text = text.replace(/ó/g, "é");
  text = text.replace(/óº/g, "ú");
  text = text.replace(/ó/g, "ñ");
  text = text.replace(/ó"/g, "Ó");
  text = text.replace(/Vehóculos/g, "Vehículos");
  text = text.replace(/vehóculos/g, "vehículos");
  text = text.replace(/Gestión/g, "Gestión");
  text = text.replace(/gestión/g, "gestión");
  text = text.replace(/facturación/g, "facturación");
  text = text.replace(/'/g, "");
  text = text.replace(/â/g, "");
  text = text.replace(/â'/g, "");
  text = text.replace(/ ï/g, "");
  text = text.replace(/'/g, "");
  text = text.replace(/"/g, "");
  text = text.replace(/""/g, "");
  text = text.replace(/"Š/g, "");
  text = text.replace(/"/g, "");
  text = text.replace(//g, "");
  text = text.replace(/'/g, "");
  
  if (text !== orig) {
    fs.writeFileSync(filepath, text, "utf8");
    return 1;
  }
  return 0;
}

function scan(dir) {
  let count = 0;
  fs.readdirSync(dir, {withFileTypes: true}).forEach(f => {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name !== "node_modules" && f.name !== ".next") count += scan(p);
    } else if (f.name.endsWith(".tsx") || f.name.endsWith(".ts")) {
      const fixed = fix(p);
      if (fixed) { console.log("Fixed: " + f.name); count++; }
    }
  });
  return count;
}

const total = scan(path.join(__dirname, "frontend", "src"));
console.log("\nTotal: " + total + " files fixed");
