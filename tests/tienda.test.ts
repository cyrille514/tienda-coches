// tests/tienda.test.ts
import { describe, it, expect } from 'vitest';

// 1. Fonctions métier simulées/extraites pour le test unitaire
function calcularTotalConIVA(precioBase: number, ivaPorcentaje: number = 21): number {
  if (precioBase < 0) throw new Error('El precio no puede ser negativo');
  return Number((precioBase * (1 + ivaPorcentaje / 100)).toFixed(2));
}

function formatearMoneda(monto: number, moneda: string = 'EUR'): string {
  const simbolo = moneda.toUpperCase() === 'EUR' ? '€' : moneda.toUpperCase();
  return `${monto.toFixed(2)} ${simbolo}`;
}

function validarIdFactura(id: string | undefined): boolean {
  if (!id) return false;
  return /^[0-9]+$/.test(id);
}

// 2. Batterie de Tests Automatiques
describe('Pruebas Automáticas - Tienda Coches', () => {
  
  it('Calcula correctamente el precio total con 21% de IVA', () => {
    expect(calcularTotalConIVA(28000, 21)).toBe(33880.00);
    expect(calcularTotalConIVA(76000, 21)).toBe(91960.00);
  });

  it('Lanza un error si el precio del vehículo es negativo', () => {
    expect(() => calcularTotalConIVA(-5000)).toThrow('El precio no puede ser negativo');
  });

  it('Formatea correctamente los importes en Euros para la factura', () => {
    expect(formatearMoneda(33880, 'eur')).toBe('33880.00 €');
    expect(formatearMoneda(91960)).toBe('91960.00 €');
  });

  it('Valida que el parámetro ID de la factura por URL sea estrictamente numérico (Seguridad SQL)', () => {
    expect(validarIdFactura('53')).toBe(true);
    expect(validarIdFactura('54')).toBe(true);
    expect(validarIdFactura('53; DROP TABLE facturas;--')).toBe(false);
    expect(validarIdFactura(undefined)).toBe(false);
  });

});
