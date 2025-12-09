import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { TagsSelectorComponent } from '../../shared/tags-selector/tags-selector.component';


@Component({
  selector: 'app-edit-recipe',
  standalone: true,
  imports: [
  CommonModule,
  ReactiveFormsModule,
  RouterLink,
  TagsSelectorComponent   // ✅ AQUI
],

  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.css']
})
export class EditRecipeComponent implements OnInit {
  selectedTags: number[] = [];
  recipeForm: FormGroup;
  recipeId!: number;
  isLoading = true;
  error: string | null = null;
  currentImageUrl: string | null = null;
  selectedFile: File | null = null;
  private originalRecipeData: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService
  ) {
    this.recipeForm = this.fb.group({
      prato: ['', [Validators.required, Validators.maxLength(40)]],
      descricao: ['', Validators.maxLength(200)],
      ingredientes: ['', [Validators.required, Validators.maxLength(1500)]],
      preparacao: ['', [Validators.required, Validators.maxLength(3000)]],
      tempo_preparo: [''],
      dificuldade: [''],
      custo: [''],
      rendimento: [''],
      cozimento: ['']
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error = 'ID da receita não fornecido.';
      this.isLoading = false;
      return;
    }
    this.recipeId = +idParam;

    this.recipeService.buscarPorId(this.recipeId).subscribe({
      next: (data) => {
        this.originalRecipeData = data;

        this.recipeForm.patchValue({
          prato: data.prato,
          descricao: data.descricao,
          ingredientes: data.ingredientes,
          preparacao: data.preparacao,
          tempo_preparo: data.tempo_preparo,
          dificuldade: data.dificuldade,
          custo: data.custo,
          rendimento: data.rendimento,
          cozimento: data.cozimento
        });

        if (data.url_imagem) {
          this.currentImageUrl = this.recipeService.getFullImageUrl(data.url_imagem);
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar a receita para edição.';
        this.isLoading = false;
      }
    });
    this.recipeService.buscarPorId(this.recipeId).subscribe(data => {
    this.selectedTags = (data.tags || []).map((t: any) => t.id);
});

  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentImageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.recipeForm.invalid) {
      this.error = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.isLoading = true;
    const formData = new FormData();

    Object.keys(this.recipeForm.controls).forEach((key) => {
  formData.append(key, this.recipeForm.get(key)?.value || '');
});

formData.append("tags", JSON.stringify(this.selectedTags)); // ✅ FORA DO LOOP


    if (this.selectedFile) {
      formData.append('imagemReceita', this.selectedFile);
    } else if (this.originalRecipeData.url_imagem) {
      formData.append('url_imagem_existente', this.originalRecipeData.url_imagem);
    }

    this.recipeService.atualizar(this.recipeId, formData).subscribe({
      next: () => {
        this.router.navigate(['/receita', this.recipeId]);
      },
      error: () => {
        this.error = 'Erro ao salvar as alterações. Tente novamente.';
        this.isLoading = false;
      }
    });
  }
}
