// @ts-check
import fs from "node:fs";
import fsp from "node:fs/promises";

/** @type {(dir: string, noRemove?: boolean) => void} */
export const mkdir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir);
};
export const readFile = fsp.readFile;
export const writeFile = fsp.writeFile;
export const copyFile = fsp.copyFile;
