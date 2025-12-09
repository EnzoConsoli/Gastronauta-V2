import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';

const BACKEND_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  private apiUrl = `${BACKEND_URL}/api/receitas`;
  baseUrl = 'http://localhost:3000/api/recipes';

  constructor(private http: HttpClient) {}

  // ============================================================
  // 🔐 TOKEN PARA ROTAS PRIVADAS
  // ============================================================
  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // ============================================================
  // 🔥 IMAGENS E PERFIS
  // ============================================================
  getFullImageUrl(relativePath: string | null): string | null {
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;

    if (relativePath.startsWith('/api/users/avatars/')) {
      return `${BACKEND_URL}${relativePath}`;
    }

    if (relativePath.startsWith('/uploads/')) {
      return `${BACKEND_URL}${relativePath}`;
    }

    return null;
  }

  getProfileById(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${BACKEND_URL}/api/users/${userId}`);
  }

  // ============================================================
  // 🔍 BUSCA DE RECEITAS
  // ============================================================
  buscarReceitasPesquisa(query: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/search`,
      { params: { q: query }, ...this.getAuthHeaders() }
    );
  }

  // ============================================================
  // 🔥 FEED
  // ============================================================
  getFeed(): Observable<any> {
    return this.http.get(`${this.apiUrl}/feed`, this.getAuthHeaders());
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  buscarMinhasReceitas(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/my-recipes`, this.getAuthHeaders());
  }

  buscarCurtidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/liked`, this.getAuthHeaders());
  }

  criar(recipeData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, recipeData, this.getAuthHeaders());
  }

  atualizar(id: number, recipeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, recipeData, this.getAuthHeaders());
  }
  
  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  // ============================================================
  // ❤️ CURTIR RECEITA
  // ============================================================
  likeReceita(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/like`, {}, this.getAuthHeaders());
  }

  getLikeStatus(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/like-status`, this.getAuthHeaders());
  }

  // ============================================================
  // 💬 COMENTÁRIOS DE RECEITA (NÃO AVALIAÇÃO)
  // ============================================================
  getComments(id: number, page: number = 1, limit: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/${id}/comments`, { params, ...this.getAuthHeaders() });
  }

  postComment(id: number, comentario: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/comment`, { comentario }, this.getAuthHeaders());
  }

  excluirComentario(commentId: number) {
  return this.http.delete(
    `${this.apiUrl}/comments/${commentId}`,
    this.getAuthHeaders()
  );
}

  // ============================================================
  // ⭐ AVALIAÇÕES (REVIEWS)
  // ============================================================
  buscarAvaliacoes(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/avaliacoes`, this.getAuthHeaders());
  }

  publicarAvaliacao(id: number, data: { nota: number, comentario: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/avaliar`, data, this.getAuthHeaders());
  }

  // ============================================================
  // 👍 LIKE / 👎 DISLIKE EM AVALIAÇÃO
  // ============================================================
  reagirAvaliacao(avaliacaoId: number, tipo: 'like' | 'dislike' | 'none') {
    return this.http.post(
      `${this.apiUrl}/avaliacao/${avaliacaoId}/react`,
      { tipo },
      this.getAuthHeaders()
    );
  }

  // ============================================================
  // 🗨️ RESPONDER AVALIAÇÃO
  // ============================================================
  responderAvaliacao(avaliacaoId: number, texto: string) {
    return this.http.post(
      `${this.apiUrl}/avaliacao/${avaliacaoId}/responder`,
      { texto },
      this.getAuthHeaders()
    );
  }


  // ============================================================
  // 🗑️ EXCLUIR AVALIAÇÃO
  // ============================================================
  excluirAvaliacao(receitaId: number, avaliacaoId: number) {
    return this.http.delete(`${this.apiUrl}/${receitaId}/avaliacoes/${avaliacaoId}`, this.getAuthHeaders());
  }

  excluirResposta(respostaId: number) {
  return this.http.delete(
    `${this.apiUrl}/avaliacao/resposta/${respostaId}`,
    this.getAuthHeaders()
  );
}

  // ============================================================
  // 👤 RECEITAS DE UM USUÁRIO
  // ============================================================
  buscarReceitasDeUsuario(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`, this.getAuthHeaders());
  }

  // ============================================================
  // 👥 SEGUIR / DEIXAR DE SEGUIR
  // ============================================================
  followUser(seguidoId: number) {
    return this.http.post(
      `${BACKEND_URL}/api/users/seguir`,
      { seguido_id: seguidoId },
      this.getAuthHeaders()
    );
  }

  unfollowUser(seguidoId: number) {
    return this.http.request(
      'delete',
      `${BACKEND_URL}/api/users/seguir`,
      { body: { seguido_id: seguidoId }, ...this.getAuthHeaders() }
    );
  }

  isFollowing(seguidoId: number) {
    return this.http.get<any>(
      `${BACKEND_URL}/api/users/${seguidoId}/is-following`,
      this.getAuthHeaders()
    );
  }

  getFollowersCount(userId: number) {
    return this.http.get<any>(`${BACKEND_URL}/api/users/${userId}/followers`, this.getAuthHeaders());
  }

  getFollowingCount(userId: number) {
    return this.http.get<any>(`${BACKEND_URL}/api/users/${userId}/following`, this.getAuthHeaders());
  }

  getFollowers(userId: number) {
    return this.http.get<any[]>(`${BACKEND_URL}/api/users/${userId}/followers-list`, this.getAuthHeaders());
  }

  getFollowing(userId: number) {
    return this.http.get<any[]>(`${BACKEND_URL}/api/users/${userId}/following-list`, this.getAuthHeaders());
  }

  

}
