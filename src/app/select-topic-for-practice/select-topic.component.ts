import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FeedbackComparisonDialogService } from '../feedback-comparison-dialog/feedback-comparison-dialog-service.service';

@Component({
    selector: 'select-topic-for-practice',
    templateUrl: 'select-topic.component.html',
    styleUrl: "select-topic.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
    ],
})
export class SelectTopicForPracticeComponent {
    user_selected_topic = new FormControl<string | null> (null, Validators.required);
    change_topic = output<string | null>();
    is_custom_user_topic = output<boolean | null>();
    custom_user_question: string = "";
    // KRISTIAN_TODO - Do I want this to be an array of strings?
    // Or do I want some id's to go along with this?
    // KRISTIAN_TODO - Do I want this to be public?  Or private with a getter?
    conversation_topics: string[] = [
        "Hobbies",
        "Work",
        "University",
        "Time",
        "Nature",
        "Culture",
        "Family",
        "Art",
    ];
    feedback_comparison_dialog_service = inject (FeedbackComparisonDialogService);

    constructor (private _dialog: MatDialog) {}

    submit_new_topic(new_topic: string | null, is_custom_user_topic: boolean | null) {
        this.change_topic.emit (new_topic);
        this.is_custom_user_topic.emit (is_custom_user_topic);
    }

    // KRISTIAN_TODO - Make a note somewhere in the html that this is for users who ONLY
    // want to compare some known piece of feedback to another piece of feedback without going through the tutor.
    open_feedback_comparison_dialog_box () {
        this.feedback_comparison_dialog_service.open_dialog (this._dialog, '');
    }
}