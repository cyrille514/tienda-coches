// src/lib/brevo.ts

interface EmailFacturaParams {
  emailCliente: string;
  nombreCliente?: string;
  facturaId: number;
  total: number;
}

export async function enviarEmailFactura({
  emailCliente,
  nombreCliente = 'Cliente',
  facturaId,
  total,
}: EmailFacturaParams) {
  const apiKey = import.meta.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("BREVO_API_KEY no está configurada en las variables de entorno.");
    return;
  }

  const payload = {
    sender: {
      name: "Tienda Coches",
      email: "no-reply@tienda-coches.com" // Asegúrate de validar este remitente en tu panel de Brevo
    },
    to: [
      {
        email: emailCliente,
        name: nombreCliente
      }
    ],
    subject: `Confirmación de Compra - Factura #${facturaId}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">¡Gracias por tu compra en Tienda Coches!</h2>
        <p>Hola <strong>${nombreCliente}</strong>,</p>
        <p>Tu pedido se ha completado correctamente y hemos generado tu factura oficial.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Número de Factura:</strong> #${facturaId}</p>
          <p style="margin: 5px 0;"><strong>Total Pagado:</strong> ${total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
        </div>

        <p>Puedes consultar, descargar e imprimir tu factura en cualquier momento en el siguiente enlace:</p>
        <p style="margin-top: 25px;">
          <a href="https://tienda-coches.vercel.app/factura/${facturaId}" 
             style="background-color: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Ver e Imprimir Factura
          </a>
        </p>
      </div>
    `
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error devuelto por la API de Brevo:", errorData);
    } else {
      console.log(`Correo de factura #${facturaId} enviado correctamente a ${emailCliente}`);
    }
  } catch (err) {
    console.error("Excepción al conectar con la API de Brevo:", err);
  }
}
