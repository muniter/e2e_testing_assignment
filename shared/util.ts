import * as fs from 'fs';

export function deleteCreateDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir);
}

