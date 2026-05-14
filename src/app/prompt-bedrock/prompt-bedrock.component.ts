import { Component, Input, OnDestroy, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';

// KRISTIAN_TODO_PART_2 - What if the user answers in English or refuses to answer in Swedish?
export async function solicit_feedback_for_given_question_and_response (
    tutor_func: (param_0: {prompt: string}) => any | null,
    question: string,
    response: string,
    progress_spinner_flag?: Subject<boolean>
  ): Promise<string> {

  let prompt_with_response_awaiting_feedback = 'Given the question of: ' + question +
    ', please provide feedback in English to the spelling and grammatical mistakes of each word in the following ' +
    ' user response: ' + response;
    
  progress_spinner_flag?.next(true);

  let return_data = null;
  if (tutor_func != null) {
    const { data, errors } = await tutor_func({
      prompt: prompt_with_response_awaiting_feedback,
  });

  if (!errors) {
    // console.log (data); // KRISTIAN_NOTE - If the response doesn't populate correctly in the app, then troubleshoot this console log.
    return_data = data;
  } else {
    console.log(errors);
  }
  } else {
    console.warn ('No tutor function specified.  Unable to do anything.');
  }

  progress_spinner_flag?.next(false);
  return return_data != null ? return_data as string : '';
}

@Component({
  selector: 'app-prompt-bedrock',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './prompt-bedrock.component.html',
  styleUrl: './prompt-bedrock.component.scss',
})
export class PromptBedrockComponent implements OnInit, OnDestroy {
  @Input({ required: true }) current_tutor!: any;
  @Input({ required: true }) topic!: string | null;
  @Input({ required: false }) is_custom_user_question!: boolean | null;
  change_topic = output<void>();
  feedback_scoring_event = output<string | null>();

  private _question_is_loading: boolean = false;
  public get question_is_loading(): boolean {
    return this._question_is_loading;
  }
  private _current_question: string = '';
  public get current_question(): string {
    return this._current_question;
  }
  private _clarification_is_loading: boolean = false;
  public get clarification_is_loading(): boolean {
    return this._clarification_is_loading;
  }
  // KRISTIAN_NOTE - These need to be public because they're tied to ngModel in the html file.
  public unknown_word_or_phrase: string = '';
  public user_response: string = '';
  // ------------------------------------------------------------------
  private _clarification_response: string = '';
  public get clarification_response(): string {
    return this._clarification_response;
  }
  private _feedback_is_loading_signal = new Subject <boolean>();
  private _feedback_is_loading: boolean = false;
  public get feedback_is_loading(): boolean {
    return this._feedback_is_loading;
  }
  private _feedback: string | null = null;
  public get feedback(): string | null {
    return this._feedback;
  }

  constructor () {
    // KRISTIAN_NOTE - takeUntilDestroyed works for a very common use case, where I want a component to receive signals until it's destroyed.
    // Simple way to prevent memory leaks.
    // https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed
    this._feedback_is_loading_signal.pipe (takeUntilDestroyed()).subscribe ((feedback_loading_state: boolean) => {
      this._feedback_is_loading = feedback_loading_state;
    });
  }

  // KRISTIAN_NOTE - Websocket connection to the URL on my amplify_outputs.json file failed because that URL does not exist anymore.
  // The amplify_outupts.json takes its url from the deployed Amplify app and is produced when I deploy said app.
  // This means that I will fail to receive a response every time I want to test locally unless/until I actually deploy my app.
  // That also means every other operation involving a connection to AWS (eg. prompting an AWS Bedrock LLM) will also fail unless I deploy the app.
  async ngOnInit(): Promise<void> {
    this._current_question = await this.pose_question_based_on_topic();
  }

  ngOnDestroy (): void {
    this._feedback_is_loading_signal.unsubscribe();
  }

  public get question_or_feedback_is_loading(): boolean {
    return this._question_is_loading === true || this._feedback_is_loading === true;
  }

  public get response_is_empty(): boolean {
    return this.user_response.length <= 0;
  }

  // Take the topic and request a question from the LLM as a prompt.
  // KRISTIAN_TODO_PART_2 - Consider a "chat history" of the conversation between user and LLM thus far.  Have a way to track common user errors and allow
  // the system to prompt the user with more focused questions to shore up specific weaknesses (eg. prepositions).
  async pose_question_based_on_topic (): Promise<string> {
    if (this.is_custom_user_question === true) {
      return typeof(this.topic) === 'string' ? this.topic : '';
    } else {
      this._question_is_loading = true;
      let prompt_to_ask = 'Please ask me a question in Swedish about: ' + this.topic + '.';
      if (this.user_response.length > 0) {
        prompt_to_ask += 'Please ask me a follow-up question based upon the most recent of: ' + this.user_response + '.';
        this.user_response = '';
      }

      const { data, errors } = await this.current_tutor({
        prompt: prompt_to_ask,
      });

      if (!errors) {
        // console.log (data); // KRISTIAN_NOTE - If the response doesn't populate correctly in the app, then troubleshoot this console log.
      } else {
        console.log (errors);
      }
      this._question_is_loading = false;
      return data != null ? data as string : '';
    }
  }

  // KRISTIAN_TODO_PART_2 - Is there a way to cap the number of characters on a response to a given prompt in an asynchronous LLM prompting function?
  async ask_clarification_on_word_or_phrase (): Promise<string> {
    this._clarification_is_loading = true;
    let prompt_to_ask = 'Please translate to English the following unknown Swedish word or phrase: ' + this.unknown_word_or_phrase + '.';
    const { data, errors } = await this.current_tutor({
      prompt: prompt_to_ask,
    });

    if (errors) {
      console.log (errors);
    }
    this._clarification_is_loading = false;
    return data != null ? data as string : '';
  }

  async submit_clarification_question(): Promise<void> {
    this._clarification_response = await this.ask_clarification_on_word_or_phrase();
  }

  async solicit_feedback_for_response (): Promise<void> {
    this._feedback = await solicit_feedback_for_given_question_and_response (this.current_tutor, this._current_question, this.user_response, this._feedback_is_loading_signal);
    // If feedback was successful, clear the user response.  Otherwise, save it so the user can try again without losing data.
    if (this._feedback?.length > 0) this.user_response = '';
  }

  public get split_feedback_into_bullet_points(): string[] | undefined {
    return this._feedback?.split (/\d+\./);
  }

  async request_follow_up_question(): Promise<void> {
    this._current_question = await this.pose_question_based_on_topic();
  }

  request_another_topic(): void {
    this.change_topic.emit();
  }

  direct_user_to_feedback_scoring_page(): void {
    this.feedback_scoring_event.emit(this._feedback);
  }
}
