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
  open_dialog(dialog: MatDialog, results_to_display: any): MatDialogRef<ResultsViewerDialogComponent, string[]> {
    return dialog.open (ResultsViewerDialogComponent, {
      // KRISTIAN_TODO_NOW - Make this a JSON object.  It should pass the type of results, which is fashioned into a title and dictates the result dialog's formatting.
      data: results_to_display,
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
    console.log (this.result_data);
  }

  check_result_type(result: any) {
    return typeof(result);
  }

  close_dialog (): void {
    this.dialog_ref.close();
  }
}