import { afterNextRender, Component, DestroyRef, ElementRef, inject, NgZone, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FinanceCalculatorService } from '../../core/finance-calculator.service';
import { SeoService } from '../../core/seo.service';
import { AdSlotComponent } from '../../components/ad-slot/ad-slot.component';
import { InicioTopoComponent } from '../../components/inicio-topo/inicio-topo.component';
import { CalculadoraRapidaComponent, VALORES_INICIAIS } from '../../components/calculadora-rapida/calculadora-rapida.component';
import { InicioSimuladoresComponent } from '../../components/inicio-simuladores/inicio-simuladores.component';
import { ComoFuncionaComponent } from '../../components/como-funciona/como-funciona.component';
import { InicioParceirosComponent } from '../../components/inicio-parceiros/inicio-parceiros.component';
import { InicioGuiasComponent } from '../../components/inicio-guias/inicio-guias.component';
import { InicioDuvidasComponent } from '../../components/inicio-duvidas/inicio-duvidas.component';
import { InicioChamadaComponent } from '../../components/inicio-chamada/inicio-chamada.component';
import { InicioRodapeComponent } from '../../components/inicio-rodape/inicio-rodape.component';
import { FAQ_INICIO } from '../../config/conteudo.config';
import { SITE } from '../../config/site.config';

/**
 * Página inicial (/): apresenta a RotaFin, com uma calculadora rápida que leva ao
 * simulador completo já preenchido. Design em docs/landingpage/. Cada seção é um
 * componente; parceiros, guias e AdSense só aparecem quando há conteúdo configurado
 * (conteudo.config.ts / site.config.ts).
 */
@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [
    AdSlotComponent,
    InicioTopoComponent,
    CalculadoraRapidaComponent,
    InicioSimuladoresComponent,
    ComoFuncionaComponent,
    InicioParceirosComponent,
    InicioGuiasComponent,
    InicioDuvidasComponent,
    InicioChamadaComponent,
    InicioRodapeComponent,
  ],
  templateUrl: './inicio-page.component.html',
  styleUrl: './inicio-page.component.scss',
})
export class InicioPageComponent implements OnInit {
  private readonly calc = inject(FinanceCalculatorService);
  private readonly seo = inject(SeoService);
  private readonly doc = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly adsenseSlot = SITE.adsense.slots.inicio;
  readonly beneficios = ['Grátis', 'Sem cadastro', 'Resultado na hora'];

  constructor() {
    afterNextRender(() => {
      const win = this.doc.defaultView;
      if (!win || win.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      this.zone.runOutsideAngular(() => this.revelarAoRolar(win));
    });
  }

  ngOnInit(): void {
    this.seo.aplicar({
      titulo: 'Simulador de Financiamento de Imóvel e Veículo | RotaFin',
      descricao: 'Saiba quanto vai pagar antes de assinar: simule a parcela da casa ou do carro, veja quanto vai de juros e ajuste entrada e prazo. Grátis e sem cadastro.',
      canonicalPath: '/',
    });

    // Imagem de compartilhamento com a simulação de exemplo da calculadora (imóvel, Price).
    const origin = this.doc.location?.origin || this.seo.ORIGIN;
    const og = new URL(`${origin}/api/og`);
    const c = VALORES_INICIAIS.imovel;
    og.searchParams.set('valor', String(c.valor));
    og.searchParams.set('entrada', String(c.entrada));
    og.searchParams.set('prazo', String(c.prazo));
    og.searchParams.set('taxa', this.calc.taxaAnualPercentual(c.taxaMes).toFixed(6));
    og.searchParams.set('seguro', '0');
    og.searchParams.set('sistema', 'PRICE');
    this.seo.setOgImage(og.toString());

    this.seo.injetarJsonLd('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'RotaFin',
      url: this.seo.ORIGIN,
    });

    this.seo.injetarJsonLd('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'RotaFin',
      url: this.seo.ORIGIN,
      inLanguage: 'pt-BR',
    });

    this.seo.injetarJsonLd('faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_INICIO.map((f) => ({
        '@type': 'Question',
        name: f.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: f.resposta },
      })),
    });
  }

  /**
   * Blocos [data-revelar] (nas seções filhas) sobem e aparecem ao entrar na tela; o CSS
   * fica em styles.scss. Só esconde o que ainda está abaixo da dobra: o que já está
   * visível fica como veio do servidor.
   */
  private revelarAoRolar(win: Window): void {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('visivel');
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    this.host.nativeElement.querySelectorAll<HTMLElement>('[data-revelar]').forEach((el) => {
      if (el.getBoundingClientRect().top < win.innerHeight) return;
      el.classList.add('revelar');
      io.observe(el);
    });
    this.destroyRef.onDestroy(() => io.disconnect());
  }
}
