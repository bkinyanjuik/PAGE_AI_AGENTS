import fs from 'fs/promises';
import path from 'path';

export interface FileOperation {
  read(filePath: string): Promise<string>;
  write(filePath: string, content: string): Promise<void>;
  list(directory: string): Promise<string[]>;
  exists(filePath: string): Promise<boolean>;
}

export class FileOperations implements FileOperation {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  private resolvePath(filePath: string): string {
    return path.resolve(this.basePath, filePath);
  }

  async read(filePath: string): Promise<string> {
    try {
      const fullPath = this.resolvePath(filePath);
      return await fs.readFile(fullPath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  async write(filePath: string, content: string): Promise<void> {
    try {
      const fullPath = this.resolvePath(filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
  }

  async list(directory: string): Promise<string[]> {
    try {
      const fullPath = this.resolvePath(directory);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isFile())
        .map(entry => path.join(directory, entry.name));
    } catch (error) {
      throw new Error(`Failed to list directory ${directory}: ${error}`);
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(this.resolvePath(filePath));
      return true;
    } catch {
      return false;
    }
  }
}
