#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Check if the filename is provided
const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error('Usage: cli-it <filename>');
    process.exit(1);
}
const filename = args[0];
const filePath = path.resolve(filename);
const commandName = path.basename(filename, '.sh');
if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}
// Create a symbolic link to the .sh file in a directory included in the PATH
const linkDir = '/usr/local/bin'; // You might need sudo privileges to write here
const linkPath = path.join(linkDir, commandName);
(0, child_process_1.exec)(`ln -sf ${filePath} ${linkPath}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error creating symlink: ${stderr}`);
        process.exit(1);
    }
    console.log(`Command '${commandName}' created. You can now run it from anywhere.`);
});
