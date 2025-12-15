const bcrypt = require('bcrypt');
const password = 'admin123';
const hash = '$2b$10$0m3R2FABdAUvH0nL46mOueYTTKAVZkvKs26pRNCJpO6eXLYsjUnay';
bcrypt.compare(password, hash).then(result => {
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Match result:', result);
  if (result) {
    console.log('âœ“ Las credenciales son vÃ¡lidas');
  } else {
    console.log('âœ— Las credenciales NO coinciden');
  }
});
