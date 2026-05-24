import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class VisionService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'TU_GEMINI_API_KEY_AQUI') {
      console.warn('Advertencia: GEMINI_API_KEY no está configurada o tiene el valor por defecto.');
    }
    // Inicializar la API de Gemini
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async auditarInsumosImagen(base64Image: string) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'TU_GEMINI_API_KEY_AQUI') {
      throw new BadRequestException(
        'El servicio de auditoría por IA no está disponible. GEMINI_API_KEY no configurada.'
      );
    }

    // 1. Limpiar y validar el formato Base64 de la imagen
    let mimeType = 'image/jpeg';
    let cleanBase64 = base64Image;

    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      cleanBase64 = matches[2];
    }

    if (!cleanBase64) {
      throw new BadRequestException('Formato de imagen Base64 no válido.');
    }

    try {
      // 2. Configurar el modelo Gemini 1.5 Flash (ideal para análisis rápido de imágenes y estructuración)
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `Actúa como un auditor de bodega profesional. Tu tarea es analizar visualmente los insumos de repostería/cocina que se muestran en la imagen y contar o estimar sus cantidades.
Debes devolver EXCLUSIVAMENTE un JSON estructurado que siga exactamente este formato:
{
  "detections": [
    {
      "insumo": "Nombre del insumo (ej: Harina, Azúcar, Huevo, Frutillas)",
      "cantidad_estimada": 12.5,
      "unidad_visual": "g|ml|unidades"
    }
  ]
}
No devuelvas ningún texto explicativo, solo el JSON puro.`,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Baja temperatura para resultados más consistentes
        },
      });

      // 3. Preparar la llamada a la API
      const imagePart = {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      };

      // 4. Implementar timeout de 15 segundos
      const timeoutMs = 15000;
      const apiCall = model.generateContent([
        'Analiza esta imagen y haz una auditoría visual de los insumos. Estima las cantidades de todo lo que puedas observar.',
        imagePart,
      ]);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
      });

      // Carrera entre la llamada API y el Timeout
      const result = await Promise.race([apiCall, timeoutPromise]);

      const responseText = result.response.text();
      if (!responseText) {
        throw new InternalServerErrorException('Gemini devolvió una respuesta vacía.');
      }

      // 5. Decodificar y retornar el JSON
      const parsedJson = JSON.parse(responseText);

      // Validar estructura mínima requerida
      if (!parsedJson.detections || !Array.isArray(parsedJson.detections)) {
        throw new InternalServerErrorException('El formato de respuesta de la IA no es el esperado.');
      }

      return parsedJson;

    } catch (error) {
      console.error('Error en la auditoría visual de Gemini:', error);
      
      if (error.message === 'TIMEOUT') {
        throw new InternalServerErrorException(
          'La consulta a la IA tomó demasiado tiempo. Inténtalo de nuevo con una imagen más pequeña.'
        );
      }
      
      if (error instanceof SyntaxError) {
        throw new InternalServerErrorException(
          'Error al procesar el JSON generado por la IA. Por favor, vuelve a enviar la imagen.'
        );
      }

      throw new InternalServerErrorException(
        `Error al conectar con el motor de IA Vision: ${error.message || error}`
      );
    }
  }
}
