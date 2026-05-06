import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Swedish tutor function and a database table
currently out of the scope of the Springboard ML capstone project.
This database table would be a solid follow-up suggestion after the capstone.
=========================================================================*/

export const MISTRAL_MODEL_ID = 'mistral.mistral-large-3-675b-instruct';
export const MINISTRAL_MODEL_ID = 'mistral.ministral-3-3b-instruct';
export const GEMMA_MODEL_ID = 'google.gemma-3-27b-it';
export const GEMMA_MINI_MODEL_ID = 'google.gemma-3-4b-it';

export const tutorSwedishFunction = defineFunction({
  entry: "./tutorSwedish.ts",
  environment: {
    MISTRAL_MODEL_ID,
  }
});

export const ministralSwedishFunction = defineFunction({
  entry: "./ministralSwedish.ts",
  environment: {
    MINISTRAL_MODEL_ID,
  }
})

export const gemmaSwedishFunction = defineFunction({
  entry: "./gemmaSwedish.ts",
  environment: {
    GEMMA_MODEL_ID,
  }
});

export const gemmaMiniSwedishFunction = defineFunction({
  entry: "./gemmaMiniSwedish.ts",
  environment: {
    GEMMA_MINI_MODEL_ID,
  }
});

const schema = a.schema({
  tutorSwedish: a
    .query()
    .arguments({ prompt: a.string().required() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(tutorSwedishFunction)),

  ministralSwedish: a
    .query()
    .arguments({ prompt: a.string().required() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(ministralSwedishFunction)),

  gemmaSwedish: a
    .query()
    .arguments({ prompt: a.string().required() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(gemmaSwedishFunction)),

  gemmaMiniSwedish: a
    .query()
    .arguments({ prompt: a.string().required() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(gemmaMiniSwedishFunction)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 90,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
