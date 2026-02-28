const bcrypt = require('bcrypt');

async function generateHashes() {
  const passwords = {
    'admin123': null,
    'tecnico123': null,
    'cliente123': null,
  };
  
  for (const password of Object.keys(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${password}: ${hash}`);
  }
}

generateHashes().catch(console.error);
