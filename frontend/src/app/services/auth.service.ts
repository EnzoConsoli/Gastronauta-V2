// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a URL base do seu backend
const BACKEND_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Rotas da API
  private authApiUrl = `${BACKEND_URL}/api/auth`;
  private userApiUrl = `${BACKEND_URL}/api/users`; // Rota para /api/users

  constructor(private http: HttpClient) { }

  // =============================
  // === FUNÇÕES EXISTENTES ===
  // =============================

  register(userData: any): Observable<any> {
    return this.http.post(`${this.authApiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.authApiUrl}/login`, credentials);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.authApiUrl}/forgot-password`, { email });
  }

  // ❌ ESTA versão antiga não serve mais para 3 argumentos
  // resetPassword(data: any): Observable<any> {
  //   return this.http.post(`${this.authApiUrl}/reset-password`, data);
  // }

  // ===============================================
  // === NOVAS FUNÇÕES PARA O SISTEMA DE CÓDIGO ===
  // ===============================================

  /**
   * Verifica o código enviado por email
   */
  verifyResetCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.authApiUrl}/verify-reset-code`, {
      email,
      code
    });
  }

  /**
   * Redefine a senha usando email + código + nova senha
   */
  resetPassword(email: string, code: string, novaSenha: string): Observable<any> {
    return this.http.post(`${this.authApiUrl}/reset-password`, {
      email,
      code,
      novaSenha
    });
  }

  // ===============================================
  // === FUNÇÕES DE PERFIL (SUAS, MANTIDAS) ===
  // ===============================================

  getProfile(): Observable<any> {
    return this.http.get(`${this.userApiUrl}/profile`);
  }

  updateProfile(profileData: FormData): Observable<any> {
    return this.http.put(`${this.userApiUrl}/profile`, profileData);
  }

  // =======================================================
  // === FUNÇÃO ADICIONADA: Remover Foto de Perfil ===
  // =======================================================
  removeProfilePicture(): Observable<any> {
    return this.http.delete(`${this.userApiUrl}/profile-picture`);
  }

  deleteAccount(senha: string) {
  return this.http.post('http://localhost:3000/api/auth/delete-account', { senha });
}
}
