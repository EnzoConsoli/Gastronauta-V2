import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { PopupComponent } from '../../shared/popup/popup.component';
import { RatingModalComponent } from '../../shared/rating-modal/rating-modal';
import { AuthService } from '../../services/auth.service';
import { ALL_TAGS } from '../../data/tags.data';


const BACKEND_URL = 'http://localhost:3000';

interface Avaliacao {
  id: number;
  usuario_id: number;
  nome_usuario: string;
  comentario: string;
  nota: number;
  data_avaliacao: string;
  foto_perfil_url: string;

  likes: number;
  dislikes: number;
  liked: boolean;
  disliked: boolean;

  respostas: any[];
  replies: any[];
  replyText: string;
  showReplyBox: boolean;
}

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PopupComponent, RatingModalComponent],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {

  @ViewChild('deleteConfirmPopup', { static: false }) deletePopup?: PopupComponent;
  @ViewChild('ratingModal', { static: false }) ratingModal?: RatingModalComponent;

  public BACKEND_URL = BACKEND_URL;

  recipe: any = null;
  isLoading = true;
  error: string | null = null;
  fullImageUrl: string | null = null;
  isOwner = false;
  currentUserId: number | null = null;

  ratingValue: number = 0;
  reviewCount: number = 0;
  fullStars: number = 0;
  hasHalfStar: boolean = false;
  emptyStars: number = 5;

  comentarios: Avaliacao[] = [];
  authorAvatarUrl = 'assets/canvo.png';
  isLiked: boolean = false;
  private recipeId!: number;

  private actionPending: 'delete' | 'comment-delete' | 'reply-delete' | '' = '';
  private selectedReply: { avaliacao: Avaliacao, resposta: any } | null = null;
  private selectedCommentId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.currentUserId = decoded.id;
      } catch {}
    }

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) {
        this.error = 'ID da receita não fornecido.';
        this.isLoading = false;
        return;
      }

      this.recipeId = +idParam;
      this.recipe = null;
      this.comentarios = [];
      this.ratingValue = 0;
      this.reviewCount = 0;

      this.loadRecipeDetails();
      this.loadRecipeRatings();
    });
  }

  // ================================
  // PERFIL DO AUTOR
  // ================================
  openAuthorProfile() {
    if (!this.recipe) return;
    this.router.navigate(['/dashboard'], {
      queryParams: { user: this.recipe.usuario_id }
    });
  }

  // ================================
  // EDITAR RECEITA
  // ================================
  editarReceita() {
    this.router.navigate(['/editar-receita', this.recipeId]);
  }

  // ================================
  // CANCELAR POPUP
  // ================================
  onPopupCancel(): void {
    this.actionPending = '';
    this.selectedCommentId = null;
    this.selectedReply = null;
  }

  // ================================
  // EXCLUIR RECEITA (BOTÃO)
  // ================================
  excluirReceita(): void {
    this.actionPending = 'delete';

    // Se o popup existir, usa ele
    if (this.deletePopup) {
      this.deletePopup.show('Excluir Receita', 'Deseja realmente excluir esta receita?', true);
      return;
    }

    // Fallback de segurança (caso o popup não tenha sido resolvido por algum motivo)
    const ok = window.confirm('Deseja realmente excluir esta receita?');
    if (ok) {
      this.recipeService.excluir(this.recipeId).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    } else {
      this.actionPending = '';
    }
  }

  // ===============================================================
  // ABRIR PERFIL DO AUTOR DA AVALIAÇÃO
  // ===============================================================
  openUserProfile(userId: number): void {
    this.router.navigate(['/dashboard'], {
      queryParams: { user: userId }
    });
  }

  deleteReply(avaliacao: Avaliacao, resposta: any) {
    this.actionPending = 'reply-delete';
    this.selectedReply = { avaliacao, resposta };

    if (this.deletePopup) {
      this.deletePopup.show(
        'Excluir Resposta',
        'Deseja realmente excluir esta resposta?',
        true
      );
    } else {
      const ok = window.confirm('Deseja realmente excluir esta resposta?');
      if (ok) {
        this.recipeService.excluirResposta(resposta.id).subscribe(() => {
          avaliacao.replies = avaliacao.replies.filter(r => r.id !== resposta.id);
          avaliacao.respostas = avaliacao.respostas.filter(r => r.id !== resposta.id);
          this.selectedReply = null;
        });
      }
      this.actionPending = '';
    }
  }

  // ------------------------------------------------------------
  // CARREGAR RECEITA
  // ------------------------------------------------------------
  loadRecipeDetails(): void {
    this.recipeService.buscarPorId(this.recipeId).subscribe({
      next: (data) => {
        this.recipe = data;
        this.authorAvatarUrl = data.foto_perfil_url ? BACKEND_URL + data.foto_perfil_url : 'assets/canvo.png';

        if (data.ingredientes) {
          this.recipe.ingredientsList = data.ingredientes
            .split('\n')
            .filter((i: string) => i.trim() !== '');
        }

        if (data.tags) {
  this.recipe.tags = data.tags.map((t: any) => {
    const localTag = ALL_TAGS.find(x => x.id === t.id);
    return {
      ...t,
      cor: localTag?.cor || '#999',
      grupo: localTag?.grupo || 'outro'
    };
  });
}

        

        this.fullImageUrl = this.recipeService.getFullImageUrl(data.url_imagem);
        this.isOwner = this.currentUserId === data.usuario_id;
        this.isLiked = data.isLikedByMe === 1;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar receita.';
        this.isLoading = false;
      }
    });
  }

  // ------------------------------------------------------------
  // CARREGAR AVALIAÇÕES
  // ------------------------------------------------------------
  loadRecipeRatings(): void {
    this.recipeService.buscarAvaliacoes(this.recipeId).subscribe({
      next: (data) => {
        this.ratingValue = Number(data.stats?.mediaNotas) || 0;
        this.reviewCount = Number(data.stats?.totalAvaliacoes) || 0;
        this.calculateStars(this.ratingValue);

        this.comentarios = (data.avaliacoes || []).map((a: any) => ({
          id: a.id,
          usuario_id: a.usuario_id,
          nome_usuario: a.nome_usuario,
          comentario: a.comentario,
          nota: a.nota,
          data_avaliacao: a.data_avaliacao,
          foto_perfil_url: a.foto_perfil_url ? BACKEND_URL + a.foto_perfil_url : 'assets/canvo.png',

          likes: Number(a.likes) || 0,
          dislikes: Number(a.dislikes) || 0,
          liked: a.minhaReacao === 'like',
          disliked: a.minhaReacao === 'dislike',

          respostas: a.respostas || [],
          replies: a.respostas || [],
          replyText: '',
          showReplyBox: false
        }));
      },
      error: () => {
        this.comentarios = [];
      }
    });
  }

  // ------------------------------------------------------------
  // AVALIAR RECEITA
  // ------------------------------------------------------------
  publicarAvaliacao(data: { nota: number; comentario: string }): void {
    this.recipeService.publicarAvaliacao(this.recipeId, data).subscribe({
      next: () => this.loadRecipeRatings()
    });
  }

  // ------------------------------------------------------------
  // ABRIR POPUP PARA EXCLUSÃO DE AVALIAÇÃO
  // ------------------------------------------------------------
  deleteComment(c: Avaliacao) {
    this.selectedCommentId = c.id;
    this.actionPending = 'comment-delete';

    if (this.deletePopup) {
      this.deletePopup.show('Excluir Avaliação', 'Deseja realmente excluir esta avaliação?', true);
    } else {
      const ok = window.confirm('Deseja realmente excluir esta avaliação?');
      if (ok) {
        this.recipeService.excluirAvaliacao(this.recipeId, c.id).subscribe(() => {
          this.comentarios = this.comentarios.filter(x => x.id !== c.id);
        });
      }
      this.actionPending = '';
    }
  }

  // ------------------------------------------------------------
  // CONFIRMAR POPUP
  // ------------------------------------------------------------
  onPopupConfirm(): void {

    // EXCLUIR RECEITA
    if (this.actionPending === 'delete') {
      this.recipeService.excluir(this.recipeId).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
      this.actionPending = '';
      return;
    }

    // EXCLUIR AVALIAÇÃO
    if (this.actionPending === 'comment-delete' && this.selectedCommentId !== null) {
      this.recipeService.excluirAvaliacao(this.recipeId, this.selectedCommentId)
        .subscribe(() => {
          this.comentarios = this.comentarios.filter(c => c.id !== this.selectedCommentId);
          this.selectedCommentId = null;
        });
      this.actionPending = '';
      return;
    }

    // EXCLUIR RESPOSTA
    if (this.actionPending === 'reply-delete' && this.selectedReply) {
      const { avaliacao, resposta } = this.selectedReply;

      this.recipeService.excluirResposta(resposta.id).subscribe(() => {
        avaliacao.replies = avaliacao.replies.filter(r => r.id !== resposta.id);
        avaliacao.respostas = avaliacao.respostas.filter(r => r.id !== resposta.id);
        this.selectedReply = null;
      });

      this.actionPending = '';
      return;
    }

    this.actionPending = '';
  }

  // ------------------------------------------------------------
  // LIKE / DISLIKE RECEITA
  // ------------------------------------------------------------
  toggleLike() {
    this.isLiked = !this.isLiked;
    this.recipeService.likeReceita(this.recipeId).subscribe({
      next: (res) => (this.isLiked = res.liked),
      error: () => (this.isLiked = !this.isLiked)
    });
  }

  // ------------------------------------------------------------
  // LIKE / DISLIKE AVALIAÇÃO
  // ------------------------------------------------------------
  toggleLikeComment(c: Avaliacao) {
    this.recipeService.reagirAvaliacao(c.id, 'like').subscribe((res: any) => {
      c.liked = res.liked ?? c.liked;
      c.disliked = res.disliked ?? c.disliked;
      c.likes = Number(res.likes ?? c.likes);
      c.dislikes = Number(res.dislikes ?? c.dislikes);
    });
  }

  toggleDislikeComment(c: Avaliacao) {
    this.recipeService.reagirAvaliacao(c.id, 'dislike').subscribe((res: any) => {
      c.liked = res.liked ?? c.liked;
      c.disliked = res.disliked ?? c.disliked;
      c.likes = Number(res.likes ?? c.likes);
      c.dislikes = Number(res.dislikes ?? c.dislikes);
    });
  }

  // ------------------------------------------------------------
  // RESPOSTAS
  // ------------------------------------------------------------
  toggleReplyBox(c: Avaliacao) {
    c.showReplyBox = !c.showReplyBox;
  }

  sendReply(c: Avaliacao) {
    const txt = c.replyText.trim();
    if (!txt) return;

    this.recipeService.responderAvaliacao(c.id, txt)
      .subscribe((res: any) => {
        const nova = res.novaResposta ?? res;

        c.replies = [...c.replies, nova];
        c.respostas = c.replies;

        c.replyText = '';
        c.showReplyBox = false;
      });
  }

  // ------------------------------------------------------------
  // UI HELPERS
  // ------------------------------------------------------------
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/canvo.png';
  }

  goBack() { window.history.back(); }
  formatarData(d: string) { return new Date(d).toLocaleDateString('pt-BR'); }
  createStarsArray(n: number) { return Array(Math.round(n)).fill(0); }

  calculateStars(rating: number) {
    const r = Math.min(5, Math.max(0, rating));
    this.fullStars = Math.floor(r);
    this.hasHalfStar = r % 1 >= 0.5;
    this.emptyStars = 5 - this.fullStars - (this.hasHalfStar ? 1 : 0);
  }
}
