import { promises as fs } from 'fs';

export async function deleteDirectories(directories: string[]): Promise<void> {
  for (const directory of directories) {
    try {
      await fs.rm(directory, { recursive: true, force: true });
    } catch (error) {
      console.error(`Failed to delete directory ${directory}: ${error}`);
    }
  }
}