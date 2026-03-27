import { Component, Inject, Input, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  // MatDialogClose,
} from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

// https://www.thirdrocktechkno.com/blog/how-to-read-local-json-files-in-angular/
// KRISTIAN_NOTE - Because I have "resolveJsonModule" set to "true" in tsconfig.json, I can just import.
// If I didn't, then I'd inject an HttpClientModule into the desired component and subscribe to it to receive json data.
// KRISTIAN_TODO - Trying the Http Client route now, but WHY doesn't this print anything in ngOnInit?
// Does it need to be saved in a variable first?  Is it too early in the Angular lifecycle?
import * as question_answer_feedback_dataset from '../../assets/question-answer-feedback-test-data.json';

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

  constructor (private _http: HttpClient, public dialog: MatDialog) {}

  // KRISTIAN_NOTE - Websocket connection to the URL on my amplify_outputs.json file failed because that URL does not exist anymore.
  // The amplify_outupts.json takes its url from the deployed Amplify app and is produced when I deploy said app.
  // This means that I will fail to receive a response every time I want to test locally unless/until I actually deploy my app.
  // That also means every other operation involving a connection to AWS (eg. prompting an AWS Bedrock LLM) will also fail unless I deploy the app.
  ngOnInit() {
    this.pose_question_based_on_topic(); // send prompt for initial question
    this._http.get ('../../assets/question-answer-feedback-test-data.json').subscribe (data => {
      console.log(data); // KRISTIAN_NOTE - Ah, so THIS one works...
    });
  }

  // Take the topic and request a question from the LLM as a prompt.
  async pose_question_based_on_topic () {
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

  // KRISTIAN_TODO - How do I call this to test any question and answer pair?
  // Do I support another component and call from the outside?
  // Do I support loading question-answer pairs from file and print out a list of feedbacks?
  // How to go about this in my app? 
  async solicit_feedback_for_given_question_and_response (question: string, response: string) {
    let prompt_with_response = 'Given the question of: ' + question +
      ', please provide feedback in English to the spelling and grammatical mistakes of each word in the following ' +
      ' user response: ' + response + ', and generate a list of keywords for the linguistic concepts discussed by the feedback.';
      
    this.feedback_is_loading = true;

    const { data, errors } = await client.queries.tutorSwedish({
      prompt: prompt_with_response,
    });

    if (!errors) {
      console.log (data); // KRISTIAN_NOTE - If the response doesn't populate correctly in the app, then troubleshoot this console log.
      this.feedback = data;
      let feedback_points = data?.split ('###') // need a regex for splitting all the bullet points
      console.log (feedback_points);
      this.user_response = '';
    } else {
      console.log(errors);
    }
    this.feedback_is_loading = false;
  }

  async solicit_feedback_for_response () {
    this.solicit_feedback_for_given_question_and_response (this.current_question, this.user_response);
  }

  request_another_topic() {
    this.change_topic.emit();
  }

  async open_feedback_comparison_dialog_box() {
    const dialog_ref = this.dialog.open (FeedbackComparisonDialogComponent, {
      data: this.feedback
    });
  }
}

@Component({
  selector: 'feedback-comparison-dialog-component',
  templateUrl: 'feedback-comparison-dialog-component.component.html',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogContent,
    MatDialogActions,
    // MatDialogClose,
  ],
})
export class FeedbackComparisonDialogComponent {
  feedback_answer_key: string = '';
  constructor (
    public dialog_ref: MatDialogRef<FeedbackComparisonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public ai_provided_feedback: string,
  ) {}

  score_feedback(): void {
    // KRISTIAN_TODO - Make scoring prompt here.
    this.dialog_ref.close();
  }

  cancel_feedback (): void {
    this.dialog_ref.close();
  }
}
