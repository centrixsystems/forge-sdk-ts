/** Output format for rendered content. */
export type OutputFormat = "pdf" | "png" | "jpeg" | "bmp" | "tga" | "qoi" | "svg";

/** Page orientation. */
export type Orientation = "portrait" | "landscape";

/** Document flow mode. */
export type Flow = "auto" | "paginate" | "continuous";

/** Dithering algorithm for color quantization. */
export type DitherMethod = "none" | "floyd-steinberg" | "atkinson" | "ordered";

/** Watermark layer position. */
export type WatermarkLayer = "over" | "under";

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
    watermark?: {
      text?: string;
      image_data?: string;
      opacity?: number;
      rotation?: number;
      color?: string;
      font_size?: number;
      scale?: number;
      layer?: WatermarkLayer;
    };
  };
}

/** Server error response body. */
export interface ErrorResponse {
  error: string;
}
