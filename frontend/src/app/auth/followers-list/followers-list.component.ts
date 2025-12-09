import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';

const BACKEND_URL = 'http://localhost:3000';

@Component({
  selector: 'app-followers-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './followers-list.component.html',
  styleUrls: ['./followers-list.component.css']
})
export class FollowersListComponent implements OnInit {

  title = '';
  users: any[] = [];

  loggedUserId: number = 0;
  private viewedUserId: number = 0;
  private type: 'followers' | 'following' | null = null;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loggedUserId = Number(localStorage.getItem('user_id'));
    this.viewedUserId = Number(this.route.snapshot.paramMap.get('id'));

    const t = this.route.snapshot.queryParamMap.get('type');
    this.type = (t === 'following') ? 'following' : 'followers';
    this.title = this.type === 'followers' ? 'Seguidores' : 'Seguindo';

    const loader =
      this.type === 'followers'
        ? this.recipeService.getFollowers(this.viewedUserId)
        : this.recipeService.getFollowing(this.viewedUserId);

    loader.subscribe(res => {
      this.users = res.map((u: any) => ({
        ...u,
        foto_perfil_url: u.foto_perfil_url
          ? BACKEND_URL + u.foto_perfil_url
          : 'assets/canvo.png',
        isFollowing: !!u.voceSegue,        // se VOCÊ segue essa pessoa
        elaSegueVoce: !!u.elaSegueVoce     // se ela segue VOCÊ
      }));
    });
  }

  openProfile(id: number) {
    this.router.navigate(['/dashboard'], { queryParams: { user: id } });
  }

  // 🔥 botão seguir / seguir de volta / deixar de seguir
  toggleFollow(user: any, event: Event) {
    event.stopPropagation();

    if (!user.isFollowing) {
      // seguir
      this.recipeService.followUser(user.id).subscribe({
        next: () => {
          user.isFollowing = true;
        }
      });
    } else {
      // deixar de seguir
      this.recipeService.unfollowUser(user.id).subscribe({
        next: () => {
          user.isFollowing = false;
        }
      });
    }
  }

  getButtonText(user: any): string {
    if (user.isFollowing) {
      return 'Deixar de seguir';
    }

    if (!user.isFollowing && user.elaSegueVoce) {
      return 'Seguir de volta';
    }

    return 'Seguir';
  }
  goBack() {
  window.history.back();
}

}
