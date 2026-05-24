import { Module } from '@nestjs/common';
import { ProformasController } from './proformas.controller';
import { ProformasService } from './proformas.service';
import { PdfService } from './pdf.service';
import { CalendarService } from './calendar.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProformasController],
  providers: [
    ProformasService,
    PdfService,
    CalendarService
  ],
  exports: [ProformasService, PdfService]
})
export class ProformasModule {}
