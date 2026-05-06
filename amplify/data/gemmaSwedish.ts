import type { Schema } from "./resource";
import { generic_LLM_handler } from './genericFunctionHandler';

export const handler: Schema ["gemmaSwedish"]["functionHandler"] = generic_LLM_handler (process.env.GEMMA_MODEL_ID);
