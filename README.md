# Welcome to the AI-Swedish-Whisperer-NG

## How It Works

I used the template for an Angular application designed to run on AWS Amplify to create a wrapper UI for an AI Swedish tutor program.
It sends and receives prompts from any one of four LLM's on AWS Bedrock in order to teach the user Swedish.

It invites the user to select a predetermined topic or decide a custom topic.  Then, it sends a prompt to one of four LLM's of the user's choice
to receive a question in Swedish.  Once the user responds to the question, it will send another prompt to that LLM for feedback on the user's spelling
and grammatical mistakes.  The user may choose one of the following LLM's:

1. Mistral Large 3: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-mistral-ai-mistral-large-3.html
2. Ministral 3B: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-mistral-ai-ministral-3b.html
3. Gemma 3, 27B PT: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-google-gemma-3-27b-pt.html
4. Gemma 3, 4B IT: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-google-gemma-3-4b-it.html

In addition, there's a scoring component in the app allowing the user to rate feedback provided by the LLM against a known specific feedback answer.
On a score from 1 to 10, the LLM will grade its own feedback against the provided "feedback answer key".

This app is deployed on AWS Amplify.

## Usage

To launch the application, run the following commands:

`npm install`
`npm run build`
`npm run start`

Once it builds and runs, go to localhost:4200 to use the app.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.