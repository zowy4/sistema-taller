async function tryPasswords(){
  const passwords = ['admin123','password123','password','123456','admin'];
  for(const p of passwords){
    try{
      const res = await fetch('http://localhost:3002/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@taller.com', password: p })
      });
      const json = await res.json();
      console.log(p, JSON.stringify(json));
    }catch(e){
      console.error('error',p,e.message);
    }
  }
}
tryPasswords();
