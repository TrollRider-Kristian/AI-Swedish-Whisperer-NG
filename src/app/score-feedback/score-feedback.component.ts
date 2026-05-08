import { CommonModule } from '@angular/common';
import { Component, inject, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { client } from '../app.component';
import { ResultsViewerDialogService } from '../results-viewer-dialog/results-viewer-dialog.service';
import { solicit_feedback_for_given_question_and_response } from '../prompt-bedrock/prompt-bedrock.component';
import { Subject } from 'rxjs';

export enum FEEDBACK_SCORING_METHOD {
    A_SINGLE_FEEDBACK,
    JSON_FILE_OF_FEEDBACK,
};

export interface Question_Response_Feedback_Triplet {
  'question': string;
  'response': string;
  'ai_feedback': string;
};

export interface Feedback_AnswerKey_Score_Triplet {
  'ai_feedback': string;
  'answer_key': string;
  'score': string;
}

@Component({
  selector: 'score-feedback-component',
  templateUrl: 'score-feedback.component.html',
  styleUrl: 'score-feedback.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule,
  ],
})
export class ScoreFeedbackComponent {
    Feedback_Scoring_Method = FEEDBACK_SCORING_METHOD;
    current_method = FEEDBACK_SCORING_METHOD.A_SINGLE_FEEDBACK;
    @Input({ required: false }) ai_generated_feedback: string = '';
    back_to_topic_page = output<void>();
    private _ai_feedback_is_loading_signal = new Subject<boolean>(); // KRISTIAN_TODO_NOW - Use this as a progress signifier to how many feedback statements are generated.
    feedback_answer_key: string = '';
    feedback_score_is_loading: boolean = false;
    feedback_score: string | null = '';
    private _uploaded_json_content: Question_Response_Feedback_Triplet[] | null = null;
    public get uploaded_json_content(): Question_Response_Feedback_Triplet[] | null {
      return this._uploaded_json_content;
    }
    private _json_feedback_statements: Question_Response_Feedback_Triplet[] | null = null;
    public get json_feedback_statements(): Question_Response_Feedback_Triplet[] | null {
      return this._json_feedback_statements;
    }
    private _json_scores_list: Feedback_AnswerKey_Score_Triplet[] | null = null;
    public get json_scores_list(): Feedback_AnswerKey_Score_Triplet[] | null {
      return this._json_scores_list;
    }
    results_viewer_dialog_service = inject (ResultsViewerDialogService);

    constructor (private _dialog: MatDialog) {}

    feedback_and_answer_key_are_empty() {
      return this.ai_generated_feedback?.length <= 0 || this.feedback_answer_key?.length <= 0;
    }

    async score_feedback(ai_generated_feedback: string, feedback_answer_key: string): Promise<string> {
        let prompt_with_feedback_pair_awaiting_score = "Given the AI-provided feedback of " + ai_generated_feedback +
          " and the feedback answer key of " + feedback_answer_key + ", please provide a score of 1 to 10 to measure" +
          "the semantic accuracy of the given AI-provided feedback based upon the given feedback answer key.";
        
        this.feedback_score_is_loading = true;

        const {data, errors} = await client.queries.tutorSwedish({
          prompt: prompt_with_feedback_pair_awaiting_score,
        });

        if (!errors) {
          // console.log (data);
          } else {
          console.log (errors);
        }
        this.feedback_score_is_loading = false;
        return data != null ? data : '';
    }

    async set_feedback_score (ai_generated_feedback: string, feedback_answer_key: string) {
      this.feedback_score = await this.score_feedback (ai_generated_feedback, feedback_answer_key);
    }

    on_json_file_uploaded (event: any): void {
      // KRISTIAN_NOTE - In theory, one can obtain A filepath from event.target.value, BUT it is a fakepath for security reasons.
      // The simplest way I found to read the contents of an uploaded file is to call readAsText with JavaScript's own FileReader
      // and parse the raw string back into JSON. 
      // https://dev.to/mayvid14/file-uploads-in-angular-10-or-javascript-in-general-4g9p
      const file_reader = new FileReader();
      file_reader.onload = (reader_event: any) => {
        this._uploaded_json_content = JSON.parse (reader_event?.target?.result);
      };
      file_reader.readAsText (event?.target?.files[0]);
    }

    open_uploaded_json_file_dialog (): void {
      this.results_viewer_dialog_service.open_dialog (this._dialog, "Uploaded JSON Test Data", this._uploaded_json_content);
    }

    async give_feedback_for_json_file (): Promise<void> {
      let json_feedback_statements: Question_Response_Feedback_Triplet[] = [];
      this._uploaded_json_content?.forEach (async (qaf: Question_Response_Feedback_Triplet, ix: number) => {
        const question = qaf['question'];
        const response = qaf['response'];
        // KRISTIAN_TODO_PART_2 - Improve the error handling by signaling to the user exactly which questions and responses are missing.
        // Display that on the screen.
        if (question?.length > 0 && response?.length > 0) {
          const feedback: string = await solicit_feedback_for_given_question_and_response (question, response, this._ai_feedback_is_loading_signal);
          json_feedback_statements.push ({
            'question': qaf['question'],
            'response': qaf['response'],
            'ai_feedback': feedback,
          });
        } else {
          console.warn ("Either the question or the response is missing.  Please check #" + ix);
        }
      });
      this._json_feedback_statements = json_feedback_statements;
    }

    open_json_feedback_statements_dialog (): void {
      this.results_viewer_dialog_service.open_dialog (this._dialog, "LLM-Generated Feedback", this._json_feedback_statements);
    }

    async score_feedback_generated_list(): Promise<void> {
      let scores: Feedback_AnswerKey_Score_Triplet[] = [];
      this._uploaded_json_content?.forEach (async (qaf: Question_Response_Feedback_Triplet, ix: number) => {
        // KRISTIAN_TODO_PART_2 - What if there's more ai feedback than feedback answers?  Display to the user a signal with a nice icon saying:
        // "X out of Y feedback statements had a feedback answer key and were graded successfully.  The rest are omitted."
        const check_json_line = this._json_feedback_statements as Question_Response_Feedback_Triplet[];
        const json_line = check_json_line[ix] != null ? (check_json_line)[ix] : '';
        let ai_feedback;
        if (json_line !== '') {
          const json_line_as_triplet = json_line as Question_Response_Feedback_Triplet;
          if (json_line_as_triplet['ai_feedback'] != null) {
            ai_feedback = json_line_as_triplet['ai_feedback'];
          }
        }
        const feedback_answer = qaf == null ? '' : (qaf as Question_Response_Feedback_Triplet)['ai_feedback'];
        const score = await this.score_feedback (ai_feedback as string, feedback_answer);
        // KRISTIAN_TODO_NOW - Scores aren't coming in order since it's async.  Buuuut, is that ok anyway as long as the ai_feedback and the feedback_answer_key
        // correspond to the correct score?
        scores.push ({
          'ai_feedback': ai_feedback as string,
          'answer_key': feedback_answer,
          'score': score,
        });
      });
      this._json_scores_list = scores;
    }

    open_json_scores_list_dialog (): void {
      this.results_viewer_dialog_service.open_dialog (this._dialog, "Scores for LLM-Generated Feedback", this._json_scores_list);
    }

    redirect_user_to_topic_page(): void {
      this.back_to_topic_page.emit();
    }
}