import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { SITE } from '../../config/site.config';
import { PaginaTextoComponent } from '../../components/pagina-texto/pagina-texto.component';

const email = SITE.contato.email;
const mailto = (assunto?: string) => `mailto:${email}${assunto ? `?subject=${encodeURIComponent(assunto)}` : ''}`;

/**
 * Contato (/contato). Sem formulário (o site não tem backend): links de e-mail com o
 * assunto preenchido. #anunciar é o destino do "Quero anunciar" quando
 * SITE.anunciarUrl está vazio.
 */
@Component({
  selector: 'app-contato-page',
  standalone: true,
  imports: [RouterLink, PaginaTextoComponent],
  templateUrl: './contato-page.component.html',
})
export class ContatoPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly email = email;
  readonly links = {
    geral: mailto(),
    anunciar: mailto('Quero anunciar no RotaFin'),
    privacidade: mailto('Privacidade'),
  };

  ngOnInit(): void {
    this.seo.aplicar({
      titulo: 'Contato | RotaFin',
      descricao: 'Fale com o RotaFin: dúvidas, sugestões, erros no cálculo, anúncios para imobiliárias e concessionárias e pedidos sobre privacidade.',
      canonicalPath: '/contato',
    });
  }
}
