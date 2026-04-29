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

1) KRISTIAN_TODO_NOW - What other options should I give the user with the score now that the dialog box is open?
2) KRISTIAN_TODO_NOW - How to do and view this for multiple statements?
3) KRISTIAN_TODO_NOW - When the feedback is copied automatically, should it be editable?  Yes.
   */

  // KRISTIAN_TODO_NOW - How do I score mutliple feedback statements at once?
  // KRISTIAN_TODO_NOW - The split feedback should ALSO populate the dialog box.
  // The same dialog box should have 2 options.  Either, "Give me a feedback answer key" OR "I have many feedback statements to grade at once.  This will be a wizard, in a way..."
  open_dialog(dialog: MatDialog, given_feedback: string[] | null): MatDialogRef<FeedbackComparisonDialogComponent, string[]> {
    return dialog.open (FeedbackComparisonDialogComponent, {
      data: given_feedback
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
      " and the feedback answer key of " + this.feedback_answer_key + ", please provide a score of 1 to 10 on how" +
      "semantically similar this pair of feedback statements are.";

    const {data, errors} = await client.queries.tutorSwedish({
      prompt: prompt_with_feedback_pair_awaiting_score,
    });

    if (!errors) {
      // KRISTIAN_TODO - How to store the score in the dialog?
      console.log (data);
      this.feedback_score = data;
    } else {
      console.log (errors);
    }
  }

  cancel_feedback (): void {
    this.dialog_ref.close();
  }
}