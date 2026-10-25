import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { RouterLink } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { LocalizePipe } from "../../../i18n/localize.pipe";

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, TranslocoPipe, LocalizePipe],
  selector: "app-login",
  styleUrl: "../auth.scss",
  templateUrl: "./login.html",
})
export class Login {
  hidePassword = signal(true);

  form = inject(FormBuilder).nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required],
    remember: [false],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  }
}
