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
  open_dialog(dialog: MatDialog, dialog_title: string, results_to_display: any): MatDialogRef<ResultsViewerDialogComponent, string[]> {
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

  constructor (
    public dialog_ref: MatDialogRef<ResultsViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public result_data: any, // KRISTIAN_TODO_NOW - Make a REAL type for this thing....
  ) {
    // console.log (this.result_data); // KRISTIAN_NOTE - Uncomment to troubleshoot if dialog fails to display appropriate data.
  }

  check_result_type(result_body: any) {
    return typeof(result_body);
  }

  close_dialog (): void {
    this.dialog_ref.close();
  }
}