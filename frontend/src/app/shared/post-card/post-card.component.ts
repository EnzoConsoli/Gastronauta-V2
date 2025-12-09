import {
  Component,
  Input,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { ALL_TAGS } from '../../data/tags.data';

export type FeedPost = {
  id: number;
  usuario_id: number;
  nome_usuario: string;
  descricao?: string | null;
  prato?: string | null;
  url_imagem?: string | null;
  foto_perfil_url?: string | null;
  isLikedByMe?: boolean | number | null;
  totalCurtidas?: number | string | null;
  avgAval?: number | string | null;
  totalAval?: number | string | null;
  tags?: { id: number; nome: string; cor: string }[];
};

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css'],
})
export class PostCardComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() post?: FeedPost;
  @Input() currentUserId: number | null = null;

  @ViewChild('tagsRow', { static: false }) tagsRow!: ElementRef<HTMLDivElement>;

  isOwner = false;
  loggedUserId = Number(localStorage.getItem('user_id'));

  isLiked = false;
  totalLikes = 0;
  avgAval = '0.0';
  totalAval = 0;

  postImageUrl = 'assets/placeholder.png';
  authorAvatarUrl = 'assets/canvo.png';

  // =============================
  // SISTEMA DE DROPDOWN DE TAGS
  // =============================
  visibleTags: any[] = [];
  expanded = false;
  hasHiddenTags = false;

  constructor(private recipeService: RecipeService) {}

  // Sempre retornar um objeto válido
  get safePost(): FeedPost {
    return this.post || ({} as FeedPost);
  }

  // ---------------------------------------------------
  // Sempre que o input mudar, repassa as cores das tags
  // ---------------------------------------------------
  ngOnChanges() {
    if (this.post?.tags) {
      this.safePost.tags = this.post.tags.map((t: any) => {
        const ref = ALL_TAGS.find((x) => x.id === t.id);
        return {
          ...t,
          cor: ref?.cor || '#ccc',
          grupo: ref?.grupo || 'outro',
        };
      });
    }

    // reset do dropdown
    this.visibleTags = [];
    this.expanded = false;
    this.hasHiddenTags = false;
  }

  // =====================================================
  // CONFIGURAÇÕES INICIAIS DA RECEITA
  // =====================================================
  ngOnInit(): void {
    const effectiveLoggedId =
      this.currentUserId != null ? this.currentUserId : this.loggedUserId;

    this.isOwner =
      effectiveLoggedId != null &&
      this.safePost.usuario_id === effectiveLoggedId;

    this.isLiked = !!Number(this.safePost.isLikedByMe ?? 0);
    this.totalLikes = Number(this.safePost.totalCurtidas ?? 0);

    const avg = Number(this.safePost.avgAval ?? 0);
    this.avgAval = avg.toFixed(1);
    this.totalAval = Number(this.safePost.totalAval ?? 0);

    const img = this.recipeService.getFullImageUrl(
      this.safePost.url_imagem ?? ''
    );
    this.postImageUrl = img || 'assets/placeholder.png';

    const avatar = this.recipeService.getFullImageUrl(
      this.safePost.foto_perfil_url ?? ''
    );
    this.authorAvatarUrl = avatar || 'assets/canvo.png';

    // Aplicar cores corretas das tags (caso já venha no OnInit)
    if (this.safePost.tags) {
      this.safePost.tags = this.safePost.tags.map((t: any) => {
        const ref = ALL_TAGS.find((x) => x.id === t.id);
        return {
          ...t,
          cor: ref?.cor || '#ccc',
          grupo: ref?.grupo || 'outro',
        };
      });
    }
  }

  // =====================================================
  // Após renderizar, calcular tags que cabem na 1ª linha
  // =====================================================
  ngAfterViewInit(): void {
    setTimeout(() => this.calculateVisibleTags(), 0);
  }

  // =====================================================
  // CÁLCULO DAS TAGS QUE CABEM EM UMA LINHA
  // =====================================================
  calculateVisibleTags() {
    if (!this.safePost.tags?.length || !this.tagsRow) return;

    const row = this.tagsRow.nativeElement;
    this.visibleTags = [];
    this.hasHiddenTags = false;

    // container temporário para medir exatamente as larguras
    const testContainer = document.createElement('div');
    testContainer.style.position = 'absolute';
    testContainer.style.visibility = 'hidden';
    testContainer.style.whiteSpace = 'nowrap';
    testContainer.style.fontFamily = getComputedStyle(row).fontFamily;
    testContainer.style.fontSize = getComputedStyle(row).fontSize;
    document.body.appendChild(testContainer);

    const availableWidth = row.clientWidth; // quase toda a linha

    for (const tag of this.safePost.tags) {
      const tagEl = document.createElement('span');
      tagEl.style.display = 'inline-block';
      tagEl.style.padding = '4px 10px';
      tagEl.style.borderRadius = '999px';
      tagEl.style.border = '2px solid ' + tag.cor;
      tagEl.style.color = tag.cor;
      tagEl.style.marginRight = '6px';
      tagEl.textContent = tag.nome;

      testContainer.appendChild(tagEl);

      // permite encher bem a linha; só para um pouco antes do limite
      const fits = testContainer.clientWidth <= availableWidth - 24;

      if (!fits) {
        this.hasHiddenTags = true;
        break;
      }

      this.visibleTags.push(tag);
    }

    document.body.removeChild(testContainer);

    // fallback: se nenhuma coube por causa de arredondos, mostra pelo menos a primeira
    if (!this.visibleTags.length && this.safePost.tags.length) {
      this.visibleTags = [this.safePost.tags[0]];
      this.hasHiddenTags = this.safePost.tags.length > 1;
    }
  }

  // =====================================================
  // EXPANDIR / RECOLHER TAGS
  // =====================================================
  toggleExpand() {
    this.expanded = !this.expanded;

    if (this.expanded) {
      // mostra todas e deixa quebrar linha
      this.visibleTags = [...(this.safePost.tags ?? [])];
    } else {
      // volta pro cálculo da primeira linha
      this.calculateVisibleTags();
    }
  }

  // =====================================================
  // CURTIR / DESCURTIR
  // =====================================================
  toggleLike(): void {
    if (!this.safePost.id) return;

    this.recipeService.likeReceita(this.safePost.id).subscribe({
      next: (res) => {
        this.isLiked = !!res.liked;
        this.totalLikes = Number(res.totalCurtidas ?? 0);
      },
    });
  }

  // =====================================================
  // FALLBACKS DE IMAGEM
  // =====================================================
  onPostImageError(ev: Event): void {
    (ev.target as HTMLImageElement).src = 'assets/placeholder.png';
  }

  onAvatarError(ev: Event): void {
    (ev.target as HTMLImageElement).src = 'assets/canvo.png';
  }
}
