import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { SITE } from '../../config/site.config';
import { PaginaTextoComponent } from '../../components/pagina-texto/pagina-texto.component';

/** Termos de uso (/termos). */
@Component({
  selector: 'app-termos-page',
  standalone: true,
  imports: [RouterLink, PaginaTextoComponent],
  templateUrl: './termos-page.component.html',
})
export class TermosPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly email = SITE.contato.email;

  ngOnInit(): void {
    this.seo.aplicar({
      titulo: 'Termos de uso | RotaFin',
      descricao: 'Regras para usar o RotaFin: as simulações são estimativas, o site não concede crédito e os anúncios são de responsabilidade dos anunciantes.',
      canonicalPath: '/termos',
    });
  }
}
