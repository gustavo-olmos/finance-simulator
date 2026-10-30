import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { SITE } from '../../config/site.config';
import { PaginaTextoComponent } from '../../components/pagina-texto/pagina-texto.component';

/**
 * Política de privacidade (/privacidade). Descreve o que o site faz hoje: hospedagem e
 * estatísticas da Vercel, simulação salva no navegador e contato direto com anunciantes.
 * As seções de Google Analytics e AdSense só aparecem com os IDs preenchidos em
 * site.config.ts (o AdSense exige essa divulgação).
 */
@Component({
  selector: 'app-privacidade-page',
  standalone: true,
  imports: [RouterLink, PaginaTextoComponent],
  templateUrl: './privacidade-page.component.html',
})
export class PrivacidadePageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly email = SITE.contato.email;
  readonly temGa4 = !!SITE.ga4.id;
  readonly temAdsense = !!SITE.adsense.client;

  readonly fornecedores = (() => {
    const google = [this.temGa4 && 'Analytics', this.temAdsense && 'AdSense'].filter(Boolean).join(' e ');
    const vercel = 'a Vercel (hospedagem e estatísticas)';
    return google ? `${vercel} e o Google (${google})` : vercel;
  })();

  ngOnInit(): void {
    this.seo.aplicar({
      titulo: 'Política de privacidade | RotaFin',
      descricao: 'Como o RotaFin trata as informações de quem usa o site: sem cadastro, estatísticas sem cookies e simulação guardada só no seu navegador.',
      canonicalPath: '/privacidade',
    });
  }
}
