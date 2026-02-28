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

/** PDF standard compliance level. */
export enum PdfStandard {
  None = "none",
  A2B = "pdf/a-2b",
  A3B = "pdf/a-3b",
}

/** Relationship of an embedded file to the PDF document. */
export enum EmbedRelationship {
  Alternative = "alternative",
  Supplement = "supplement",
  Data = "data",
  Source = "source",
  Unspecified = "unspecified",
}

/** Barcode symbology type. */
export enum BarcodeType {
  Qr = "qr",
  Code128 = "code128",
  Ean13 = "ean13",
  UpcA = "upca",
  Code39 = "code39",
}

/** Barcode anchor position on the page. */
export enum BarcodeAnchor {
  TopLeft = "top-left",
  TopRight = "top-right",
  BottomLeft = "bottom-left",
  BottomRight = "bottom-right",
}

/** PDF rendering mode. */
export type PdfMode = "auto" | "vector" | "raster";

/** PDF accessibility tagging level. */
export type AccessibilityLevel = "none" | "basic" | "pdf/ua-1";

/** Options for digitally signing a PDF document. */
export interface SignatureOptions {
  certificate_data?: string;
  password?: string;
  signer_name?: string;
  reason?: string;
  location?: string;
  timestamp_url?: string;
}

/** Options for encrypting a PDF document. */
export interface EncryptionOptions {
  user_password?: string;
  owner_password?: string;
  permissions?: string;
}

/** An embedded file attachment in a PDF document. */
export interface EmbeddedFilePayload {
  path: string;
  data: string; // base64-encoded
  mime_type?: string;
  description?: string;
  relationship?: EmbedRelationship;
}

/** A barcode to render on one or more PDF pages. */
export interface BarcodePayload {
  type: string;
  data: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  anchor?: string;
  foreground?: string;
  background?: string;
  draw_background?: boolean;
  pages?: string;
}

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
    page_numbers?: boolean;
    standard?: PdfStandard;
    embedded_files?: EmbeddedFilePayload[];
    watermark?: {
      text?: string;
      image_data?: string;
      opacity?: number;
      rotation?: number;
      color?: string;
      font_size?: number;
      scale?: number;
      layer?: WatermarkLayer;
      pages?: string;
    };
    barcodes?: BarcodePayload[];
    mode?: PdfMode;
    signature?: SignatureOptions;
    encryption?: EncryptionOptions;
    accessibility?: AccessibilityLevel;
    linearize?: boolean;
    document_lang?: string;
  };
}

/** Server error response body. */
export interface ErrorResponse {
  error: string;
}
