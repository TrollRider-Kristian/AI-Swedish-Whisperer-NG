import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data, COHERE_MODEL_ID, GEMMA_MODEL_ID, MISTRAL_MODEL_ID, cohereSwedishFunction, gemmaSwedishFunction, tutorSwedishFunction } from './data/resource';
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export const backend = defineBackend({
  auth,
  data,
  cohereSwedishFunction,
  gemmaSwedishFunction,
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

backend.cohereSwedishFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:*::foundation-model/${COHERE_MODEL_ID}`,
    ],
  })
);
