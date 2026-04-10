import { CommonModule } from '@angular/common';
import { Component, Inject, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { client } from '../prompt-bedrock/prompt-bedrock.component';

@Injectable({ providedIn: 'root' })
export class FeedbackComparisonDialogService {
  /**
-- REMAINING TODOs --

1) What other options should I give the user with the score now that the dialog box is open?
2) How to do and view this for multiple statements?
3) When the feedback is copied manually, should it be editable?  Or do I give an "Undo and Give Manual Feedback" button?
   */

  // KRISTIAN_TODO - How do I score mutliple feedback statements at once?
  // KRISTIAN_TODO - The split feedback should ALSO populate the dialog box.
  open_dialog(dialog: MatDialog, given_feedback: string[] | null): MatDialogRef<FeedbackComparisonDialogComponent, string[]> {
    return dialog.open (FeedbackComparisonDialogComponent, { // KRISTIAN_TODO - Import the component, and provide service?
      data: given_feedback // KRISTIAN_TODO - give feedback here versus give nothing in the topic-select component
    });
  }
}

@Component({
  selector: 'feedback-comparison-dialog-component',
  templateUrl: 'feedback-comparison-dialog-component.component.html',
  standalone: true,
  imports: [
    CommonModule,
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
  user_provided_feedback_from_previous_conversation: string = '';
  feedback_answer_key: string = '';
  feedback_score: string | null = ''; // KRISTIAN_TODO - How to store the score in the dialog?
  constructor (
    public dialog_ref: MatDialogRef<FeedbackComparisonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public ai_provided_feedback: string[] | null,
  ) {}

  async score_feedback(): Promise<void> {
    let prompt_with_feedback_pair_awaiting_score = "Given the AI-provided feedback of " + this.ai_provided_feedback +
      " and the feedback answer key of " + this.feedback_answer_key + ", please prodivde a score of 1 to 10 on how" +
      "semantically similar this pair of feedback statements are.";

    const {data, errors} = await client.queries.tutorSwedish({
      prompt: prompt_with_feedback_pair_awaiting_score,
    });

    if (!errors) {
      console.log (data); // KRISTIAN_TODO - How to store the score in the dialog?
      this.feedback_score = data;
    } else {
      console.log (errors);
    }
  }

  // KRISTIAN_TODO - For each statement I've provided in my swedish sentences, provide a question and an incorrect version of that
  // same statement.  For each question I've provided in my swedish sentences, provide two answers: one correct and one incorrect
  // Use ChatGPT to grade them.  Should have 150 total in one night.

  cancel_feedback (): void {
    this.dialog_ref.close();
  }
}