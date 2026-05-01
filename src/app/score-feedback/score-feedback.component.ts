import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { client } from '../app.component';

export enum FEEDBACK_SCORING_METHOD {
    A_SINGLE_FEEDBACK,
    JSON_FILE_OF_FEEDBACK,
};

@Component({
  selector: 'score-feedback-component',
  templateUrl: 'score-feedback.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule,
  ],
})
export class ScoreFeedbackComponent {
    Feedback_Scoring_Method = FEEDBACK_SCORING_METHOD;
    current_method = FEEDBACK_SCORING_METHOD.A_SINGLE_FEEDBACK;
    @Input({ required: false }) user_provided_feedback: string = '';
    back_to_topic_page = output<void>();
    feedback_answer_key: string = '';
    feedback_score_is_loading: boolean = false;
    feedback_score: string | null = ''; // KRISTIAN_TODO - How to store the score in this component?

    constructor (private _http: HttpClient) {
      // KRISTIAN_TODO_NOW - Do I still need this http client?
      this._http.get ('../../assets/question-answer-feedback-test-data.json').subscribe (data => {
        console.log(data);
      });
    }

    feedback_and_answer_key_are_empty() {
      return this.user_provided_feedback?.length <= 0 || this.feedback_answer_key?.length <= 0;
    }

    async score_feedback(): Promise<void> {
        let prompt_with_feedback_pair_awaiting_score = "Given the AI-provided feedback of " + this.user_provided_feedback +
          " and the feedback answer key of " + this.feedback_answer_key + ", please provide a score of 1 to 10 to measure" +
          "the semantic accuracy of the given AI-provided feedback based upon the given feedback answer key.";
        
        this.feedback_score_is_loading = true;

        const {data, errors} = await client.queries.tutorSwedish({
          prompt: prompt_with_feedback_pair_awaiting_score,
        });

        if (!errors) {
          // KRISTIAN_TODO - How to store the score in this component?
          console.log (data);
          this.feedback_score = data;
          } else {
          console.log (errors);
        }
        this.feedback_score_is_loading = false;
    }

    on_json_file_uploaded (event: any) {
      // console.log (event?.target?.value); // KRISTIAN_NOTE - fakepath for security reasons... cannot read http from there...

      // KRISTIAN_TODO_NOW - Is any of this useful??
      // https://dev.to/mayvid14/file-uploads-in-angular-10-or-javascript-in-general-4g9p
      const file_reader = new FileReader();
      file_reader.onload = (reader_event: any) => {
        console.log (JSON.parse(reader_event?.target?.result)); // KRISTIAN_NOTE - It's beautiful!  THIS is what I want...
      };
      file_reader.readAsText (event.target.files[0]); // KRISTIAN_NOTE - Tada! We have a string of our contents.
    }

    redirect_user_to_topic_page(): void {
      this.back_to_topic_page.emit();
    }
}