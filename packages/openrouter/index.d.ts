import type { LanguageModel } from "ai";

export declare const MODELS: {
  cheap: string;
  small: string;
  strong: string;
  coder: string;
  vision: string;
};

export declare const DEFAULT_MODEL: string;

export interface LabOpenRouterOptions {
  apiKey?: string;
  headers?: Record<string, string>;
}

export declare function createLabOpenRouter(
  opts?: LabOpenRouterOptions,
): (modelId: string) => LanguageModel;

export declare function orModel(
  modelId?: string,
  opts?: LabOpenRouterOptions,
): LanguageModel;

declare const _default: typeof orModel;
export default _default;
