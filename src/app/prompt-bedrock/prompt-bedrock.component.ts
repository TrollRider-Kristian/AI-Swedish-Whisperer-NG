import { Component, Input, OnDestroy, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { client } from '../app.component';

export async function solicit_feedback_for_given_question_and_response (question: string, response: string, progress_spinner_flag: Subject<boolean>): Promise<string> {
  let prompt_with_response_awaiting_feedback = 'Given the question of: ' + question +
    ', please provide feedback in English to the spelling and grammatical mistakes of each word in the following ' +
    ' user response: ' + response;
    
  progress_spinner_flag.next(true);

  const { data, errors } = await client.queries.tutorSwedish({
    prompt: prompt_with_response_awaiting_feedback,
  });

  if (!errors) {
    // console.log (data); // KRISTIAN_NOTE - If the response doesn't populate correctly in the app, then troubleshoot this console log.
  } else {
    console.log(errors);
  }
  progress_spinner_flag.next(false);
  return data != null ? data as string : '';
}

@Component({
  selector: 'app-prompt-bedrock',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './prompt-bedrock.component.html',
  styleUrl: './prompt-bedrock.component.scss',
})
export class PromptBedrockComponent implements OnInit, OnDestroy {
  @Input({ required: true }) topic!: string | null;
  @Input({ required: false }) is_custom_user_question!: boolean | null;
  change_topic = output<void>();
  feedback_scoring_event = output<string | null>();
  current_question: string = '';
  user_response: string = '';
  feedback: string | null = null;
  private _feedback_is_loading_signal = new Subject <boolean>();
  feedback_is_loading: boolean = false;
  question_is_loading: boolean = false;

  gemma_question_for_test: string = '';
  palmyra_question_for_test: string = '';

  constructor () {
    // KRISTIAN_NOTE - takeUntilDestroyed works for a very common use case, where I want a component to receive signals until it's destroyed.
    // Simple way to prevent memory leaks.
    // https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed
    this._feedback_is_loading_signal.pipe (takeUntilDestroyed()).subscribe ((feedback_loading_state: boolean) => {
      this.feedback_is_loading = feedback_loading_state;
    });
  }

  // KRISTIAN_NOTE - Websocket connection to the URL on my amplify_outputs.json file failed because that URL does not exist anymore.
  // The amplify_outupts.json takes its url from the deployed Amplify app and is produced when I deploy said app.
  // This means that I will fail to receive a response every time I want to test locally unless/until I actually deploy my app.
  // That also means every other operation involving a connection to AWS (eg. prompting an AWS Bedrock LLM) will also fail unless I deploy the app.
  async ngOnInit(): Promise<void> {
    this.current_question = await this.pose_question_based_on_topic();
    this.gemma_question_for_test = await this.test_gemma_question_based_on_topic();
    this.palmyra_question_for_test = await this.test_palmyra_question_based_on_topic();
  }

  ngOnDestroy (): void {
    this._feedback_is_loading_signal.unsubscribe();
  }

  public get question_or_feedback_is_loading(): boolean {
    return this.question_is_loading === true || this.feedback_is_loading === true;
  }

  public get response_is_empty(): boolean {
    return this.user_response.length <= 0;
  }

  // Take the topic and request a question from the LLM as a prompt.
  async pose_question_based_on_topic (): Promise<string> {
    if (this.is_custom_user_question === true) {
      return typeof(this.topic) === 'string' ? this.topic : '';
    } else {
      this.question_is_loading = true;
      let prompt_to_ask = 'Please ask me a question in Swedish about: ' + this.topic + '.';
      if (this.user_response.length > 0) {
        prompt_to_ask += 'Please make this question a follow-up to our user\'s last response of: ' + this.user_response + '.';
        this.user_response = '';
      }

      // KRISTIAN_TODO_NOW - Do I throw an error if the user gives an empty response?  Accept the empty response, but warn the user that it's empty.
      const { data, errors } = await client.queries.tutorSwedish({
        prompt: prompt_to_ask,
      });

      if (!errors) {
        // console.log (data); // KRISTIAN_NOTE - If the response doesn't populate correctly in the app, then troubleshoot this console log.
      } else {
        console.log (errors);
      }
      this.question_is_loading = false;
      return data != null ? data as string : '';
    }
  }

  async test_gemma_question_based_on_topic (): Promise<string> {
    console.log (client);
    let prompt_to_ask = 'Please ask me a question in Swedish about: ' + this.topic + '.';
    const { data, errors } = await client.queries.gemmaSwedish({
      prompt: prompt_to_ask,
    });

    if (!errors) {
    } else {
      console.log (errors);
    }

    return data != null ? data : '';
  }

  async test_palmyra_question_based_on_topic (): Promise<string> {
    let prompt_to_ask = 'Please ask me a question in Swedish about: ' + this.topic + '.';
    const { data, errors } = await client.queries.palmyraSwedish({
      prompt: prompt_to_ask,
    });

    if (!errors) {
    } else {
      console.log (errors);
    }

    return data != null ? data : '';
  }

  async solicit_feedback_for_response (): Promise<void> {
    this.feedback = await solicit_feedback_for_given_question_and_response (this.current_question, this.user_response, this._feedback_is_loading_signal);
    // If feedback was successful, clear the user response.  Otherwise, save it so the user can try again without losing data.
    if (this.feedback?.length > 0) this.user_response = '';
  }

  public get split_feedback_into_bullet_points(): string[] | undefined {
    return this.feedback?.split (/\d+\./);
  }

  request_another_topic(): void {
    this.change_topic.emit();
  }

  direct_user_to_feedback_scoring_page(): void {
    this.feedback_scoring_event.emit(this.feedback);
  }
}
