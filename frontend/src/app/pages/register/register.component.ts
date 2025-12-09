import { Component, ViewChild, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PopupComponent } from '../../shared/popup/popup.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PopupComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements AfterViewInit {

  @ViewChild('registrationPopup') popup!: PopupComponent;

  constructor(
    private authService: AuthService,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  // ==========================
  // ESTRELAS DO FUNDO
  // ==========================
  ngAfterViewInit(): void {
    this.generateStars(150);
  }

  getElement(selector: string): HTMLElement {
    return this.el.nativeElement.querySelector(selector);
  }

  generateStars(amount: number) {
    const wrapper = this.getElement('.stars-wrapper');
    if (!wrapper) return;

    for (let i = 0; i < amount; i++) {
      const star = this.renderer.createElement('div');
      this.renderer.addClass(star, 'star-img');

      this.renderer.setStyle(star, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(star, 'top', `${Math.random() * 100}%`);
      this.renderer.setStyle(star, 'width', `${10 + Math.random() * 12}px`);
      this.renderer.setStyle(star, 'height', star.style.width);
      this.renderer.setStyle(star, 'animationDelay', `${Math.random() * 3}s`);

      this.renderer.appendChild(wrapper, star);
    }
  }

  // ==========================
  // FORM
  // ==========================
  userData = {
    nome_usuario: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  };

  showPassword = false;
  showConfirmPassword = false;
  errorMessage: string | null = null;

  // ====== VALIDAÇÃO DA SENHA (mesmo sistema do EsqueciSenha/Register) ======
  passwordFocused = false;

  passwordValidators = {
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  passwordStrengthPercent = 0;
  passwordStrengthColor = 'transparent';

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // BLOQUEIA NÚMEROS NO NOME
  onNameInput(event: any) {
    const value = event.target.value;
    this.userData.nome_usuario = value.replace(/[0-9]/g, ''); // remove números automaticamente
  }

  // VALIDA SENHA
  onPasswordChange(password: string): void {
    const uppercaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    let strength = 0;

    this.passwordValidators.minLength = password.length >= 8;
    this.passwordValidators.hasUppercase = uppercaseRegex.test(password);
    this.passwordValidators.hasNumber = numberRegex.test(password);
    this.passwordValidators.hasSpecialChar = specialCharRegex.test(password);

    if (this.passwordValidators.minLength) strength++;
    if (this.passwordValidators.hasUppercase) strength++;
    if (this.passwordValidators.hasNumber) strength++;
    if (this.passwordValidators.hasSpecialChar) strength++;

    this.passwordStrengthPercent = (strength / 4) * 100;

    if (this.passwordStrengthPercent <= 25) {
      this.passwordStrengthColor = '#dc3545';
    } else if (this.passwordStrengthPercent <= 75) {
      this.passwordStrengthColor = '#ffc107';
    } else {
      this.passwordStrengthColor = '#28a745';
    }
  }

  // ==========================
  // VALIDAÇÃO DO EMAIL
  // ==========================
  emailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.toLowerCase());
  }

  // ==========================
  // SUBMIT DO FORMULÁRIO
  // ==========================
  onSubmit(form: NgForm): void {
    this.errorMessage = null;
    form.control.markAllAsTouched();

    // Campos vazios
    if (form.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    // Nome inválido
    if (!this.userData.nome_usuario.trim()) {
      this.errorMessage = 'O nome de usuário não pode estar vazio.';
      return;
    }

    // Email válido?
    if (!this.emailValido(this.userData.email)) {
      this.errorMessage = 'Digite um email válido.';
      return;
    }

    // Força da senha
    if (this.passwordStrengthPercent < 100) {
      this.errorMessage = 'Sua senha não atende aos requisitos de segurança.';
      return;
    }

    // Confirmar senha
    if (this.userData.senha !== this.userData.confirmarSenha) {
      this.errorMessage = 'As senhas não coincidem!';
      return;
    }

    const dataToSend = {
      nome_usuario: this.userData.nome_usuario,
      email: this.userData.email,
      senha: this.userData.senha
    };

    this.authService.register(dataToSend).subscribe({
      next: () => {
        this.popup.show(
          'Cadastro realizado!',
          'Sua conta foi criada com sucesso. Clique em OK para continuar.'
        );
      },
      error: (err) => {
        this.errorMessage = err.error?.mensagem || 'Erro ao registrar.';
      }
    });
  }

  onPopupConfirm(): void {
    this.router.navigate(['/login']);
  }
}
