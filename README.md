# 🚗 Tienda Coches - Aplicación E-Commerce con Astro, PostgreSQL y Stripe

Proyecto de tienda virtual e-commerce desarrollado como parte de la evaluación técnica, cumpliendo con todos los factores de rendimiento, seguridad y buenas prácticas de desarrollo web.

---

## 🚀 Características y Funcionalidades

- **API de Autenticación:** Registro e inicio de sesión de usuarios con vinculación de compras mediante `userId`.
- **Carrito de Compra Persistente:** Gestión dinámica de la cesta en `localStorage` con eventos personalizados para actualización inmediata del contador.
- **Proceso de Compra con Stripe:** Redirección segura a la pasarela de pago oficial de Stripe Checkout.
- **Base de Datos PostgreSQL Nativa:** Conexión mediante `pg.Pool` con consultas SQL nativas (sin SDK de Supabase) e interfaces TypeScript.
- **Seguridad Garantizada:** Uso estricto de *Prepared Statements* (`$1, $2, $3`) contra inyecciones SQL y gestión de claves privadas mediante variables de entorno (`.env`).
- **Paso de Parámetros por URL:** Manejo de parámetros `GET` (`session_id`) para la verificación de compras en el servidor.
- **Variables BackEnd a FrontEnd:** Uso de la directiva `define:vars` de Astro para sincronizar estados del servidor con el cliente.
- **Gestión e Impresión de Facturas:** Vista dedicada `/factura/[id]` optimizada con CSS `@media print` para visualización e impresión en PDF.
- **Notificaciones por Email:** Integración con la API de Brevo para el envío automático de correos transaccionales tras la compra.
- **Diseño Adaptativo y Moderno:** Interfaz responsiva construida con Tailwind CSS.
- **Despliegue Continuo:** Aplicación publicada en Vercel y vinculada con GitHub.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** [Astro](https://astro.build/) (Modo SSR)
- **Base de Datos:** PostgreSQL (Supabase) con `pg` pool
- **Pasarela de Pago:** Stripe API
- **Emails Transaccionales:** Brevo API
- **Estilos:** Tailwind CSS
- **Despliegue:** Vercel

---

## ⚙️ Configuración del Entorno (.env)

Para ejecutar este proyecto localmente, es necesario crear un archivo `.env` en la raíz con las siguientes variables:

```env
DATABASE_URL=postgres://...
STRIPE_SECRET_KEY=sk_test_...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
BREVO_API_KEY=xkeysib-...
