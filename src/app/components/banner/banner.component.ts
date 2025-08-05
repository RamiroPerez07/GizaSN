import { Component } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent {
  phrases = [
    '¡ENVÍOS GRATUITOS A TU DOMICILIO!',
    'SAN NICOLÁS DE LOS ARROYOS',
    'VILLA CONSTITUCIÓN',
    'ROSARIO',
    'SAN PEDRO',
    'RAMALLO',
    'BARADERO',
  ];

  displayText = '';
  private phraseIndex = 0;
  private charIndex = 0;
  private deleting = false;

  ngOnInit() {
    this.typeEffect();
  }

  typeEffect() {
    const currentPhrase = this.phrases[this.phraseIndex];
    
    if (!this.deleting && this.charIndex < currentPhrase.length) {
      this.displayText += currentPhrase.charAt(this.charIndex);
      this.charIndex++;
    } else if (this.deleting && this.charIndex > 0) {
      this.displayText = currentPhrase.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else if (!this.deleting && this.charIndex === currentPhrase.length) {
      // Pausa antes de borrar
      this.deleting = true;
      setTimeout(() => this.typeEffect(), 1500);
      return;
    } else if (this.deleting && this.charIndex === 0) {
      this.deleting = false;
      this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
    }

    const speed = this.deleting ? 50 : 50; // velocidad de borrado vs escritura
    setTimeout(() => this.typeEffect(), speed);
  }
}
