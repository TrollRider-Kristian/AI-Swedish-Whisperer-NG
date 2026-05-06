import type { Schema } from "./resource";
import { generic_LLM_handler } from './genericFunctionHandler';

export const handler: Schema ["ministralSwedish"]["functionHandler"] = generic_LLM_handler (process.env.MINISTRAL_MODEL_ID);
