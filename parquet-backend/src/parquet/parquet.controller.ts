import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UploadedFile, 
  UseInterceptors,
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParquetService } from './parquet.service';
import * as fs from 'fs';

@Controller('parquet')
export class ParquetController {
  private readonly logger = new Logger(ParquetController.name);

  constructor(private readonly parquetService: ParquetService) {}

  // ✅ ENDPOINT DE PRUEBA
  @Get('test')
  test() {
    return { 
      success: true, 
      message: '✅ Parquet controller funcionando', 
      timestamp: new Date().toISOString() 
    };
  }

  // ----------------- SUBIR Y PROCESAR ARCHIVO -----------------
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadParquet(@UploadedFile() file: Express.Multer.File) {
    try {
      this.logger.log('📤 Subiendo archivo:', file?.originalname);

      if (!file) {
        throw new BadRequestException('No se recibió ningún archivo');
      }

      // 🔥 PROCESA EL ARCHIVO REALMENTE SUBIDO
      const result = await this.parquetService.processUploadedFile(file);
      
      return {
        success: true,
        message: '✅ Archivo subido y procesado correctamente',
        total_registros: result.totalRegistros,
        ruta_archivo: result.filename // Solo el nombre del archivo
      };

    } catch (error) {
      this.logger.error(`Error subiendo archivo: ${error.message}`);
      throw error;
    }
  }

  // ----------------- LEER DATOS DE ARCHIVO SUBIDO -----------------
  @Post('read')
  async readParquet(@Body() body: { 
    filePath: string; 
    limit?: number; 
    edificio?: string; 
    zona?: string; 
    nivel?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }) {
    try {
      const { filePath, limit, edificio, zona, nivel, fechaInicio, fechaFin } = body;
      
      if (!filePath) {
        throw new BadRequestException('filePath es requerido');
      }

      // Validar formato de fechas si se proporcionan
      if (fechaInicio && isNaN(new Date(fechaInicio).getTime())) {
        throw new BadRequestException('fechaInicio debe tener un formato de fecha válido (YYYY-MM-DD o YYYY-MM-DD HH:mm:ss)');
      }
      
      if (fechaFin && isNaN(new Date(fechaFin).getTime())) {
        throw new BadRequestException('fechaFin debe tener un formato de fecha válido (YYYY-MM-DD o YYYY-MM-DD HH:mm:ss)');
      }

      this.logger.log(`📖 Leyendo archivo: ${filePath}`);
      const result = await this.parquetService.getData(
        filePath, 
        limit, 
        edificio, 
        zona, 
        nivel, 
        fechaInicio, 
        fechaFin
      );
      
      return {
        success: true,
        totalRegistros: result.total,
        registrosMostrados: result.data.length,
        filtros: { 
          limit, 
          edificio, 
          zona, 
          nivel, 
          fechaInicio, 
          fechaFin 
        },
        data: result.data
      };

    } catch (error) {
      this.logger.error(`Error leyendo datos: ${error.message}`);
      throw error;
    }
  }

  // ----------------- OBTENER ESTADÍSTICAS DE ARCHIVO SUBIDO -----------------
  @Post('statistics')
  async getStatistics(@Body() body: { filePath: string }) {
    try {
      const { filePath } = body;
      
      if (!filePath) {
        throw new BadRequestException('filePath es requerido');
      }

      this.logger.log(`📊 Generando estadísticas para: ${filePath}`);
      const stats = await this.parquetService.getStatistics(filePath);
      
      return {
        success: true,
        estadisticas: stats
      };

    } catch (error) {
      this.logger.error(`Error generando estadísticas: ${error.message}`);
      throw error;
    }
  }

  // ----------------- ARCHIVO LOCAL DEL .ENV -----------------
  @Get('local-data')
  async readLocalParquet() {
    try {
      const filePath = process.env.PARQUET_FILE_PATH;
      
      this.logger.log(`📁 Leyendo archivo local: ${filePath}`);

      if (!filePath) {
        throw new BadRequestException('PARQUET_FILE_PATH no está configurado en el .env');
      }

      if (!fs.existsSync(filePath)) {
        throw new BadRequestException(`El archivo no existe: ${filePath}`);
      }

      const data = await this.parquetService.readParquetFile(filePath);
      
      return {
        success: true,
        message: '✅ Archivo local leído correctamente',
        ruta: filePath,
        totalRegistros: data.length,
        muestra: data.slice(0, 5)
      };

    } catch (error) {
      this.logger.error(`Error en local-data: ${error.message}`);
      throw error;
    }
  }

  @Get('local-statistics')
  async getLocalStatistics() {
    try {
      const filePath = process.env.PARQUET_FILE_PATH;
      
      if (!filePath) {
        throw new BadRequestException('PARQUET_FILE_PATH no está configurado');
      }

      this.logger.log(`📊 Generando estadísticas locales: ${filePath}`);
      const stats = await this.parquetService.getStatistics(filePath);
      
      return {
        success: true,
        message: '📊 Estadísticas generadas correctamente',
        ruta: filePath,
        estadisticas: stats
      };

    } catch (error) {
      this.logger.error(`Error en local-statistics: ${error.message}`);
      throw error;
    }
  }

  @Post('local-filter')
  async getLocalDataWithFilter(
    @Body() body: { 
      limit?: number; 
      edificio?: string; 
      zona?: string; 
      nivel?: string;
      fechaInicio?: string;
      fechaFin?: string;
    }
  ) {
    try {
      const filePath = process.env.PARQUET_FILE_PATH;
      const { limit, edificio, zona, nivel, fechaInicio, fechaFin } = body;

      if (!filePath) {
        throw new BadRequestException('PARQUET_FILE_PATH no está configurado');
      }

      // Validar formato de fechas si se proporcionan
      if (fechaInicio && isNaN(new Date(fechaInicio).getTime())) {
        throw new BadRequestException('fechaInicio debe tener un formato de fecha válido (YYYY-MM-DD o YYYY-MM-DD HH:mm:ss)');
      }
      
      if (fechaFin && isNaN(new Date(fechaFin).getTime())) {
        throw new BadRequestException('fechaFin debe tener un formato de fecha válido (YYYY-MM-DD o YYYY-MM-DD HH:mm:ss)');
      }

      this.logger.log(`🔍 Aplicando filtros locales: ${filePath}`);
      this.logger.log(`Filtros: edificio=${edificio}, zona=${zona}, nivel=${nivel}, fechaInicio=${fechaInicio}, fechaFin=${fechaFin}`);
      
      const result = await this.parquetService.getData(
        filePath, 
        limit, 
        edificio, 
        zona, 
        nivel, 
        fechaInicio, 
        fechaFin
      );
      
      return {
        success: true,
        message: '✅ Datos filtrados correctamente',
        totalRegistros: result.total,
        registrosMostrados: result.data.length,
        filtros: { 
          limit, 
          edificio, 
          zona, 
          nivel, 
          fechaInicio, 
          fechaFin 
        },
        data: result.data
      };

    } catch (error) {
      this.logger.error(`Error en local-filter: ${error.message}`);
      throw error;
    }
  }

  // ----------------- LECTURA DIRECTA DE ARCHIVO SUBIDO -----------------
  @Post('read-uploaded')
  async readUploadedFile(@Body() body: { filename: string }) {
    try {
      const { filename } = body;
      
      if (!filename) {
        throw new BadRequestException('filename es requerido');
      }

      const filePath = `${process.cwd()}/uploads/${filename}`;
      this.logger.log(`📖 Leyendo archivo subido: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        throw new BadRequestException(`El archivo ${filename} no existe en uploads`);
      }

      const data = await this.parquetService.readParquetFile(filePath);
      
      return {
        success: true,
        archivo: filename,
        totalRegistros: data.length,
        data: data.slice(0, 100)
      };

    } catch (error) {
      this.logger.error(`Error leyendo archivo subido: ${error.message}`);
      throw error;
    }
  }
}