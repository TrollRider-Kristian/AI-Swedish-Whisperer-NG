import { CommonModule } from '@angular/common';
import { Component, inject, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ResultsViewerDialogService } from '../results-viewer-dialog/results-viewer-dialog.service';
import { solicit_feedback_for_given_question_and_response } from '../prompt-bedrock/prompt-bedrock.component';

export enum FEEDBACK_SCORING_METHOD {
    A_SINGLE_FEEDBACK,
    JSON_FILE_OF_FEEDBACK,
};

// KRISTIAN_TODO_PART_2 - Do we need this interface?  Or can we consolidate id with the other interface below?
export interface Question_Response_Feedback_Triplet {
  'id': number,
  'question': string;
  'response': string;
  'ai_feedback': string;
};

export interface Feedback_AnswerKey_Score_Quintuplet {
  'question': string,
  'response': string,
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
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
  ],
})
export class ScoreFeedbackComponent {
  @Input({ required: true }) current_tutor!: any;
  Feedback_Scoring_Method = FEEDBACK_SCORING_METHOD;
  current_method = FEEDBACK_SCORING_METHOD.A_SINGLE_FEEDBACK;
  back_to_topic_page = output<void>();
  
  // -------------------------------------------------- Inputs for scoring a single feedback statement --------------------------------------
  
  @Input({ required: false }) ai_generated_feedback: string = '';
  // KRISTIAN_NOTE - These need to be public because they're tied to ngModel in the html file.
  public feedback_answer_key: string = '';
  public feedback_score_is_loading: boolean = false;
  // ------------------------------------------------------------------
  private _feedback_score: string | null = '';
  public get feedback_score(): string | null {
    return this._feedback_score;
  }
  
  // -------------------------------------------------- Inputs for a JSON file full of feedback statements ----------------------------------
  
  private _uploaded_json_content: Question_Response_Feedback_Triplet[] | null = null;
  public get uploaded_json_content(): Question_Response_Feedback_Triplet[] | null {
    return this._uploaded_json_content;
  }
  private _current_filename: string | null = null;
  public get current_filename(): string | null {
    return this._current_filename;
  }
  private _json_feedback_statements: Question_Response_Feedback_Triplet[] | null = null;
  public get json_feedback_statements(): Question_Response_Feedback_Triplet[] | null {
    return this._json_feedback_statements;
  }
  private _feedback_generation_progress: number = 0;
  public get feedback_generation_progress(): number {
    return this._feedback_generation_progress;
  }
  private _json_scores_list: Feedback_AnswerKey_Score_Quintuplet[] | null = null;
  public get json_scores_list(): Feedback_AnswerKey_Score_Quintuplet[] | null {
    return this._json_scores_list;
  }
  private _scores_generation_progress: number = 0;
  public get scores_generation_progress(): number {
    return this._scores_generation_progress;
  }
  results_viewer_dialog_service = inject (ResultsViewerDialogService);
  
  // ----------------------------------------------------------------------------------------------------------------------------------------

  constructor (private _dialog: MatDialog) {}

  feedback_and_answer_key_are_empty() {
    return this.ai_generated_feedback?.length <= 0 || this.feedback_answer_key?.length <= 0;
  }

  async score_feedback(ai_generated_feedback: string, feedback_answer_key: string): Promise<string> {
      let prompt_with_feedback_pair_awaiting_score = "Given the AI-provided feedback of " + ai_generated_feedback +
        " and the feedback answer key of " + feedback_answer_key + ", please provide a score of 1 to 10 to measure" +
        " the semantic accuracy of the given AI-provided feedback based upon the given feedback answer key.  Please begin" +
        " the response immediately with the score before going into any reasons or justification.";
      
      this.feedback_score_is_loading = true;

      const {data, errors} = await this.current_tutor({
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
    this._feedback_score = await this.score_feedback (ai_generated_feedback, feedback_answer_key);
  }

  on_json_file_uploaded (event: any): void {
    // KRISTIAN_NOTE - In theory, one can obtain A filepath from event.target.value, BUT it is a fakepath for security reasons.
    // The simplest way I found to read the contents of an uploaded file is to call readAsText with JavaScript's own FileReader
    // and parse the raw string back into JSON. 
    // https://dev.to/mayvid14/file-uploads-in-angular-10-or-javascript-in-general-4g9p
    const file_reader = new FileReader();
    const file_reference = event?.target?.files[0];
    file_reader.onload = (reader_event: any) => {
      this._uploaded_json_content = JSON.parse (reader_event?.target?.result);
      this._current_filename = file_reference?.name;
    };
    file_reader.readAsText (file_reference);
  }

  open_uploaded_json_file_dialog (): void {
    this.results_viewer_dialog_service.open_dialog (this._dialog, "Uploaded JSON Test Data", this._uploaded_json_content);
  }

  // KRISTIAN_TODO_PART_2 - Improve the error handling by signaling to the user exactly which questions and responses are missing.
  // Display that on the screen.
  async give_feedback_for_json_file (): Promise<void> {
    let json_feedback_statements: Question_Response_Feedback_Triplet[] = [];
    this._feedback_generation_progress = 0;
    this._uploaded_json_content?.forEach (async (qaf: Question_Response_Feedback_Triplet, ix: number) => {
      const question = qaf['question'];
      const response = qaf['response'];
      if (question?.length > 0 && response?.length > 0) {
        const feedback: string = await solicit_feedback_for_given_question_and_response (this.current_tutor, question, response);
        // KRISTIAN_NOTE - Because the feedback statements from the LLM are asynchronous, the feedbacks are not being returned in the same order
        // as the questions and answers appeared in the original uploaded JSON file.  Therefore, we track the id here to guarantee the correctness
        // of the score_feedback_generated_list method below. 
        json_feedback_statements.push ({
          'id': ix,
          'question': qaf['question'],
          'response': qaf['response'],
          'ai_feedback': feedback,
        });
      } else {
        console.warn ("Either the question or the response is missing.  Please check #" + ix);
      }
      // If we reached this far, it's because we're looping inside _uploaded_json_content, so it exists and must have a length.
      this._feedback_generation_progress += 100 / (this._uploaded_json_content?.length as number);
    });
    this._json_feedback_statements = json_feedback_statements;
  }

  open_json_feedback_statements_dialog (): void {
    this.results_viewer_dialog_service.open_dialog (this._dialog, "LLM-Generated Feedback", this._json_feedback_statements);
  }

  // KRISTIAN_TODO_PART_2 - What if there's more ai feedback than feedback answers?  Display to the user a signal with a nice icon saying:
  // "X out of Y feedback statements had a feedback answer key and were graded successfully.  The rest are omitted."
  async score_feedback_generated_list(): Promise<void> {
    let scores: Feedback_AnswerKey_Score_Quintuplet[] = [];
    this._scores_generation_progress = 0;
    this._json_feedback_statements?.forEach (async (qaf: Question_Response_Feedback_Triplet) => {
      let ai_feedback = qaf['ai_feedback'];
      // KRISTIAN_NOTE - Now, we look to the original _json_feedback_statements to get the feedback answer key and ask for a score.
      // Because the _json_feedback_statements were obtained asynchronously, we need to check the _json_feedback_statements
      // for the index of the original content to match the correct feedback statement with the correct feedback answer key.
      let feedback_answer: string = '';
      let corresponding_ix = qaf['id'];
      feedback_answer = (this._uploaded_json_content as Question_Response_Feedback_Triplet[])[corresponding_ix]['ai_feedback'];
      if (ai_feedback?.length > 0 && feedback_answer?.length > 0) {
        const score = await this.score_feedback (ai_feedback, feedback_answer);
        scores.push ({
          'question': qaf['question'],
          'response': qaf['response'],
          'ai_feedback': ai_feedback,
          'answer_key': feedback_answer,
          'score': score,
        });
      }
      // KRISTIAN_NOTE - If we reached this far, it's because we're looping inside _json_feedback_statements, so it exists and must have a length.
      this._scores_generation_progress += 100 / (this._json_feedback_statements?.length as number);
    });
    this._json_scores_list = scores;
  }

  // KRISTIAN_NOTE - Match returns a custom object.  The inner string of the match itself lives at index 0, according to this:
  // https://stackoverflow.com/questions/77627985/how-to-convert-array-like-object-stringmatch-result-to-array-in-typescript
  parse_numeric_scores_from_scores_list(): number[] {
    let numeric_scores: number[] = [];
    this._json_scores_list?.forEach ((quintuplet: Feedback_AnswerKey_Score_Quintuplet) => {
      const score_statement: string = quintuplet?.score != null ? quintuplet.score : '';
      const match = score_statement.match(/\d+.\d*/);
      const num_score = parseFloat(match != null ? match[0] : '');
      numeric_scores.push(num_score);
    })
    return numeric_scores;
  }

  open_json_scores_list_dialog (): void {
    this.results_viewer_dialog_service.open_dialog (
      this._dialog,
      "Scores for LLM-Generated Feedback",
      this._json_scores_list,
      this.parse_numeric_scores_from_scores_list(),
    );
  }

  redirect_user_to_topic_page(): void {
    this.back_to_topic_page.emit();
  }
}