import type { Schema } from "./resource";
import { generic_LLM_handler } from './genericFunctionHandler';

export const handler: Schema ["tutorSwedish"]["functionHandler"] = generic_LLM_handler (process.env.MISTRAL_MODEL_ID);
