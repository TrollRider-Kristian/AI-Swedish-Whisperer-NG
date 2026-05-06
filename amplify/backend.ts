import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data, GEMMA_MODEL_ID, PALMYRA_MODEL_ID, MISTRAL_MODEL_ID, gemmaSwedishFunction, palmyraSwedishFunction, tutorSwedishFunction } from './data/resource';
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export const backend = defineBackend({
  auth,
  data,
  gemmaSwedishFunction,
  palmyraSwedishFunction,
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

backend.palmyraSwedishFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:*::foundation-model/${PALMYRA_MODEL_ID}`,
    ],
  })
);
