import { createServer } from 'node:http';
import app from './index.ts';

const server = createServer(async (req, res) => {
  try {
    // Crear URL completa
    const url = `http://localhost:3002${req.url}`;

    // Leer body si existe
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }

    // Crear Request object
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: body,
    });

    // Usar el fetch handler de Elysia
    const response = await app.fetch(request);

    // Enviar respuesta
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    const responseBody = await response.text();
    res.end(responseBody);

  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

server.listen(3002, () => {
  console.log('🦊 Elysia segura corriendo en localhost:3002');
});