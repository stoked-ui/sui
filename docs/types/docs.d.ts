declare module 'docs/src/modules/components/HighlightedCode' {
  import * as React from 'react';
  import { StyledComponentProps } from '@mui/material/styles';

  type ClassKey = 'root';
  export interface Props extends StyledComponentProps<ClassKey> {
    className?: string;
    /**
     * plain string
     */
    code: string;
    copyButtonHidden?: boolean;
    copyButtonProps?: JSX.IntrinsicElements['button'];
    /**
     * short identifier of the code language
     * see @stoked-ui/docs-markdown/prism for possible languages
     */
    language: string;
    /**
     * The component used for the root node.
     * @default MarkdownElement
     */
    component?: React.ElementType;
    sx?: object;
  }
  export default function HighlightedCode(props: Props): React.ReactElement;
}

declare module 'react-imask';

declare module '@stoked-ui/video-renderer-wasm' {
  export class PreviewRenderer {
    free(): void;
    constructor(canvas: HTMLCanvasElement, width: number, height: number);
    render_frame(layers_json: string): void;
    render_frame_at_time(layers_json: string, time_ms: number): void;
    clear(): void;
    get_metrics(): string;
    cache_image(url: string, data: Uint8Array, width: number, height: number): void;
    clear_image_cache(): void;
    is_image_cached(url: string): boolean;
  }

  export class Color {
    free(): void;
    constructor(r: number, g: number, b: number, a: number);
    static rgb(r: number, g: number, b: number): Color;
    r: number;
    g: number;
    b: number;
    a: number;
  }

  export function benchmark_composition(width: number, height: number, layer_count: number): number;
  export function init(): void;

  export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

  export interface InitOutput {
    readonly memory: WebAssembly.Memory;
  }

  export default function __wbg_init(
    module_or_path?: InitInput | Promise<InitInput>
  ): Promise<InitOutput>;
}
