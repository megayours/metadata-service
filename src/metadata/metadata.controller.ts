import { Controller, Get, Param, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { ChromiaService } from '../chromia/chromia.service';

@Controller('metadata')
export class MetadataController {
  constructor(
    private readonly configService: ConfigService,
    private readonly chromiaService: ChromiaService,
  ) {}

  @Get('**')
  async getMetadata(
    @Param('0') path: string,
    @Headers('x-bc-source') bcSource: string = 'prod'
  ): Promise<any> {
    const allowedSources = ['prod', 'dev', 'test', 'stage'];
    if (!allowedSources.includes(bcSource)) {
      throw new HttpException('Invalid x-bc-source header', HttpStatus.BAD_REQUEST);
    }

    const pathParts = path.split('/');
    const tokenId = pathParts.pop();
    const subpath = pathParts.join('/');

    const config = this.configService.getConfig(subpath);
    if (!config || !tokenId) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const { project, collection } = config;

    const chromiaMetadata = await this.chromiaService.getTokenMetadata(bcSource, project, collection, tokenId);
    if (chromiaMetadata) {
      return chromiaMetadata;
    }

    const baseMetadata = this.configService.getBaseMetadata(project, collection, tokenId);
    if (!baseMetadata) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return baseMetadata;
  }
}
