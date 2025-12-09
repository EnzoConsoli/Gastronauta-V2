import { Component, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {

  credentials = { email: '', senha: '' };
  showPassword = false;
  errorMessage: string | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private authService: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.generateStars(140);
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (!this.credentials.email || !this.credentials.senha) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user_id', String(response.id));
        if (response.nome_usuario) {
          localStorage.setItem('username', response.nome_usuario);
        }
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.errorMessage = err.error?.mensagem || 'Credenciais inválidas.';
      }
    });
  }
}
