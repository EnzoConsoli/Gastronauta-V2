import { Component, Input, Output, EventEmitter, } from '@angular/core';
import { ALL_TAGS, Tag } from '../../data/tags.data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tags-selector',
  standalone: true,   // ⬅ ADICIONE ISTO
  templateUrl: './tags-selector.component.html',
  styleUrls: ['./tags-selector.component.css'],
  imports: [CommonModule] // ⬅ IMPORTAÇÃO NECESSÁRIA PARA *ngFor e ngStyle
})

export class TagsSelectorComponent {
  @Input() selected: number[] = [];
  @Output() selectedChange = new EventEmitter<number[]>();

  tags = ALL_TAGS;

  grupos = [
    { id: 'tipo', label: '🍽️ Tipo de Prato (1 obrigatório)' },
    { id: 'metodo', label: '🔥 Método de Preparo' },
    { id: 'dieta', label: '🥗 Dietas / Restrições' },
    { id: 'sabor', label: '🌱 Sabor / Temperamento' }
  ];

  tagsPorGrupo(grupo: string) {
    return this.tags.filter(t => t.grupo === grupo);
  }

  isSelected(tagId: number) {
    return this.selected.includes(tagId);
  }

  toggle(tag: Tag) {
    // Exclusivo
    if (tag.exclusivo) {
      const outros = this.tags
        .filter(t => t.grupo === tag.grupo)
        .map(t => t.id);

      this.selected = this.selected.filter(id => !outros.includes(id));
      this.selected.push(tag.id);
    } else {
      // Multiselect normal
      if (this.isSelected(tag.id)) {
        this.selected = this.selected.filter(id => id !== tag.id);
      } else {
        this.selected.push(tag.id);
      }
    }

    this.selectedChange.emit(this.selected);
  }
}
