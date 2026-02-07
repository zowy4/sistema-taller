import express from 'express';
import cors from 'cors';
import app from './index.js';

const server = express();

// Middleware básico
server.use(cors());
server.use(express.json());

// Función helper para manejar requests con Elysia
async function handleWithElysia(req: express.Request, res: express.Response) {
  try {
    // Crear URL completa
    const url = `http://localhost:3002${req.originalUrl}`;

    // Crear headers compatibles
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    });

    // Crear Request
    const request = new Request(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.body ? JSON.stringify(req.body) : undefined,
    });

    // Llamar a Elysia
    const response = await app.fetch(request);

    // Configurar respuesta
    res.status(response.status);

    // Copiar headers de respuesta
    for (const [key, value] of response.headers) {
      if (key.toLowerCase() !== 'content-length') { // Evitar conflictos
        res.setHeader(key, value);
      }
    }

    // Enviar body
    const responseText = await response.text();
    res.send(responseText);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// Definir rutas específicas
server.get('/', handleWithElysia);
server.get('/users', handleWithElysia);
server.get('/users/:id', handleWithElysia);
server.post('/users', handleWithElysia);
server.put('/users/:id', handleWithElysia);
server.delete('/users/:id', handleWithElysia);
server.post('/login', handleWithElysia);

server.listen(3002, () => {
  console.log('🦊 Elysia segura corriendo en localhost:3002');
});