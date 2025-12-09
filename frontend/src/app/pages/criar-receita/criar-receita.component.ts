import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';
import { PopupComponent } from '../../shared/popup/popup.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, } from '@angular/common';
import { TagsSelectorComponent } from '../../shared/tags-selector/tags-selector.component';



@Component({
  selector: 'app-criar-receita',
  standalone: true,
  imports: [
  FormsModule,
  CommonModule,
  PopupComponent,
  TagsSelectorComponent   // ✅ AQUI
],
  templateUrl: './criar-receita.component.html',
  styleUrls: ['./criar-receita.component.css']
  
})
export class CriarReceitaComponent implements AfterViewInit, OnInit {
  @ViewChild('recipePopup') popup!: PopupComponent;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  selectedTags: number[] = [];

  // 🔥 ADICIONADO: origem da navegação
  origem: string | null = null;

  recipeData = {
    prato: '',
    descricao: '',
    dificuldade: 'Fácil',
    custo: 'Médio',
    tempo_preparo: '',
    rendimento: '',
    ingredientes: '',
    preparacao: '',
    cozimento: '',
  };

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  uploadError: string | null = null;
  isLoading = false;

  triedSubmit = false;

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute   // ← ADICIONADO
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.origem = params['from'] || null;   // ← ADICIONADO
    });
  }

  ngAfterViewInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];

      if (!allowed.includes(file.type)) {
        this.uploadError = 'Formato inválido. Envie JPG, PNG ou WEBP.';
        this.resetFileInput();
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = 'A imagem deve ter no máximo 5MB.';
        this.resetFileInput();
        return;
      }

      this.selectedFile = file;
      this.uploadError = null;

      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(file);
    } else {
      this.resetFileInput();
    }
  }

  resetFileInput(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  onSubmit(form: NgForm): void {
    this.triedSubmit = true;

    const requiredFilled =
      !!this.recipeData.prato &&
      !!this.recipeData.ingredientes &&
      !!this.recipeData.preparacao &&
      !!this.selectedFile;

    if (!requiredFilled) {
      this.popup.show(
        'Atenção!',
        'Antes de publicar, verifique se você preencheu todos os campos obrigatórios e adicionou uma foto da receita. 😊'
      );
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
for (const key of Object.keys(this.recipeData)) {
  formData.append(key, (this.recipeData as any)[key] || '');
}

formData.append("tags", JSON.stringify(this.selectedTags)); // ✅ FORA DO LOOP
formData.append("imagemReceita", this.selectedFile!, this.selectedFile!.name);


    this.recipeService.criar(formData).subscribe({
      next: () => {
        this.isLoading = false;

        this.popup.show('Receita publicada!', 'Sua receita foi enviada com sucesso! 🎉');

        form.resetForm({ dificuldade: 'Fácil', custo: 'Médio' });
        this.resetFileInput();
        this.triedSubmit = false;
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.mensagem || 'Erro ao enviar receita.';
        this.popup.show('Erro!', msg);
      }
    });
  }

  // 🔥 COMPLETAMENTE SUBSTITUÍDO
  onPopupConfirm(): void {
    if (this.origem === 'perfil') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  voltar(): void {
    this.location.back();
  }
}
