import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { PostCardComponent } from '../../shared/post-card/post-card.component';
import { CommentModalComponent } from '../../shared/comment-modal/comment-modal.component';
import { AuthService } from '../../services/auth.service';
import { ALL_TAGS } from '../../data/tags.data';

const BACKEND_URL = 'http://localhost:3000';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent, CommentModalComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  posts: any[] = [];
  filteredPosts: any[] = []; // <<< NOVO - lista filtrada

  page = 1;
  hasMore = true;
  isLoading = false;

  avatarUrl: string = 'assets/canvo.png';
  currentUserId: number | null = null;

  // ===========================
  // SISTEMA DE FILTRO DE TAGS
  // ===========================
  filterOpen = false;

allTags = ALL_TAGS;  
selectedTags: number[] = [];


  @ViewChild('commentModal') commentModal!: CommentModalComponent;

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMore();

    this.authService.getProfile().subscribe({
      next: (user) => {
        if (user) {
          this.currentUserId = user.id ?? null;
        }

        if (user?.foto_perfil_url) {
          this.avatarUrl = `${BACKEND_URL}${user.foto_perfil_url}`;
        }
      },
      error: () => {
        this.avatarUrl = 'assets/canvo.png';
      }
    });
  }

  loadMore() {
    this.isLoading = true;

    this.recipeService.getFeed().subscribe({
      next: (res: any) => {
        this.posts = res.receitas || res || [];
        this.filteredPosts = [...this.posts]; // <<< INICIALIZA COM TODOS
        this.hasMore = res.hasMore;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  // ===============================
  // FILTRO DE TAGS
  // ===============================

  toggleFilterPanel() {
    this.filterOpen = !this.filterOpen;
  }

  openFilter() {
  this.filterOpen = true;
}

closeFilter() {
  this.filterOpen = false;
}

toggleTag(tagId: number) {
  const index = this.selectedTags.indexOf(tagId);
  if (index >= 0) this.selectedTags.splice(index, 1);
  else this.selectedTags.push(tagId);
}

clearFilter() {
  this.selectedTags = [];
  this.filteredPosts = [...this.posts];
}

applyFilter() {
  if (this.selectedTags.length === 0) {
    this.filteredPosts = [...this.posts];
  } else {
    this.filteredPosts = this.posts.filter(post => {
      const postTags = post.tags?.map((t: { id: number }) => t.id) || [];
      return postTags.some((id: number) => this.selectedTags.includes(id));
    });
  }

  this.filterOpen = false;
}


  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
