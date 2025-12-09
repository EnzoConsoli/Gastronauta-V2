import { Component, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    this.generateStars(150);
  }

  // ------------------------------------
  // ACESSO SEGURO AO DOM
  // ------------------------------------
  getElement(selector: string): HTMLElement {
    const elem = this.el.nativeElement.querySelector(selector);
    if (!elem) console.error("❌ Elemento não encontrado:", selector);
    return elem;
  }

  // ------------------------------------
  // GERAR ESTRELAS
  // ------------------------------------
  generateStars(amount: number) {
    const wrapper = this.getElement('.stars-wrapper');
    if (!wrapper) return;

    for (let i = 0; i < amount; i++) {
      const star = this.renderer.createElement('div');
      this.renderer.addClass(star, 'star-img');

      this.renderer.setStyle(star, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(star, 'top', `${Math.random() * 100}%`);
      this.renderer.setStyle(star, 'width', `${10 + Math.random() * 12}px`);
      this.renderer.setStyle(star, 'height', star.style.width);
      this.renderer.setStyle(star, 'animationDelay', `${Math.random() * 3}s`);

      this.renderer.appendChild(wrapper, star);
    }
  }

}
