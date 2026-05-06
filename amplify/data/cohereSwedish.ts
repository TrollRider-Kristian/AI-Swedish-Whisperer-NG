import type { Schema } from "./resource";
import { generic_LLM_handler } from './genericFunctionHandler';

export const handler: Schema ["cohereSwedish"]["functionHandler"] = generic_LLM_handler (process.env.COHERE_MODEL_ID);
