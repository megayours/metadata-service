import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface ProjectConfig {
  project: string;
  collection: string;
}

interface BaseMetadata {
  name: string;
  image: string;
  description: string;
  attributes: { trait_type: string; value: any }[];
}

@Injectable()
export class ConfigService {
  private readonly config: Map<string, ProjectConfig>;
  private readonly baseMetadata: Map<string, Map<string, Map<string, BaseMetadata>>>;

  constructor() {
    this.config = this.loadConfig();
    this.baseMetadata = this.loadBaseMetadata();
  }

  private loadConfig(): Map<string, ProjectConfig> {
    const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return new Map(Object.entries(configData));
  }

  private loadBaseMetadata(): Map<string, Map<string, Map<string, BaseMetadata>>> {
    const baseMetadataDir = path.join(__dirname, '..', '..', 'metadata');
    const projectDirs = fs.readdirSync(baseMetadataDir);

    const baseMetadata = new Map();

    for (const project of projectDirs) {
      const projectPath = path.join(baseMetadataDir, project);
      const collectionFiles = fs.readdirSync(projectPath);

      const projectMap = new Map();

      for (const collectionFile of collectionFiles) {
        const collectionPath = path.join(projectPath, collectionFile);
        const collectionData = JSON.parse(fs.readFileSync(collectionPath, 'utf-8'));

        const collectionMap = new Map(Object.entries(collectionData));
        projectMap.set(path.parse(collectionFile).name, collectionMap);
      }

      baseMetadata.set(project, projectMap);
    }

    return baseMetadata;
  }

  getConfig(subpath: string): ProjectConfig | undefined {
    return this.config.get(subpath);
  }

  getBaseMetadata(project: string, collection: string, tokenId: string): BaseMetadata | undefined {
    return this.baseMetadata.get(project)?.get(collection)?.get(tokenId);
  }
}
