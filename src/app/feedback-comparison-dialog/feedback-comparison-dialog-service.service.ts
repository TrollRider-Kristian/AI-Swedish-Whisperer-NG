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

@Injectable({ providedIn: 'root' })
export class FeedbackComparisonDialogService {
    /**
     * KRISTIAN_TODO - My approach to comparing two pieces of feedback!
     * 
   * I open the dialog box from either page.
How to represent this?  A button?  An icon?

-- OPEN DIALOG --  USE THIS SERVICE!
	from the topic select page...
"I already have feedback from a past conversation!"

I enter some feedback manually

	from the prompt page...
"Score my Most Recent Feedback!"

it gets copied automatically from feedback I generated from an answer

-- IN THE DIALOG BOX --

"Feedback Received" -> either manual or automatic

"Correct Feedback Statement" -> I enter a comparing feedback.

"Get Grade" -> I click, my code sends a scoring prompt, and I view the number

Rename "Cancel" to "Close"

-- REMAINING TODOs --

1) What other options should I give the user with the score now that the dialog box is open?
2) How to do and view this for multiple statements?
3) When the feedback is copied manually, should it be editable?  Or do I give an "Undo and Give Manual Feedback" button?

   */

  // KRISTIAN_TODO - How do I score mutliple feedback statements at once?
  // KRISTIAN_TODO - The split feedback should ALSO populate the dialog box.
  open_dialog(dialog: MatDialog, given_feedback: string): MatDialogRef<FeedbackComparisonDialogComponent, string> {
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
    // Given the AI-provided feedback of {ai_provided_feedback} and the feedback answer key of {feedback_answer_key}
    // please provide a score of 1 - 10 on how semantically similar this pair of feedback statements are.
    this.dialog_ref.close();
  }

  // KRISTIAN_TODO - For each statement I've provided in my swedish sentences, provide a question and an incorrect version of that
  // same statement.  For each question I've provided in my swedish sentences, provide two answers: one correct and one incorrect
  // Use ChatGPT to grade them.  Should have 150 total in one night.

  cancel_feedback (): void {
    this.dialog_ref.close();
  }
}