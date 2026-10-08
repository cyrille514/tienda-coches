// src/lib/categorias.ts
import pool from './db';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string; // Campo opcional
}

// Variable global en el módulo (vive en la memoria RAM de Node.js)
let categoriasCache: Categoria[]  | null = null;

/**
 * Obtiene las categorías desde la memoria RAM.
 * Si no existen, hace la consulta a Postgres y las almacena.
 */
export async function getCategorias(): Promise<Categoria[]> {
  if (categoriasCache !== null) {
    return categoriasCache;
  }

  try {
    const { rows } = await pool.query<Categoria>(
      'SELECT id, nombre FROM categorias ORDER BY id ASC'
    );
    categoriasCache = rows;
    return categoriasCache;
    
  } catch (error) {
    console.error("Error consultando categorías en Supabase:", error);
    categoriasCache = []; // Retorna un array vacío en caso de error
    return categoriasCache;

  } 

}
