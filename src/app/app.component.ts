import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { PromptBedrockComponent } from './prompt-bedrock/prompt-bedrock.component';
import { ScoreFeedbackComponent } from './score-feedback/score-feedback.component';
import { SelectTopicForPracticeComponent } from "./select-topic-for-practice/select-topic.component";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

Amplify.configure(outputs);

export enum WHICH_PAGE {
  TOPIC_SELECTION_PAGE,
  ANSWER_AND_FEEDBACK_PAGE,
  FEEDBACK_SCORING_PAGE,
};

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    PromptBedrockComponent,
    ReactiveFormsModule,
    ScoreFeedbackComponent,
    SelectTopicForPracticeComponent
  ],
})
export class AppComponent {
  private _client = generateClient<Schema>();
  title = 'AI Swedish Whisperer';
  subtitle = 'A Tutor Assistant for Learners of the Swedish Language';

  // KRISTIAN_TODO_PART_2 - If I get more specific with my prompting, I risk a sending a LOT of tokens to Bedrock.
  // And Bedrock costs $$$.  Part of the purpose of this app is to measure the comprehension of the LLM's as Swedish tutors.
  // These tokens are necessary.  However, I can create my own custom LLM in the future.
  // Perhaps there are some hard and fast rules in Swedish that don't require an LLM at all?  It's a prediction machine, but parts of Swedish are logical.
  // For example, all nouns ending with "a" (eg. "lampa") have plural forms ending in "or" (eg. "lampor").
  // Short-circuiting some model prediction with my own learnings in Swedish might be of some help.
  current_swedish_tutor = new FormControl<(param_0: {prompt: string}) => any> (this._client.queries.tutorSwedish, Validators.required);

  // KRISTIAN_TODO_PART_2 - Figure out how to import CustomOperationsMethodOptions, SingularReturnValue, and Nullable from amplify so that I don't have to
  // cast 'value' as 'any' here.  Google suggests they come from either 'aws-amplify/api' or 'aws-amplify/api-graphql', but the import statements could not
  // fetch these types from either of those libraries.  Looking in node_modules, all the types and functions in those files were intended for internal use only,
  // suggesting that AWS doesn't want us to import these types directly and instead just export the client as a singleton throughout the project.
  // I also tried 'export type TUTOR_FUNCTION = typeof (param_0: {prompt: string}, param_1: any) => any' as a shorthand for this lambda function that I could
  // have to cast value as something other than 'any', but that didn't work either.  Casting value as 'any' for now because I have no other choice.
  private _swedish_LLM_tutors: {value: (param_0: {prompt: string}) => any, display_value: string}[] = [
    { value: this._client.queries.tutorSwedish, display_value: 'Mistral Large' },
    { value: this._client.queries.ministralSwedish, display_value: 'Ministral' },
    { value: this._client.queries.gemmaSwedish, display_value: 'Gemma' },
    { value: this._client.queries.gemmaMiniSwedish, display_value: 'Gemma-Mini' },
  ];
  public get swedish_LLM_tutors(): {value: any, display_value: string}[] {
    return this._swedish_LLM_tutors;
  }

  // KRISTIAN_NOTE - Need to declare the WHICH_PAGE enum type INSIDE the app component in order to access it in if-statements in the html.
  // Inspired by this: https://stackoverflow.com/questions/44045311/cannot-approach-typescript-enum-within-html
  Which_Page_Type = WHICH_PAGE;
  private _current_app_page = WHICH_PAGE.TOPIC_SELECTION_PAGE;
  public get current_app_page(): WHICH_PAGE {
    return this._current_app_page;
  }

  private _current_topic: string | null = null;
  private _is_custom_user_question: boolean | null = null;
  public get current_topic() {
    return this._current_topic;
  }
  public get is_custom_user_question() {
    return this._is_custom_user_question;
  }

  private _current_feedback: string = '';
  public get current_feedback(): string {
    return this._current_feedback;
  }

  request_new_topic(): void {
    this._current_topic = null;
    this._is_custom_user_question = null;
    this._current_app_page = WHICH_PAGE.TOPIC_SELECTION_PAGE;
  }
  accept_new_topic(new_topic: string | null): void {
    this._current_topic = new_topic;
    this._current_app_page = WHICH_PAGE.ANSWER_AND_FEEDBACK_PAGE;
  }
  accept_custom_user_question_flag (is_custom_user_question: boolean | null): void {
    this._is_custom_user_question = is_custom_user_question;
  }
  direct_user_to_feedback_scoring (feedback_to_copy_over: string | null): void {
    this._current_feedback = feedback_to_copy_over == null ? '' : feedback_to_copy_over;
    this._current_app_page = WHICH_PAGE.FEEDBACK_SCORING_PAGE;
  }
}
