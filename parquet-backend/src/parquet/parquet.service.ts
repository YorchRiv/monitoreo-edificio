import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

export interface MedicionElectrica {
  id_medicion: number;
  voltaje: number;
  corriente: number;
  potencia_calc: number;
  energia_acumulada_calc: number;
  factor_potencia: number;
  frecuencia: number;
  sensor_modelo: string;
  sensor_tipo_medicion: string;
  sensor_estado: string;
  circuito_capacidad_nominal: number;
  circuito_descripcion: string;
  circuito_tipo: string;
  zona_nombre: string;
  zona_descripcion: string;
  nivel_nombre: string;
  nivel_descripcion: string;
  edificio_nombre: string;
  edificio_descripcion: string;
  dia: number;
  mes: number;
  anio: number;
  fecha_creacion: string;
}

@Injectable()
export class ParquetService {
  private readonly logger = new Logger(ParquetService.name);
  private uploadsDir = join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadsDir();
  }

  // ==================== MÉTODOS PÚBLICOS PRINCIPALES ====================

  /**
   * 🗃️ Procesar archivo subido
   */
  async processUploadedFile(file: Express.Multer.File): Promise<{ 
    filename: string; 
    filePath: string; 
    totalRegistros: number; 
  }> {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    const filename = `upload_${Date.now()}.parquet`;
    const filePath = join(this.uploadsDir, filename);

    this.logger.log(`💾 Guardando archivo: ${filePath}`);
    fs.writeFileSync(filePath, file.buffer);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(`No se pudo guardar: ${filePath}`);
    }

    const data = await this.readParquetFile(filePath);

    return {
      filename,
      filePath,
      totalRegistros: data.length
    };
  }

  /**
   * 📊 Obtener estadísticas del archivo
   */
  async getStatistics(filePath: string): Promise<any> {
    const data = await this.readParquetFile(filePath);
    
    if (!data || data.length === 0) {
      throw new BadRequestException('No hay datos para generar estadísticas');
    }

    const voltajes = data.map(d => d.voltaje).filter(v => v != null);
    const corrientes = data.map(d => d.corriente).filter(v => v != null);
    const potencias = data.map(d => d.potencia_calc).filter(v => v != null);

    return {
      totalRegistros: data.length,
      promedioVoltaje: this.calcularPromedio(voltajes),
      promedioCorriente: this.calcularPromedio(corrientes),
      promedioPotencia: this.calcularPromedio(potencias),
      energiaTotal: data.reduce((sum, r) => sum + (r.energia_acumulada_calc || 0), 0),
      edificios: Array.from(new Set(data.map(d => d.edificio_nombre).filter(Boolean))),
      zonas: Array.from(new Set(data.map(d => d.zona_nombre).filter(Boolean))),
      sensores: Array.from(new Set(data.map(d => d.sensor_modelo).filter(Boolean))),
      fechaMinima: this.obtenerFechaMinima(data),
      fechaMaxima: this.obtenerFechaMaxima(data)
    };
  }

  /**
   * 📄 Obtener datos con filtros
   */
  async getData(
    filePath: string, 
    limit?: number, 
    edificio?: string, 
    zona?: string
  ): Promise<{ data: MedicionElectrica[]; total: number }> {
    let data = await this.readParquetFile(filePath);

    // Aplicar filtros
    if (edificio) {
      data = data.filter(d => d.edificio_nombre === edificio);
    }
    if (zona) {
      data = data.filter(d => d.zona_nombre === zona);
    }

    const total = data.length;

    // Aplicar límite
    if (limit && limit > 0) {
      data = data.slice(0, limit);
    }

    return { data, total };
  }

  // ==================== MÉTODOS DE LECTURA ====================

  /**
   * ✅ MÉTODO PRINCIPAL - Python primero (más confiable)
   */
  async readParquetFile(filePath: string): Promise<MedicionElectrica[]> {
    try {
      this.logger.log(`🔍 Recibida ruta: ${filePath}`);

      // 🔥 RESOLVER RUTA CORRECTAMENTE
      const absolutePath = this.resolveFilePath(filePath);
      this.logger.log(`🔍 Buscando en: ${absolutePath}`);

      if (!fs.existsSync(absolutePath)) {
        throw new BadRequestException(`El archivo no existe: ${absolutePath}. Directorio uploads: ${this.uploadsDir}`);
      }

      // 🔥 USAR PYTHON PRIMERO (más confiable)
      return await this.readParquetWithPython(absolutePath);

    } catch (error) {
      this.logger.error(`❌ Error con Python: ${error.message}`);
      
      // Si Python falla, intentar con parquets como fallback
      this.logger.log('🔄 Intentando con parquets como fallback...');
      return await this.readParquetWithParquets(filePath);
    }
  }

  /**
   * 🐍 LECTURA CON PYTHON/PANDAS (MÉTODO PRINCIPAL)
   */
  private async readParquetWithPython(filePath: string): Promise<MedicionElectrica[]> {
    try {
      this.logger.log('🐍 Leyendo con Python/pandas...');
      
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const pythonScript = `
import pandas as pd
import json
try:
    df = pd.read_parquet("${filePath.replace(/\\/g, '\\\\')}")
    # Convertir todos los tipos numéricos
    for col in df.select_dtypes(include=['int64', 'float64']).columns:
        df[col] = df[col].astype('float64')
    print(df.to_json(orient='records', date_format='iso'))
except Exception as e:
    print("ERROR:" + str(e))
    exit(1)
      `;

      const scriptPath = join(this.uploadsDir, `temp_script_${Date.now()}.py`);
      fs.writeFileSync(scriptPath, pythonScript);

      const { stdout } = await execAsync(`python "${scriptPath}"`);
      fs.unlinkSync(scriptPath);

      if (stdout.startsWith('ERROR:')) {
        throw new Error(stdout.substring(6));
      }

      const data = JSON.parse(stdout);
      this.logger.log(`✅ Python/pandas exitoso. Registros: ${data.length}`);
      return data;

    } catch (error) {
      this.logger.error(`❌ Python falló: ${error.message}`);
      throw error; // Propagar el error para que lo capture el fallback
    }
  }

  /**
   * 📚 LECTURA CON PARQUETS (FALLBACK)
   */
  private async readParquetWithParquets(filePath: string): Promise<MedicionElectrica[]> {
    try {
      this.logger.log('📚 Intentando con parquets...');

      const absolutePath = this.resolveFilePath(filePath);
      const parquets = await import('parquets');
      const reader = await parquets.ParquetReader.openFile(absolutePath);
      const cursor = reader.getCursor();
      
      const records: MedicionElectrica[] = [];
      let record = null;
      
      // Leer todos los registros
      while ((record = await cursor.next())) {
        records.push(record as MedicionElectrica);
      }
      
      await reader.close();

      this.logger.log(`✅ Parquets exitoso. Registros: ${records.length}`);
      return records;

    } catch (error) {
      this.logger.error(`❌ Parquets también falló: ${error.message}`);
      throw new BadRequestException(`No se pudo leer el archivo Parquet: ${error.message}`);
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * 🔥 RESOLVER RUTA DEL ARCHIVO INTELIGENTEMENTE
   */
  private resolveFilePath(filePath: string): string {
    // Caso 1: Solo nombre de archivo → está en uploads
    if (!filePath.includes('/') && !filePath.includes('\\')) {
      return join(this.uploadsDir, filePath);
    }
    
    // Caso 2: Ruta con "uploads/" → construir desde root
    if (filePath.startsWith('uploads/')) {
      return join(process.cwd(), filePath);
    }
    
    // Caso 3: Ya es ruta absoluta → usar tal cual
    if (filePath.startsWith('C:/') || filePath.startsWith('/') || filePath.includes(':\\')) {
      return filePath;
    }
    
    // Caso 4: Ruta relativa con "../" o "./" → resolver
    if (filePath.startsWith('../') || filePath.startsWith('./')) {
      return join(process.cwd(), filePath);
    }
    
    // Caso por defecto: asumir que está en uploads
    return join(this.uploadsDir, filePath);
  }

  private ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  private calcularPromedio(numeros: number[]): number {
    if (!numeros.length) return 0;
    return numeros.reduce((a, b) => a + b, 0) / numeros.length;
  }

  private obtenerFechaMinima(data: MedicionElectrica[]): string {
    const fechas = data.map(d => d.fecha_creacion).filter(Boolean);
    return fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : 'N/A';
  }

  private obtenerFechaMaxima(data: MedicionElectrica[]): string {
    const fechas = data.map(d => d.fecha_creacion).filter(Boolean);
    return fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : 'N/A';
  }
}