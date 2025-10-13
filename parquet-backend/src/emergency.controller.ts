import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('emergency')
export class EmergencyController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  testUpload(@UploadedFile() file: Express.Multer.File) {
    return {
      success: true,
      message: '✅ Emergency endpoint funciona',
      file: file?.originalname
    };
  }
}