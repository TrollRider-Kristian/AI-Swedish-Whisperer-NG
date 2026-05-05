import type { Schema } from "./resource";
import { generic_LLM_handler } from './genericFunctionHandler';

export const handler: Schema ["novaSwedish"]["functionHandler"] = generic_LLM_handler (process.env.NOVA_MODEL_ID);