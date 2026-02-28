async function run(){
  try{
    const res = await fetch('http://localhost:3002/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@taller.com', password: 'admin123' })
    });
    const json = await res.json();
    console.log(JSON.stringify(json));
  }catch(e){
    console.error(e);
  }
}
run();
