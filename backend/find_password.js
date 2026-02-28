const bcrypt = require('bcrypt');

// Hash del backup: $2b$10$EL1IMX/T0W3SkIeLk3O36e6j0HquUbNMG7dDFtbkIKiywh5oFHtT.
const backupHash = '$2b$10$EL1IMX/T0W3SkIeLk3O36e6j0HquUbNMG7dDFtbkIKiywh5oFHtT.';

// Contraseñas a probar
const passwords = [
  'password',
  '123456',
  'admin',
  'taller',
  'admin123',
  'sistema',
  'test',
  'qwerty',
  'password123',
  'cambio',
  'cambio123',
  '1234567890',
];

async function findPassword() {
  console.log('Probando contraseñas contra el hash del backup...\n');
  
  for (const pwd of passwords) {
    try {
      const match = await bcrypt.compare(pwd, backupHash);
      if (match) {
        console.log(`✅ CONTRASEÑA ENCONTRADA: "${pwd}"`);
        return pwd;
      } else {
        console.log(`❌  ${pwd}`);
      }
    } catch (err) {
      console.log(`Error con "${pwd}": ${err.message}`);
    }
  }
  
  console.log('\nNo se encontró la contraseña en la lista');
}

findPassword().catch(console.error);
