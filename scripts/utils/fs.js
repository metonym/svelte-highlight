import fs from "fs";
import { promisify } from "util";

export const mkdir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmdirSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir);
}
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const copyFile = promisify(fs.copyFile);
