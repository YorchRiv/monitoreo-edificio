import { Component } from '@angular/core';
import { NgStyle, NgClass, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  AlertComponent
} from '@coreui/angular-pro';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,
    NgClass,
    NgIf,
    ReactiveFormsModule,
    AlertComponent
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (errorMessage) => {
          this.loading = false;
          this.error = errorMessage;
        }
      });
    } else {
      let errorMessages = [];
      if (this.loginForm.get('email')?.hasError('required')) {
        errorMessages.push('El correo electrónico es obligatorio');
      }
      if (this.loginForm.get('email')?.hasError('email')) {
        errorMessages.push('Ingrese un correo electrónico válido');
      }
      if (this.loginForm.get('password')?.hasError('required')) {
        errorMessages.push('La contraseña es obligatoria');
      }
      if (this.loginForm.get('password')?.hasError('minlength')) {
        errorMessages.push('La contraseña debe tener al menos 6 caracteres');
      }
      this.error = errorMessages.join('. ');
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
