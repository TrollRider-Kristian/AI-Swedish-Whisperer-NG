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
export const client = generateClient<Schema>();

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
  title = 'AI Swedish Whisperer';
  subtitle = 'A Tutor Assistant for Learners of the Swedish Language';

  // KRISTIAN_TODO_NOW - Need an interface by which selecting a tutor returns client.queries.(tutorSwedish/ministralSwedish/gemmaSwedish/gemmaMiniSwedish)
  // and binds to ALL prompt functions in the app.
  current_swedish_tutor = new FormControl<string | null> (null, Validators.required);
  private _swedish_LLM_tutors: string[] = [
    'Mistral',
    'Ministral',
    'Gemma',
    'Gemma-Mini',
  ];
  public get swedish_LLM_tutors(): string[] {
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

// For THIS capstone:

// KRISTIAN_TODO_NOW - Also, README and documentation are important!  Update them as I go along!

// KRISTIAN_TODO_NOW - Allow a text box where the user asks for clarification on an unknown word or phrase in the question.  In prompt-bedrock/*

// Future Work:
// KRISTIAN_TODO_PART_2 - What if the user answers in English or refuses to answer in Swedish?

// KRISTIAN_TODO_PART_2 - How do I go about the chat history?  Saving this for part 2... AFTER the springboard course.

// KRISTIAN_TODO_PART_2 - If I get more specific with my prompting, I risk a sending a LOT of tokens to Bedrock.
// And Bedrock costs $$$.
// Perhaps, I can have some code examine some hard and fast rules and help "cover" for Bedrock?
// For example, all nouns ending with "a" (eg. "lampa") have plural forms ending in "or" (eg. "lampor").
// Short-circuiting some model prediction with my own learnings in Swedish might be of some help.
// Save this for AFTER the springboard course.
