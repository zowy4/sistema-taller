const fs = require("fs");
const path = require("path");

function fix(filepath) {
  let text = fs.readFileSync(filepath, "utf8");
  const orig = text;
  
  // Acentos corruptos - vocales minúsculas
  text = text.replace(/ó/g, "ó");
  text = text.replace(/ó/g, "í");
  text = text.replace(/ó¡/g, "á");
  text = text.replace(/ó/g, "é");
  text = text.replace(/óº/g, "ú");
  text = text.replace(/ó/g, "ñ");
  
  // Acentos corruptos - vocales mayúsculas
  text = text.replace(/ó"/g, "Ó");
  text = text.replace(/Ã"/g, "Ó");
  
  // Palabras completas problemáticas
  text = text.replace(/Vehóculo/g, "Vehículo");
  text = text.replace(/vehóculo/g, "vehículo");
  text = text.replace(/Gestión/g, "Gestión");
  text = text.replace(/gestión/g, "gestión");
  text = text.replace(/facturación/g, "facturación");
  text = text.replace(/Descripción/g, "Descripción");
  text = text.replace(/descripción/g, "descripción");
  text = text.replace(/Dirección/g, "Dirección");
  text = text.replace(/dirección/g, "dirección");
  text = text.replace(/Información/g, "Información");
  text = text.replace(/información/g, "información");
  text = text.replace(/Sesión/g, "Sesión");
  text = text.replace(/sesión/g, "sesión");
  text = text.replace(/Ubicación/g, "Ubicación");
  text = text.replace(/ubicación/g, "ubicación");
  text = text.replace(/Categoróa/g, "Categoría");
  text = text.replace(/categoróa/g, "categoría");
  text = text.replace(/Código/g, "Código");
  text = text.replace(/código/g, "código");
  text = text.replace(/Mónimo/g, "Mínimo");
  text = text.replace(/mónimo/g, "mínimo");
  text = text.replace(/Tócnico/g, "Técnico");
  text = text.replace(/tócnico/g, "técnico");
  text = text.replace(/Contraseóa/g, "Contraseña");
  text = text.replace(/contraseóa/g, "contraseña");
  text = text.replace(/Aóo/g, "Año");
  text = text.replace(/aóo/g, "año");
  text = text.replace(/peróodo/g, "período");
  text = text.replace(/recepción/g, "recepción");
  text = text.replace(/administración/g, "administración");
  text = text.replace(/crótico/g, "crítico");
  text = text.replace(/órdenes/g, "órdenes");
  text = text.replace(/estó¡/g, "está");
  text = text.replace(/estó¡n/g, "están");
  text = text.replace(/podró¡s/g, "podrás");
  text = text.replace(/Aquó/g, "Aquí");
  text = text.replace(/vó¡lido/g, "válido");
  text = text.replace(/notificaró¡/g, "notificará");
  
  // Flechas y símbolos corruptos
  text = text.replace(/â'/g, "");
  text = text.replace(/â/g, "");
  text = text.replace(/â/g, "");
  text = text.replace(/â/g, "");
  text = text.replace(/âï/g, "ℹ");
  
  // Otros caracteres corruptos
  text = text.replace(/"ï/g, "");
  text = text.replace(/'/g, "");
  text = text.replace(//g, "");
  
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
