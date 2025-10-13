import { Module } from '@nestjs/common';
import { ParquetController } from './parquet/parquet.controller';
import { ParquetService } from './parquet/parquet.service';
import { AuthModule } from './auth/auth.module';

@Module({
  controllers: [ParquetController], // ✅ Directamente aquí
  providers: [ParquetService],
  imports: [AuthModule], // ✅ Asegúrate de que esté aquí
})
export class AppModule {}