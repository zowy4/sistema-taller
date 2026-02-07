import { Elysia, t } from "elysia";

// --- 1. Generación de datos simulados (Mock Data) ---
// Definimos una interfaz para tener tipado seguro internamente
interface User {
  id: number;
  name: string;
  balance: number;
  address: string;
  curp: string;
  rfc: string;
  password?: string; // Opcional para poder borrarlo en la salida
}

const bankUsers: User[] = [];

const firstNames = ["Juan", "Maria", "Pedro", "Ana", "Luis", "Sofia", "Carlos", "Elena"];
const lastNames = ["Garcia", "Rodriguez", "Hernandez", "Lopez", "Martinez", "Gonzalez", "Perez"];
const addresses = ["Av. Reforma", "Calle 5 de Mayo", "Insurgentes Sur", "Av. Juarez", "Calle Madero"];

function generateRandomUser(id: number): User {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const address = `${addresses[Math.floor(Math.random() * addresses.length)]} #${Math.floor(Math.random() * 1000)}`;

  return {
    id,
    name: `${firstName} ${lastName}`,
    balance: Math.floor(Math.random() * 1000000) / 100,
    address,
    curp: `CURP${id}${Date.now().toString().slice(-4)}`,
    rfc: `RFC${id}${Date.now().toString().slice(-4)}`,
    password: `pass${Math.floor(Math.random() * 10000)}`,
  };
}

for (let i = 1; i <= 100; i++) {
  bankUsers.push(generateRandomUser(i));
}

// --- 2. Utilidades de "Salida" (Minimización de datos) ---
// Función para quitar password y datos sensibles antes de responder
const sanitizeUser = (user: User) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// --- 3. Definición de la App ---
const app = new Elysia()
  // Definimos un modelo base para reusar en validaciones
  .model({
    user: t.Object({
      name: t.String(),
      address: t.String(),
      curp: t.String(),
      rfc: t.String(),
      password: t.String()
    }),
    login: t.Object({
      curp: t.String(),
      password: t.String()
    })
  })

  // GET: Información de la API
  .get("/", () => ({
    message: "Bank API Fork - Security Best Practices",
    version: "1.0.0",
    endpoints: {
      public: [
        "GET /users - Lista de usuarios",
        "POST /login - Login con curp/password"
      ],
      protected: [
        "GET /users/:id - Usuario específico",
        "POST /users - Crear usuario",
        "PUT /users/:id - Actualizar usuario",
        "DELETE /users/:id - Eliminar usuario"
      ]
    },
    docs: "See README.md for detailed documentation"
  }))

  // GET: Listar usuarios
  .get("/users", () => {
    // SALIDA: Mapeamos para quitar passwords de todos los usuarios
    return bankUsers.map(sanitizeUser);
  })

  // GET: Usuario por ID
  .get("/users/:id", ({ params: { id }, error }) => {
    // ENTRADA: Validamos que el ID sea numérico
    const userId = Number(id);
    const user = bankUsers.find((u) => u.id === userId);

    // PROCESAMIENTO: Manejo de excepción si no existe
    if (!user) {
      return error(404, { message: "Usuario no encontrado" });
    }

    // SALIDA: Sanitización
    return sanitizeUser(user);
  }, {
    params: t.Object({ id: t.Numeric() }) // Validación estricta de entrada
  })

  // POST: Crear usuario
  .post("/users", ({ body, set }) => {
    // La validación ocurre automáticamente gracias al esquema 'body' abajo
    const newUser = {
      id: bankUsers.length + 1, // Nota: En DB real usar UUID o AutoIncrement
      balance: 0, // Balance inicial por defecto
      ...body
    };

    bankUsers.push(newUser);

    set.status = 201; // Código HTTP correcto para creación
    return sanitizeUser(newUser);
  }, {
    body: 'user' // ENTRADA: Usa el modelo definido arriba
  })

  // PUT: Actualizar usuario
  .put("/users/:id", ({ params: { id }, body, error }) => {
    const userId = Number(id);
    const index = bankUsers.findIndex((u) => u.id === userId);

    // PROCESAMIENTO: Manejo de excepción
    if (index === -1) {
      return error(404, { message: "Usuario no encontrado para actualizar" });
    }

    // Actualización segura (merge)
    const updatedUser = { ...bankUsers[index], ...body };
    bankUsers[index] = updatedUser;

    return sanitizeUser(updatedUser);
  }, {
    params: t.Object({ id: t.Numeric() }),
    body: t.Partial(t.Omit(t.Object({ // Permitimos enviar solo algunos campos, excepto ID o Balance si no queremos
        name: t.String(),
        address: t.String(),
        // Agrega aquí los campos permitidos para actualizar
    }), []))
  })

  // DELETE: Borrar usuario
  .delete("/users/:id", ({ params: { id }, error }) => {
    const userId = Number(id);
    const index = bankUsers.findIndex((u) => u.id === userId);

    // PROCESAMIENTO: Manejo de excepción
    if (index === -1) {
      return error(404, { message: "Usuario no encontrado para eliminar" });
    }

    bankUsers.splice(index, 1);

    return { message: "Usuario eliminado con éxito" }; // SALIDA: Solo confirmación, no datos
  }, {
    params: t.Object({ id: t.Numeric() })
  })

  // POST: Login
  .post("/login", ({ body, error }) => {
    const { curp, password } = body;

    // Simulación de validación de credenciales
    const user = bankUsers.find((u) => u.curp === curp && u.password === password);

    // PROCESAMIENTO: Manejo de error de autenticación
    if (!user) {
      return error(401, { message: "Credenciales inválidas" });
    }

    // SALIDA: NUNCA devolver el objeto usuario completo en login.
    // Lo ideal aquí es devolver un JWT Token. Simularemos una respuesta segura.
    return {
      message: "Login exitoso",
      userId: user.id,
      name: user.name,
      token: "simulated-jwt-token-xyz-123"
    };
  }, {
    body: 'login' // ENTRADA: Validación estricta
  })

export default app;