import fs from "node:fs";
import fsp from "node:fs/promises";

export const mkdir = (dir: string) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir);
};
export const readFile = fsp.readFile;
export const writeFile = fsp.writeFile;
export const copyFile = fsp.copyFile;
