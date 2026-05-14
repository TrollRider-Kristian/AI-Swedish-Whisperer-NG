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
    MatDialogClose,
} from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { Question_Response_Feedback_Triplet, Feedback_AnswerKey_Score_Quintuplet } from '../score-feedback/score-feedback.component';

@Injectable({ providedIn: 'root' })
export class ResultsViewerDialogService {
  open_dialog(
      dialog: MatDialog, 
      dialog_title: string, 
      results_to_display: Question_Response_Feedback_Triplet[] | Feedback_AnswerKey_Score_Quintuplet[] | null,
      stats?: number[],
    ): MatDialogRef<ResultsViewerDialogComponent, string[]> {
      return dialog.open (ResultsViewerDialogComponent, {
        data: { 
          'title': dialog_title,
          'body': results_to_display,
          'stats': stats,
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
    MatDialogClose,
  ],
})
export class ResultsViewerDialogComponent {

  // KRISTIAN_NOTE - I wanted the result_data to be of a union type allowing either Question_Response_Feedback_Triplet or Feedback_AnswerKey_Score_Quintuplet.
  // However, that messes up the HTML's null checking and throws type errors because two fields in Feedback_AnswerKey_Score_Quintuplet do not exist in
  // Question_Response_Feedback_Triplet.  However, we still need to accept Question_Response_Feedback_Triplet, and fields common to both object types
  // are stored here anyway.  Therefore, as non-ideal as this typing is, it works and I like it better than just casting body as 'any'.
  constructor (
    public dialog_ref: MatDialogRef<ResultsViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public result_data: {title: string, body: Feedback_AnswerKey_Score_Quintuplet[] | null, stats: number[]},
  ) {
    // console.log (this.result_data); // KRISTIAN_NOTE - Uncomment to troubleshoot if dialog fails to display appropriate data.
    // KRISTIAN_TODO_PART_2 - I would prefer to use toSorted, but that requires es2023 or later on my JavaScript compiler version.  Look into how I can upgrade that.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted
    // For now, it doesn't really matter to the functions below whether the array is sorted, so we'll just sort it for now...
    if (this.result_data?.stats != null) {
      this.result_data.stats.sort((a, b) => a - b);
    }
  }

  check_result_type(result_body: {title: string, body: Feedback_AnswerKey_Score_Quintuplet[] | null}) {
    return typeof(result_body);
  }

  // KRISTIAN_NOTE - It's worth mentioning that mathjs supports mean, median, and standard deviation out of the box, but installing that dependency
  // causes the memory bundle of this app to exceed the maximum budget by an amount high enough to cause an error when I attempt 'npm run build'.
  // I could increase the budget, but I'd rather keep the bundle small, especially considering that library is designed primarily for JavaScript.
  // TypeScript comes with enough Math operations of its own that makes it easy enough to code these here.
  // KRISTIAN_TODO_PART_2 - If the need arises for more sophisticated math (eg. "I'm creating my own LLM and I need a derivative function"), then
  // consider installing mathjs and increasing the memory budget.

  calc_mean_of_stats(): number | null {
    if (this.result_data?.stats?.length > 0) {
      return this.result_data.stats.reduce ((accumulated_value, current_value) => accumulated_value + current_value) / this.result_data.stats.length;
    }
    return null; // if no stats, then not applicable
  }

  calc_median_of_stats(): number | null {
    // KRISTIAN_NOTE - We sorted the stats array in the constructor, so let's just return the middle index.
    if (this.result_data?.stats?.length > 0) {
      const middle = Math.floor(this.result_data.stats.length / 2)
      // If the array is of even length, return the average of the TWO middle entries
      if (this.result_data.stats.length % 2 === 0) {
        return (this.result_data.stats [middle] + this.result_data.stats [middle + 1]) / 2;
      } else {
        return this.result_data.stats[middle];
      }
    }
    return null; // if no stats, then not applicable
  }

  calc_standard_deviation_of_stats(): number | null {
    if (this.result_data?.stats?.length > 0) {
      const mean = this.calc_mean_of_stats() as number;
      const sums_of_square_diffs = this.result_data.stats.reduce ((accumulated_value, current_value) => accumulated_value + Math.pow(current_value - mean, 2));
      // KRISTIAN_NOTE - Math.max to prevent zero division.  In this case, the mean of a single-valued array is itself, so the numerator is just 0.
      const denominator = Math.max (this.result_data.stats.length - 1, 1);
      return Math.sqrt(sums_of_square_diffs / denominator);
    }
    return null; // if no stats, then not applicable
  }
}