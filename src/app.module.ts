import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { MetadataController } from './metadata/metadata.controller';
import { ConfigService } from './config/config.service';
import { ChromiaService } from './chromia/chromia.service';

@Module({
  imports: [],
  controllers: [HealthController, MetadataController],
  providers: [ConfigService, ChromiaService],
})
export class AppModule {}
