import type { Schema } from "./resource";
import { generic_LLM_handler } from './genericFunctionHandler';

export const handler: Schema ["gemmaMiniSwedish"]["functionHandler"] = generic_LLM_handler (process.env.GEMMA_MINI_MODEL_ID);
