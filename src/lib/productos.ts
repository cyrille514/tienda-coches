
import pool from './db';

export interface Producto {
  pk_producto: number;
  fk_categoria: number;
  nombre_producto: string;
  url_imagen?: string;
  descripcion_producto?: string;
  precio: number;
}

export async function getProductosByCategoria(categoriaId: number): Promise<Producto[]> {
  try {
    const { rows } = await pool.query<Producto>(
      `SELECT 
        pk_producto, 
        fk_categoria, 
        nombre_producto, 
        url_imagen, 
        descripcion_producto, 
        precio 
       FROM PRODUCTOS 
       WHERE fk_categoria = $1 
       ORDER BY pk_producto ASC`,
      [categoriaId]
    );
    return rows;
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    return [];
  }
}