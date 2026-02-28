async function run(){
  try{
    const login = await fetch('http://localhost:3002/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@taller.com', password: 'password123' })
    });
    const j = await login.json();
    console.log('login:', JSON.stringify(j).slice(0,200));
    const token = j.access_token;
    const clientes = await fetch('http://localhost:3002/clientes', { headers: { Authorization: 'Bearer '+token }});
    console.log('clientes status', clientes.status);
    const cv = await fetch('http://localhost:3002/vehiculos', { headers: { Authorization: 'Bearer '+token }});
    console.log('vehiculos status', cv.status);
    const servicios = await fetch('http://localhost:3002/servicios', { headers: { Authorization: 'Bearer '+token }});
    console.log('servicios status', servicios.status);
    console.log('clientes body sample:', JSON.stringify(await clientes.json()).slice(0,200));
  }catch(e){ console.error(e); }
}
run();
