// src/lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL, //1
  ssl: { rejectUnauthorized: false }, //2
  max: 1, // 3
  idleTimeoutMillis: 10000, // 4
  connectionTimeoutMillis: 2000, // 5  

});

export default pool;

// (1) Cadena de conexión a la base de datos
// (2) Configuración SSL para Supabase
// (3) En Serverless, 1 conexión por instancia suele ser lo óptimo
// (4) Cierra la conexión si está inactiva 10 segundos
// (5) Tiempo límite para establecer la conexión