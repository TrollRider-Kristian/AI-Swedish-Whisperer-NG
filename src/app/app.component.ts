import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { PromptBedrockComponent } from './prompt-bedrock/prompt-bedrock.component';
import { SelectTopicForPracticeComponent } from "./select-topic-for-practice/select-topic.component";

Amplify.configure(outputs);

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [CommonModule, PromptBedrockComponent, SelectTopicForPracticeComponent],
})
export class AppComponent {
  title = 'AI Swedish Whisperer';
  subtitle = 'A Tutor Assistant for Learners of the Swedish Language';
  private _current_topic: string | null = null;
  private _is_custom_user_question: boolean | null = null;
  public get current_topic() {
    return this._current_topic;
  }
  public get is_custom_user_question() {
    return this._is_custom_user_question;
  }
  request_new_topic(): void {
    this._current_topic = null;
    this._is_custom_user_question = null;
  }
  accept_new_topic(new_topic: string | null): void {
    this._current_topic = new_topic;
  }
  accept_custom_user_question_flag (is_custom_user_question: boolean | null): void {
    this._is_custom_user_question = is_custom_user_question;
  }
}

// More Feedback from me to me:
// KRISTIAN_TODO - What if the user answers in English or refuses to answer in Swedish?

// KRISTIAN_TODO - Should there be a cap on the number of characters in the user response?
// How to display this in the UI?

// KRISTIAN_TODO - How do I go about the chat history?

// KRISTIAN_TODO - If I get more specific with my prompting, I risk a sending a LOT of tokens to Bedrock.
// And Bedrock costs $$$.
// Perhaps, I can have some code examine some hard and fast rules and help "cover" for Bedrock?
// For example, all nouns ending with "a" (eg. "lampa") have plural forms ending in "or" (eg. "lampor").
// Short-circuiting some model prediction with my own learnings in Swedish might be of some help.

// KRISTIAN_TODO - Also, README and documentation are important!  Update them as I go along!

// KRISTIAN_TODO - How interactive is the application itself?  Can I ask for clarification on the response?

// KRISTIAN_TODO - How do I know how effective Mistral is?

// KRISTIAN_TODO - Compare to other models.

// KRISTIAN_TODO - Make the feedback more readable.  I'm thinking bullet points!
