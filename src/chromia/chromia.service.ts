import { Injectable } from '@nestjs/common';

@Injectable()
export class ChromiaService {
  async getTokenMetadata(bcSource: string, project: string, collection: string, tokenId: string): Promise<any> {
    // Placeholder implementation, always returns null
    return null;
  }
}
