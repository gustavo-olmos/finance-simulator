/** @jsxImportSource @vercel/og/jsx-runtime */
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// Formata número como BRL sem depender de Intl (Edge tem suporte limitado)
function brl(n: number): string {
  const s = Math.round(Math.abs(n)).toString();
  const groups: string[] = [];
  for (let i = s.length; i > 0; i -= 3) {
    groups.unshift(s.slice(Math.max(0, i - 3), i));
  }
  return `R$ ${groups.join('.')}`;
}

function taxaMensal(taxaAnual: number): number {
  return taxaAnual <= 0 ? 0 : Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
}

function calcular(
  valorBem: number,
  entrada: number,
  prazoMeses: number,
  taxaAnual: number,
  seguroMensal: number,
  sistema: 'SAC' | 'PRICE',
): { parcela: number; total: number; juros: number } {
  const principal = Math.max(0, valorBem - entrada);
  if (principal <= 0 || prazoMeses <= 0) return { parcela: 0, total: 0, juros: 0 };

  const i = taxaMensal(taxaAnual);
  const s = Math.max(0, seguroMensal / 100);
  let totalPago = 0;
  let totalJuros = 0;
  let saldo = principal;
  let primeiraParcela = 0;

  if (sistema === 'SAC') {
    const amort = principal / prazoMeses;
    for (let k = 1; k <= prazoMeses; k++) {
      const juros = saldo * i;
      const seguro = saldo * s;
      const parcela = amort + juros + seguro;
      if (k === 1) primeiraParcela = parcela;
      totalPago += parcela;
      totalJuros += juros;
      saldo = Math.max(0, saldo - amort);
    }
  } else {
    const base = i > 0 ? (principal * i) / (1 - Math.pow(1 + i, -prazoMeses)) : principal / prazoMeses;
    for (let k = 1; k <= prazoMeses; k++) {
      const juros = saldo * i;
      const seguro = saldo * s;
      const amort = base - juros;
      const parcela = base + seguro;
      if (k === 1) primeiraParcela = parcela;
      totalPago += parcela;
      totalJuros += juros;
      saldo = Math.max(0, saldo - amort);
    }
  }

  return { parcela: primeiraParcela, total: totalPago, juros: totalJuros };
}

export default function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const valorBem     = parseFloat(searchParams.get('valor')   ?? '300000');
    const entrada      = parseFloat(searchParams.get('entrada') ?? '60000');
    const prazoMeses   = parseInt(searchParams.get('prazo')     ?? '360');
    const taxaAnual    = parseFloat(searchParams.get('taxa')    ?? '10.5');
    const seguroMensal = parseFloat(searchParams.get('seguro')  ?? '0');
    const sistema      = (searchParams.get('sistema') ?? 'SAC') as 'SAC' | 'PRICE';

    const { parcela, total, juros } = calcular(valorBem, entrada, prazoMeses, taxaAnual, seguroMensal, sistema);

    const isSAC  = sistema === 'SAC';
    const bgFrom = isSAC ? '#1a7a4f' : '#c0820e';
    const bgTo   = isSAC ? '#0d4d2e' : '#7a5010';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: `linear-gradient(145deg, ${bgFrom} 0%, ${bgTo} 100%)`,
            padding: '64px 80px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.02em' }}>
              Simulae
            </span>
            <span
              style={{
                background: 'rgba(0,0,0,0.22)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 800,
                padding: '7px 18px',
                borderRadius: '100px',
                letterSpacing: '0.1em',
              }}
            >
              {sistema}
            </span>
          </div>

          {/* Parcela principal */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '10px',
              }}
            >
              Parcela inicial
            </span>
            <span
              style={{
                fontSize: '84px',
                fontWeight: 800,
                color: '#fff',
                lineHeight: '1',
                letterSpacing: '-0.035em',
                marginBottom: '44px',
              }}
            >
              {brl(parcela)}
            </span>

            {/* Chips */}
            <div style={{ display: 'flex', gap: '14px' }}>
              {(
                [
                  { label: 'Total a pagar', value: brl(total) },
                  { label: 'Juros',         value: brl(juros) },
                  { label: 'Prazo',         value: `${prazoMeses} meses` },
                ] as const
              ).map((chip) => (
                <div
                  key={chip.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '14px',
                    padding: '16px 22px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.55)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '6px',
                    }}
                  >
                    {chip.label}
                  </span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                    {chip.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginTop: '28px' }}>
            simulae.com.br · simulador gratuito de financiamento
          </span>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
      },
    );
  } catch {
    return new Response('Erro ao gerar imagem', { status: 500 });
  }
}
