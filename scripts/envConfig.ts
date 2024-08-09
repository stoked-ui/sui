import pkg from '@next/env';
import path from "path";

const { loadEnvConfig } = pkg;
const {combinedEnv, loadedEnvFiles} = loadEnvConfig(path.join(process.cwd(), '.env'));
console.log(combinedEnv, loadedEnvFiles);
