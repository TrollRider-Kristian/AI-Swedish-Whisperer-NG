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
import { Question_Response_Feedback_Triplet, Feedback_AnswerKey_Score_Quintuplet } from '../score-feedback/score-feedback.component';

@Injectable({ providedIn: 'root' })
export class ResultsViewerDialogService {
  open_dialog(
      dialog: MatDialog, 
      dialog_title: string, 
      results_to_display: Question_Response_Feedback_Triplet[] | Feedback_AnswerKey_Score_Quintuplet[] | null
    ): MatDialogRef<ResultsViewerDialogComponent, string[]> {
      return dialog.open (ResultsViewerDialogComponent, {
        data: { 
          'title': dialog_title,
          'body': results_to_display,
        }
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

  // KRISTIAN_NOTE - I wanted the result_data to be of a union type allowing either Question_Response_Feedback_Triplet or Feedback_AnswerKey_Score_Quintuplet.
  // However, that messes up the HTML's null checking and throws type errors because two fields in Feedback_AnswerKey_Score_Quintuplet do not exist in
  // Question_Response_Feedback_Triplet.  However, we still need to accept Question_Response_Feedback_Triplet, and fields common to both object types
  // are stored here anyway.  Therefore, as non-ideal as this typing is, it works and I like it better than just casting body as 'any'.
  constructor (
    public dialog_ref: MatDialogRef<ResultsViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public result_data: {title: string, body: Feedback_AnswerKey_Score_Quintuplet[] | null},
  ) {
    // console.log (this.result_data); // KRISTIAN_NOTE - Uncomment to troubleshoot if dialog fails to display appropriate data.
  }

  check_result_type(result_body: {title: string, body: Feedback_AnswerKey_Score_Quintuplet[] | null}) {
    return typeof(result_body);
  }

  close_dialog (): void {
    this.dialog_ref.close();
  }
}