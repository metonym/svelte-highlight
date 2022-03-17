import fs from "fs";
import fsp from "fs/promises";

/** @type {(dir: string) => void} */
export const mkdir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir);
};
export const readFile = fsp.readFile;
export const writeFile = fsp.writeFile;
export const copyFile = fsp.copyFile;
