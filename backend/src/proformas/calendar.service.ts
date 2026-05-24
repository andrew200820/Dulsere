import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  async crearEventoMock(proformaId: number, fechaEntrega: Date, clienteNombre: string, direccion: string) {
    this.logger.log(`[Google Calendar MOCK] Creando evento para Proforma #${proformaId}`);
    this.logger.log(`[Google Calendar MOCK] Entrega programada: ${fechaEntrega.toISOString()}`);
    this.logger.log(`[Google Calendar MOCK] Cliente: ${clienteNombre}`);
    this.logger.log(`[Google Calendar MOCK] Dirección de entrega: ${direccion || 'Retiro en tienda'}`);

    // Simular un retardo de red de 200ms
    await new Promise(resolve => setTimeout(resolve, 200));

    // Generar un ID ficticio para el evento de Google
    const eventIdSimulado = `gcal_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    
    this.logger.log(`[Google Calendar MOCK] Evento creado con ID: ${eventIdSimulado}`);
    
    return eventIdSimulado;
  }
}
