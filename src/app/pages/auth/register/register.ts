import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { RouterLink } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { LocalizePipe } from "../../../i18n/localize.pipe";

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get("password")?.value === group.get("confirmPassword")?.value ? null : { passwordMismatch: true };
}

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, TranslocoPipe, LocalizePipe],
  selector: "app-register",
  styleUrl: "../auth.scss",
  templateUrl: "./register.html",
})
export class Register {
  hidePassword = signal(true);

  branches = ["football", "basketball", "swimming"];

  form = inject(FormBuilder).nonNullable.group(
    {
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", Validators.pattern(/^[0-9 +()-]{10,}$/)],
      branch: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", Validators.required],
      terms: [false, Validators.requiredTrue],
    },
    { validators: passwordsMatch },
  );

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  }
}
