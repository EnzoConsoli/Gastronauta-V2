import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RecipeService } from '../services/recipe.service';
import { PopupComponent } from '../shared/popup/popup.component';
import { SwitchAccountPopupComponent } from '../shared/switch-account-popup/switch-account-popup.component';

const BACKEND_URL = 'http://localhost:3000';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    PopupComponent,
    FormsModule,
    SwitchAccountPopupComponent
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit {

  @ViewChild('deletePopup') deletePopup!: PopupComponent;
  @ViewChild('switchPopup') switchPopup!: SwitchAccountPopupComponent;

  avatarUrl: string = 'assets/canvo.png';
  showMenu = false;

  // BUSCA
  searchQuery: string = '';
  searchResults: any[] = [];
  searchOpened: boolean = false;

  constructor(
    private authService: AuthService,
    private recipeService: RecipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        if (user?.foto_perfil_url) {
          this.avatarUrl = `${BACKEND_URL}${user.foto_perfil_url}`;
        }
      },
      error: () => {
        this.avatarUrl = 'assets/canvo.png';
      }
    });
  }

  // =====================================================
  // FECHAR PAINÉIS AO CLICAR FORA
  // =====================================================
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // 🔍 BUSCA — FECHAR SE CLICAR FORA
    if (
      this.searchOpened &&
      !target.closest('.search-panel') &&
      !target.closest('.search-button')
    ) {
      this.closeSearch();
    }

    // ⋯ MENU MAIS — FECHAR SE CLICAR FORA
    if (
      this.showMenu &&
      !target.closest('.more-menu-card') &&
      !target.closest('.more-btn')
    ) {
      this.showMenu = false;
    }
  }

  // =====================================================
  // ABRIR / FECHAR BUSCA
  // =====================================================

  openSearch() {
    this.searchOpened = true;
  }

  closeSearch() {
    this.searchOpened = false;
    this.searchQuery = '';
    this.searchResults = [];
  }

  // =====================================================
  // BUSCAR RECEITAS ENQUANTO DIGITA
  // =====================================================

  onSearchChange(): void {
    const q = this.searchQuery.trim();

    if (q.length < 2) {
      this.searchResults = [];
      return;
    }

    this.recipeService.buscarReceitasPesquisa(q).subscribe({
      next: (results) => {
        this.searchResults = results || [];
      },
      error: () => {
        this.searchResults = [];
      }
    });
  }

  // =====================================================
  // ABRIR RECEITA AO CLICAR NO RESULTADO
  // =====================================================

  openRecipe(id: number): void {
    this.closeSearch();
    this.router.navigate(['/receita', id]);
  }

  getThumbUrl(relativePath: string | null): string {
    if (!relativePath) return 'assets/placeholder.png';
    if (relativePath.startsWith('http')) return relativePath;
    return `${BACKEND_URL}${relativePath}`;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;

    if (this.showMenu) {
      this.closeSearch();
    }
  }

  goHome() {
    this.router.navigate(['/feed']);
  }

  // ======= POPUP / LOGIN / LOGOUT =======

  trocarConta() {
    this.switchPopup.show(); 
  }

  loginOutraConta(data: any) {
  if (!data?.email || !data?.senha) {
    this.switchPopup.erroMensagem = "Preencha email e senha.";
    return;
  }

  this.authService.login({ email: data.email, senha: data.senha }).subscribe({
    next: (res) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user_id', res.user_id);

      this.switchPopup.hide();

      this.authService.getProfile().subscribe({
        next: (user) => {
          this.avatarUrl = user.foto_perfil_url
            ? `${BACKEND_URL}${user.foto_perfil_url}`
            : 'assets/canvo.png';
        }
      });

      this.router.navigate(['/feed']).then(() => window.location.reload());
    },

    error: (err) => {
      this.switchPopup.erroMensagem =
        err.error?.mensagem || "Email ou senha incorretos.";
    }
  });
}


  abrirPopupExcluir() {
  this.deletePopup.show(
    "Excluir conta?",
    "Digite sua senha para confirmar a exclusão. Esta ação é permanente.",
    true,  // modo confirmação
    true   // 🔥 exige input (senha)
  );
}

acaoPopup(senhaDigitada: string) {
  if (!this.deletePopup.isConfirmation) return;
  this.confirmarExclusao(senhaDigitada);
}

confirmarExclusao(senhaDigitada: string) {
  this.authService.deleteAccount(senhaDigitada).subscribe({
    next: () => {
      this.deletePopup.show(
        "Sucesso",
        "Sua conta foi excluída com sucesso.",
        false
      );

      this.deletePopup.confirmAction.subscribe(() => {
        localStorage.removeItem('token');
        this.router.navigate(['/home']);
      });
    },
    error: (err) => {
      this.deletePopup.show(
        "Erro",
        err.error?.mensagem || "Erro ao excluir conta.",
        false
      );
    }
  });
}


  fecharPopup() {}

  popupSucessoEsqueciSenha() {
    this.switchPopup.hide();

    this.deletePopup.show(
      "Email enviado!",
      "Confira sua caixa de entrada para redefinir sua senha.",
      false
    );

    const sub = this.deletePopup.confirmAction.subscribe(() => {
      sub.unsubscribe();
      this.switchPopup.show();
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/home']);
  }
}
