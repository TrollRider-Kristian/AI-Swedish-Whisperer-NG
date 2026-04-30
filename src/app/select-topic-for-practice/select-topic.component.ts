import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
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
        MatRadioModule,
        MatSelectModule,
        ReactiveFormsModule,
    ],
})
export class SelectTopicForPracticeComponent {
    topic_selection_method = "choose-predefined-option";
    user_selected_topic = new FormControl<string | null> (null, Validators.required);
    custom_user_topic: string = "";
    change_topic = output<string | null>();
    is_custom_user_question = output<boolean | null>();
    custom_user_question: string = "";
    private _conversation_topics: string[] = [
        "Hobbies",
        "Work",
        "University",
        "Time",
        "Nature",
        "Culture",
        "Family",
        "Art",
    ];
    public get conversation_topics() {
        return this._conversation_topics;
    }
    feedback_comparison_dialog_service = inject (FeedbackComparisonDialogService);

    constructor (private _dialog: MatDialog) {}

    new_topic_is_empty (new_topic: string | null): boolean {
        return new_topic == null || new_topic?.length == 0;
    }

    submit_new_topic(new_topic: string | null, is_custom_user_question: boolean | null): void {
        this.change_topic.emit (new_topic);
        this.is_custom_user_question.emit (is_custom_user_question);
    }

    open_feedback_comparison_dialog_box (): void {
        this.feedback_comparison_dialog_service.open_dialog (this._dialog, null);
    }
}