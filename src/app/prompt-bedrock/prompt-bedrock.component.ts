import { Component, inject, Input, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { FeedbackComparisonDialogService } from '../feedback-comparison-dialog/feedback-comparison-dialog-service.service';

const client = generateClient<Schema>();

@Component({
  selector: 'app-prompt-bedrock',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './prompt-bedrock.component.html',
  styleUrl: './prompt-bedrock.component.scss',
})
export class PromptBedrockComponent implements OnInit {
  @Input({ required: true }) topic!: string | null;
  @Input({ required: false }) is_custom_user_question!: boolean | null;
  change_topic = output<void>();
  current_question: string = '';
  user_response: string = '';
  feedback: string | null = null;
  feedback_is_loading: boolean = false;
  question_is_loading: boolean = false;
  feedback_comparison_dialog_service = inject (FeedbackComparisonDialogService);

  constructor (private _http: HttpClient, private _dialog: MatDialog) {}

  // KRISTIAN_NOTE - Websocket connection to the URL on my amplify_outputs.json file failed because that URL does not exist anymore.
  // The amplify_outupts.json takes its url from the deployed Amplify app and is produced when I deploy said app.
  // This means that I will fail to receive a response every time I want to test locally unless/until I actually deploy my app.
  // That also means every other operation involving a connection to AWS (eg. prompting an AWS Bedrock LLM) will also fail unless I deploy the app.
  ngOnInit(): void {
    this.pose_question_based_on_topic(); // send prompt for initial question
    this._http.get ('../../assets/question-answer-feedback-test-data.json').subscribe (data => {
      console.log(data); // KRISTIAN_NOTE - Ah, so THIS one works...
    });
  }

  // Take the topic and request a question from the LLM as a prompt.
  async pose_question_based_on_topic (): Promise<void> {
    this.question_is_loading = true;

    if (this.is_custom_user_question === true) {
      this.current_question = typeof(this.topic) === 'string' ? this.topic : '';
    } else {
      let prompt_to_ask = 'Please ask me a question in Swedish about: ' + this.topic + '.';
      if (this.user_response.length > 0) {
        prompt_to_ask += 'Please make this question a follow-up to our user\'s last response of: ' + this.user_response + '.';
        this.user_response = '';
      }

      // KRISTIAN_TODO - Do I throw an error if the user gives an empty response?  Leaning towards no for now...
      const { data, errors } = await client.queries.tutorSwedish({
        prompt: prompt_to_ask,
      });

      if (!errors) {
        console.log (data); // KRISTIAN_NOTE - If the response doesn't populate correctly in the app, then troubleshoot this console log.
        this.current_question = data !== null ? data : '';
      } else {
        console.log (errors);
      }
    }

    this.question_is_loading = false;
  }

  async solicit_feedback_for_given_question_and_response (question: string, response: string): Promise<void> {
    let prompt_with_response = 'Given the question of: ' + question +
      ', please provide feedback in English to the spelling and grammatical mistakes of each word in the following ' +
      ' user response: ' + response + ', and generate a list of keywords for the linguistic concepts discussed by the feedback.';
      
    this.feedback_is_loading = true;

    const { data, errors } = await client.queries.tutorSwedish({
      prompt: prompt_with_response,
    });

    if (!errors) {
      // console.log (data); // KRISTIAN_NOTE - If the response doesn't populate correctly in the app, then troubleshoot this console log.
      this.feedback = data;
      this.user_response = '';
    } else {
      console.log(errors);
    }
    this.feedback_is_loading = false;
  }

  async solicit_feedback_for_response (): Promise<void> {
    this.solicit_feedback_for_given_question_and_response (this.current_question, this.user_response);
  }

  public get split_feedback_into_bullet_points(): string[] | undefined {
    return this.feedback?.split (/\d+\./);
  }

  request_another_topic(): void {
    this.change_topic.emit();
  }

  // KRISTIAN_TODO - What if the user gets a question and asks for feedback BEFORE typing in an answer?
  open_feedback_comparison_dialog_box(): void {
    this.feedback_comparison_dialog_service.open_dialog (this._dialog, this.split_feedback_into_bullet_points as string[]);
  }
}


