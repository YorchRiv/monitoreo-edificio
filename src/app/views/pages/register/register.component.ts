
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
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
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    ReactiveFormsModule,
    AlertComponent
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';
  loading: boolean = false;
  success: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('repeatPassword')?.value ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';
      const { nombre, apellido, email, password } = this.registerForm.value;
      this.authService.register(nombre, apellido, email, password).subscribe({
        next: (response) => {
          this.loading = false;
          this.success = 'Usuario registrado exitosamente. Redirigiendo...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (errorMessage) => {
          this.loading = false;
          this.error = errorMessage;
        }
      });
    } else {
      let errorMessages = [];
      if (this.registerForm.get('nombre')?.hasError('required')) {
        errorMessages.push('El nombre es obligatorio');
      }
      if (this.registerForm.get('apellido')?.hasError('required')) {
        errorMessages.push('El apellido es obligatorio');
      }
      if (this.registerForm.get('email')?.hasError('required')) {
        errorMessages.push('El correo electrónico es obligatorio');
      }
      if (this.registerForm.get('email')?.hasError('email')) {
        errorMessages.push('Ingrese un correo electrónico válido');
      }
      if (this.registerForm.get('password')?.hasError('required')) {
        errorMessages.push('La contraseña es obligatoria');
      }
      if (this.registerForm.get('password')?.hasError('minlength')) {
        errorMessages.push('La contraseña debe tener al menos 6 caracteres');
      }
      if (this.registerForm.hasError('mismatch')) {
        errorMessages.push('Las contraseñas no coinciden');
      }
      if (this.registerForm.get('repeatPassword')?.hasError('required')) {
        errorMessages.push('Debe repetir la contraseña');
      }
      this.error = errorMessages.join('. ');
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
