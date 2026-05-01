import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

export enum TOPIC_SELECTION_METHOD {
    CHOOSE_PREDEFINED_OPTION,
    TYPE_CUSTOM_TOPIC,
    TYPE_SPECIFIC_QUESTION,
};

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
    Topic_Selection_Method = TOPIC_SELECTION_METHOD;
    current_method = TOPIC_SELECTION_METHOD.CHOOSE_PREDEFINED_OPTION;
    user_selected_topic = new FormControl<string | null> (null, Validators.required);
    custom_user_topic: string = "";
    change_topic = output<string | null>();
    is_custom_user_question = output<boolean | null>();
    go_to_feedback_scoring_page = output<null>();
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

    new_topic_is_empty (new_topic: string | null): boolean {
        return new_topic == null || new_topic?.length == 0;
    }

    submit_new_topic(new_topic: string | null, is_custom_user_question: boolean | null): void {
        this.change_topic.emit (new_topic);
        this.is_custom_user_question.emit (is_custom_user_question);
    }

    direct_user_to_feedback_scoring_page () {
        this.go_to_feedback_scoring_page.emit(null);
    }
}