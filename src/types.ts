/** Output format for rendered content. */
export type OutputFormat = "pdf" | "png" | "jpeg" | "bmp" | "tga" | "qoi" | "svg";

/** Page orientation. */
export type Orientation = "portrait" | "landscape";

/** Document flow mode. */
export type Flow = "auto" | "paginate" | "continuous";

/** Dithering algorithm for color quantization. */
export type DitherMethod = "none" | "floyd-steinberg" | "atkinson" | "ordered";

/** Built-in color palette presets. */
export type PalettePreset = "auto" | "bw" | "grayscale" | "eink";

/** Color palette: a preset name or array of hex color strings. */
export type Palette = PalettePreset | string[];

/** Render request payload sent to the server. */
export interface RenderPayload {
  html?: string;
  url?: string;
  format: OutputFormat;
  width?: number;
  height?: number;
  paper?: string;
  orientation?: Orientation;
  margins?: string;
  flow?: Flow;
  density?: number;
  background?: string;
  timeout?: number;
  quantize?: {
    colors?: number;
    palette?: Palette;
    dither?: DitherMethod;
  };
  pdf?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    bookmarks?: boolean;
  };
}

/** Server error response body. */
export interface ErrorResponse {
  error: string;
}
