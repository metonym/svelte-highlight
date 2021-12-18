import fs from "fs";
import { promisify } from "util";

export const rmdir = fs.rmdirSync;
export const mkdir = promisify(fs.mkdir);
export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const copyFile = promisify(fs.copyFile);
