import { afterNextRender, Component, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { track } from '@vercel/analytics';
import { AnuncioService } from '../../core/anuncio.service';
import { SeoService } from '../../core/seo.service';
import { SimulacaoStore } from '../../core/simulacao.store';
import { UltimaSimulacaoService } from '../../core/ultima-simulacao.service';
import { brl, brl0, NBSP } from '../../core/formato';
import { copiarTexto } from '../../core/clipboard';
import { imagemRedimensionada } from '../../core/imagem';
import { linkWhatsapp, mensagemAnuncio } from '../../core/whatsapp';
import { getTema } from '../../config/temas.config';
import { SITE } from '../../config/site.config';
import { Anuncio } from '../../models/anuncio.model';
import { SiteHeaderComponent } from '../../components/site-header/site-header.component';
import { SiteFooterComponent } from '../../components/site-footer/site-footer.component';
import { GaleriaAnuncioComponent } from '../../components/galeria-anuncio/galeria-anuncio.component';
import { PainelAnuncioComponent } from '../../components/painel-anuncio/painel-anuncio.component';
import { OutrosAnunciosComponent } from '../../components/outros-anuncios/outros-anuncios.component';
import { AdSlotComponent } from '../../components/ad-slot/ad-slot.component';
import { BarraWhatsappComponent } from '../../components/barra-whatsapp/barra-whatsapp.component';

/**
 * Página do anúncio (/anuncios/:slug) — rota dinâmica de SEO. Renderiza no SSR com
 * title/description/og/canonical do anúncio. A simulação começa com o preço do anúncio
 * e, no navegador, com a entrada (%), o prazo e a taxa da última simulação do usuário
 * (localStorage); ajustes feitos aqui também passam a ser a "última simulação".
 */
@Component({
  selector: 'app-anuncio-detalhe',
  standalone: true,
  imports: [
    RouterLink,
    SiteHeaderComponent,
    SiteFooterComponent,
    GaleriaAnuncioComponent,
    PainelAnuncioComponent,
    OutrosAnunciosComponent,
    AdSlotComponent,
    BarraWhatsappComponent,
  ],
  providers: [SimulacaoStore],
  templateUrl: './anuncio-detalhe.component.html',
  styleUrl: './anuncio-detalhe.component.scss',
})
export class AnuncioDetalheComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly anuncioService = inject(AnuncioService);
  private readonly seo = inject(SeoService);
  private readonly ultima = inject(UltimaSimulacaoService);
  private readonly doc = inject(DOCUMENT);
  readonly store = inject(SimulacaoStore);

  protected readonly fmt = { brl, brl0 };
  readonly adsenseSlot = SITE.adsense.slots.anuncio;

  /** Se a simulação veio do localStorage (muda o texto do painel). */
  readonly simulacaoSalva = signal(false);
  /** Valor do bem da última simulação no simulador (link "Voltar à minha simulação"). */
  private readonly valorSalvo = signal<number | null>(null);

  /** null = carregando; undefined = slug inexistente. */
  readonly anuncio = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('slug') ?? ''),
      switchMap((slug) => this.anuncioService.getPorSlug(slug)),
      // Prepara a simulação antes da primeira renderização (inclusive no SSR).
      tap((a) => a && this.prepararSimulacao(a)),
    ),
    { initialValue: null },
  );

  readonly anuncios = toSignal(this.anuncioService.getTodos(), { initialValue: [] });

  readonly tema = this.store.tema;
  readonly sac = computed(() => this.store.resultado().sac);

  readonly localizacao = computed(() => {
    const a = this.anuncio();
    if (!a) return '';
    const local = [a.bairro, a.cidade].filter(Boolean).join(', ');
    return a.uf ? `${local} – ${a.uf}` : local;
  });

  /** "Condomínio R$ X · IPTU R$ Y/ano" — só o que vier preenchido. */
  readonly custos = computed(() => {
    const a = this.anuncio();
    if (!a) return null;
    const cond = a.condominio != null ? brl0(a.condominio) : null;
    const iptu = a.iptu_anual != null ? `IPTU ${brl0(a.iptu_anual)}/ano` : null;
    if (!cond && !iptu) return null;
    return {
      desk: [cond && `Condomínio ${cond}`, iptu].filter(Boolean).join(' · '),
      mob: [cond && `Cond. ${cond}`, iptu].filter(Boolean).join(' · '),
    };
  });

  readonly caracteristicas = computed(() => {
    const a = this.anuncio();
    if (!a) return [];
    const itens: { rotulo: string; valor: string | number | null | undefined }[] =
      a.categoria === 'veiculo'
        ? [
            { rotulo: 'Ano', valor: a.ano },
            { rotulo: 'Km', valor: a.km != null ? a.km.toLocaleString('pt-BR') : null },
          ]
        : [
            { rotulo: 'Área', valor: a.area_m2 != null ? `${a.area_m2}${NBSP}m²` : null },
            { rotulo: 'Quartos', valor: a.quartos },
            { rotulo: 'Banheiros', valor: a.banheiros },
            { rotulo: 'Vagas', valor: a.vagas },
          ];
    return itens.filter((c) => c.valor != null && c.valor !== '');
  });

  readonly mensagem = computed(() => {
    const a = this.anuncio();
    return a ? mensagemAnuncio(a.titulo, this.store.entrada(), this.store.prazoAnos(), this.sac().primeiraParcela) : '';
  });

  readonly linkWhatsapp = computed(() => {
    const a = this.anuncio();
    return a?.whatsapp ? linkWhatsapp(a.whatsapp, this.mensagem()) : null;
  });

  readonly linkTelefone = computed(() => {
    const a = this.anuncio();
    const tel = a?.telefone || a?.whatsapp;
    return tel ? `tel:+${tel}` : null;
  });

  /** "CRECI 12345 · Cidade" (no celular só o CRECI). */
  readonly creci = computed(() => {
    const a = this.anuncio();
    const creci = a?.anunciante_creci ? `CRECI ${a.anunciante_creci}` : '';
    const desk = [creci, a?.cidade].filter(Boolean).join(' · ');
    return desk ? { desk, mob: creci } : null;
  });

  readonly logoAnunciante = computed(() => imagemRedimensionada(this.anuncio()?.anunciante_logo_url, 112, 112));

  /** Volta ao simulador do tema com a última simulação (sem valor salvo, volta aos padrões). */
  readonly voltar = computed(() => {
    const link = this.tema().id === 'veiculo' ? '/financiamento-veiculo' : '/financiamento-imovel';
    const valor = this.valorSalvo();
    if (valor == null) return { link, queryParams: null };
    return {
      link,
      queryParams: {
        valor,
        entrada: Math.round(valor * this.store.entradaFracao()),
        prazo: this.store.prazoMeses(),
        taxa: this.store.taxa(),
        seguro: this.store.seguro(),
      },
    };
  });

  readonly linkCopiado = signal(false);
  private salvarTimer: ReturnType<typeof setTimeout> | null = null;
  private renderizou = false;

  constructor() {
    afterNextRender(() => { this.renderizou = true; });

    // Ajustes feitos aqui viram a "última simulação" (sem trocar o valor do bem salvo).
    // Só depois de o usuário mexer, para não gravar os valores padrão.
    effect(() => {
      const a = this.anuncio();
      const ultima = { ...this.store.ultimaSimulacao(), valor: undefined };
      if (!a || !this.store.interagiu() || !this.renderizou) return;
      if (this.salvarTimer) clearTimeout(this.salvarTimer);
      this.salvarTimer = setTimeout(() => this.ultima.salvar(a.categoria, ultima), 400);
    });
  }

  private prepararSimulacao(a: Anuncio): void {
    const tema = getTema(a.categoria);
    const salva = this.ultima.ler(a.categoria);
    const passo = tema.faixas.entradaStep;
    this.store.inicializar(tema, {
      valorBem: a.preco,
      entrada: salva ? Math.round((a.preco * salva.entradaPct) / passo) * passo : null,
      prazoMeses: salva ? salva.prazoAnos * 12 : null,
      taxaAnual: salva?.taxa ?? null,
      seguroMensal: salva?.seguro ?? null,
    });
    this.simulacaoSalva.set(!!salva);
    this.valorSalvo.set(salva?.valor ?? null);

    const sac = this.store.resultado().sac.primeiraParcela;
    this.seo.aplicar({
      titulo: `${a.titulo} — Financiamento | RotaFin`,
      descricao: `${a.descricao} Simule: a partir de ${brl(sac)}/mês (SAC).`,
      imagem: a.imagem_url,
      canonicalPath: `/anuncios/${a.slug}`,
    });
  }

  registrarTelefone(): void {
    const a = this.anuncio();
    if (a) track('lead_telefone', { slug: a.slug });
  }

  /** Compartilhar do header no celular: menu nativo quando houver, senão copia o link. */
  async compartilhar(): Promise<void> {
    const a = this.anuncio();
    if (!a) return;
    const url = `${this.doc.location.origin}/anuncios/${a.slug}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: a.titulo, url });
        track('compartilhar', { canal: 'nativo', slug: a.slug });
      } catch {
        // Usuário fechou o menu de compartilhamento.
      }
      return;
    }
    await copiarTexto(this.doc, url);
    track('compartilhar', { canal: 'copiar_link', slug: a.slug });
    this.linkCopiado.set(true);
    setTimeout(() => this.linkCopiado.set(false), 2000);
  }
}
