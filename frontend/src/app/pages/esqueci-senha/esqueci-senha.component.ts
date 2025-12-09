import { Component, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './esqueci-senha.component.html',
  styleUrls: ['./esqueci-senha.component.css']
})
export class EsqueciSenhaComponent implements AfterViewInit {

  // ETAPA ATUAL
  etapa = 1;

  // CAMPOS
  email = '';
  codigo = '';
  novaSenha = '';
  confirmarSenha = '';

  // ESTADO
  message = '';
  loading = false;
  isError = false;
  showRegisterLink = false;

  // SENHA FORTE (MESMO DO REGISTER)
  showPassword = false;
  showConfirmPassword = false;
  passwordFocused = false;

  passwordValidators = {
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  passwordStrengthPercent = 0;
  passwordStrengthColor = 'transparent';

  constructor(
    private authService: AuthService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  // =========================
  // ESTRELAS
  // =========================
  ngAfterViewInit(): void {
    this.generateStars(130);
  }

  private getElement(selector: string): HTMLElement {
    return this.el.nativeElement.querySelector(selector);
  }

  private generateStars(amount: number) {
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

  irParaEtapa(n: number) {
    this.etapa = n;
    this.message = '';
    this.isError = false;
  }

  // =========================
  // FORÇA DA SENHA
  // =========================
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // =========================
  // ETAPA 1 — EMAIL
  // =========================
  onEnviarEmail(emailField: NgModel) {
    this.resetMensagens();

    if (!this.email) {
      return this.setErro('Por favor, preencha o email.');
    }
    if (emailField.errors?.['email']) {
      return this.setErro('Email inválido.');
    }

    this.loading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.message = 'Código enviado! Verifique seu email.';
        this.isError = false;
        this.etapa = 2;
        this.loading = false;
      },
      error: (err) => {
        this.setErro(err.error?.mensagem || 'Erro ao enviar código.');
        if (err.status === 404) this.showRegisterLink = true;
      }
    });
  }

  // =========================
  // ETAPA 2 — CÓDIGO
  // =========================
  onVerificarCodigo() {
    this.resetMensagens();

    if (!this.codigo || this.codigo.length !== 6) {
      return this.setErro('O código deve ter 6 dígitos.');
    }

    this.loading = true;

    this.authService.verifyResetCode(this.email, this.codigo).subscribe({
      next: () => {
        this.message = 'Código verificado!';
        this.isError = false;
        this.etapa = 3;
        this.loading = false;
      },
      error: (err) => {
        this.setErro(err.error?.mensagem || 'Código inválido.');
      }
    });
  }

  // =========================
  // ETAPA 3 — NOVA SENHA
  // =========================
  onRedefinirSenha() {
    this.resetMensagens();

    if (!this.novaSenha || !this.confirmarSenha) {
      return this.setErro('Preencha e confirme a nova senha.');
    }

    // Mesmo critério do register: senha precisa atender todos os requisitos
    if (this.passwordStrengthPercent < 100) {
      return this.setErro('Sua senha não atende a todos os requisitos de segurança.');
    }

    if (this.novaSenha !== this.confirmarSenha) {
      return this.setErro('As senhas não coincidem!');
    }

    this.loading = true;

    this.authService.resetPassword(this.email, this.codigo, this.novaSenha).subscribe({
      next: () => {
        this.isError = false;
        this.message = 'Senha redefinida com sucesso!';
        this.loading = false;

        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      },
      error: (err) => {
        this.setErro(err.error?.mensagem || 'Erro ao redefinir senha.');
      }
    });
  }

  // =========================
  // AUXILIARES
  // =========================
  private setErro(msg: string) {
    this.message = msg;
    this.isError = true;
    this.loading = false;
  }

  private resetMensagens() {
    this.message = '';
    this.isError = false;
    this.loading = false;
    this.showRegisterLink = false;
  }
}
