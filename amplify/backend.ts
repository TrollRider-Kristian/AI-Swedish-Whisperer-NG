import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data, MISTRAL_MODEL_ID, NOVA_MODEL_ID, novaSwedishFunction, tutorSwedishFunction } from './data/resource';
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export const backend = defineBackend({
  auth,
  data,
  novaSwedishFunction,
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

backend.novaSwedishFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:*::foundation-model/${NOVA_MODEL_ID}`,
    ],
  })
);
