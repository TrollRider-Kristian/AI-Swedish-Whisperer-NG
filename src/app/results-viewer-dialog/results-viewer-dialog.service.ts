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
import { MatRadioModule } from '@angular/material/radio';

@Injectable({ providedIn: 'root' })
export class ResultsViewerDialogService {
  /**

1) KRISTIAN_TODO_NOW - What other options should I give the user with the score now that the dialog box is open?
2) KRISTIAN_TODO_NOW - How to do and view this for multiple statements?
3) KRISTIAN_TODO_NOW - When the feedback is copied automatically, should it be editable?  Yes.
   */

  // KRISTIAN_TODO_NOW - How do I score mutliple feedback statements at once?
  // KRISTIAN_TODO_NOW - The split feedback should ALSO populate the dialog box.
  // The same dialog box should have 2 options.  Either, "Give me a feedback answer key" OR "I have many feedback statements to grade at once.  This will be a wizard, in a way..."
  open_dialog(dialog: MatDialog, results_to_display: any): MatDialogRef<ResultsViewerDialogComponent, string[]> {
    return dialog.open (ResultsViewerDialogComponent, {
      data: results_to_display, // KRISTIAN_TODO_NOW - HINT: modify this function to make the triplets convenient...
    });
  }
}

@Component({
  selector: 'results-viewer-dialog',
  templateUrl: 'results-viewer-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatRadioModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogContent,
    MatDialogActions,
    // MatDialogClose,
  ],
})
export class ResultsViewerDialogComponent {

  constructor (
    public dialog_ref: MatDialogRef<ResultsViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public result_data: any, // KRISTIAN_TODO_NOW - Make a REAL type for this thing....
  ) {
    // console.log (this.result_data);
  }

  close_dialog (): void {
    this.dialog_ref.close();
  }
}