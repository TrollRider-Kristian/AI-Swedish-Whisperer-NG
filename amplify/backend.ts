import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import {
  data,
  GEMMA_MODEL_ID,
  GEMMA_MINI_MODEL_ID,
  MINISTRAL_MODEL_ID,
  MISTRAL_MODEL_ID,
  gemmaSwedishFunction,
  gemmaMiniSwedishFunction,
  ministralSwedishFunction,
  tutorSwedishFunction,
} from './data/resource';
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export const backend = defineBackend({
  auth,
  data,
  ministralSwedishFunction,
  gemmaSwedishFunction,
  gemmaMiniSwedishFunction,
  tutorSwedishFunction,
});

backend.tutorSwedishFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:*::foundation-model/${MISTRAL_MODEL_ID}`,
    ],
  })
);

backend.gemmaSwedishFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:*::foundation-model/${GEMMA_MODEL_ID}`,
    ],
  })
);

backend.gemmaMiniSwedishFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:*::foundation-model/${GEMMA_MINI_MODEL_ID}`,
    ],
  })
);

backend.ministralSwedishFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:*::foundation-model/${MINISTRAL_MODEL_ID}`,
    ],
  })
);
