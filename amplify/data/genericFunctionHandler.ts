import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

// initialize bedrock runtime client
export const client = new BedrockRuntimeClient();

export const generic_LLM_handler = (LLM_model_id: string | undefined) => async (
  event: any,
  context: any,
) => {
  // User prompt
  const prompt = event.arguments.prompt;

  // Invoke model
  const input = {
    modelId: LLM_model_id,
    contentType: "application/json",
    accept: "application/json",
    // KRISTIAN_NOTE - The input body for the function handler in tutorSwedish.ts needs to be a string to be compatible with
    // the BlobPayloadInputTypes data type.  It accepts strings and arrays but not straight up JSON objects.
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      system:
        "You are my Swedish tutor.  You ask me questions in Swedish and accept only Swedish responses.  For each incorrect word in my response, you explain the concept associated with the incorrect word and provide the correct word.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.5,
    }),
  } as InvokeModelCommandInput;

  const command = new InvokeModelCommand(input);

  const response = await client.send(command);

  // Get the generated response as a JSON object.
  const data = JSON.parse(Buffer.from(response?.body)?.toString());

  // KRISTIAN_NOTE - Since the tutorial, the response has changed format.  It was data.content[0].text,
  // but now (as of January 19, 2026), it's data.choices[0].message.content.
  // https://docs.amplify.aws/angular/build-a-backend/data/custom-business-logic/connect-bedrock/
  if (data?.choices?.length > 0) {
    return data?.choices[0]?.message?.content;
  } else {
    // If the data changes format again, then return the whole thing so I can console log
    // and troubleshoot it on the front-end.
    return data;
  }
};