// src/lib/db.ts
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
});

// Indispensable pour les autres fichiers qui utilisent l'import par défaut
export default pool;
// (1) Cadena de conexión a la base de datos
// (2) Configuración SSL para Supabase
// (3) En Serverless, 1 conexión por instancia suele ser lo óptimo
// (4) Cierra la conexión si está inactiva 10 segundos
// (5) Tiempo límite para establecer la conexión