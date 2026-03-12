/* @ts-self-types="./wasm_preview.d.ts" */

import * as wasm from "./wasm_preview_bg.wasm";
import { __wbg_set_wasm } from "./wasm_preview_bg.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    Color, PreviewRenderer, benchmark_composition, init
} from "./wasm_preview_bg.js";
