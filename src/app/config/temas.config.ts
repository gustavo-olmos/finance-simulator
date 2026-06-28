import { TemaConfig, TemaId } from '../models/tema.model';

/**
 * Configuração das landing pages temáticas. Adicionar um novo tema (ex.: consignado)
 * é só acrescentar uma entrada aqui e uma rota em app.routes.ts — o restante reaproveita
 * os mesmos componentes e serviços.
 */
export const TEMAS: Record<TemaId, TemaConfig> = {
  imovel: {
    id: 'imovel',
    labelValor: 'Valor do imóvel',
    defaults: { valorBem: 300000, entrada: 60000, taxaAnual: 10.5, prazoMeses: 360 },
    faixas: {
      bemMin: 50000, bemMax: 2000000, bemStep: 5000,
      prazoMin: 12, prazoMax: 420, prazoStep: 12,
      taxaMin: 4, taxaMax: 20, taxaStep: 0.1,
    },
    seo: {
      titulo: 'Simulador de Financiamento de Imóvel — SAC e PRICE | Simulae',
      descricao: 'Simule o financiamento do seu imóvel com os sistemas SAC e PRICE. Veja parcelas, juros e total a pagar em tempo real, sem cadastro.',
      h2: 'Como funciona o simulador de financiamento de imóvel',
      intro: 'O cálculo usa o valor do imóvel menos a entrada (o valor financiado), o prazo em meses e a taxa de juros anual, convertida para a taxa mensal equivalente. A partir daí, mostramos a evolução das parcelas nos dois sistemas de amortização.',
    },
  },
  veiculo: {
    id: 'veiculo',
    labelValor: 'Valor do veículo',
    defaults: { valorBem: 80000, entrada: 16000, taxaAnual: 23, prazoMeses: 48 },
    faixas: {
      bemMin: 10000, bemMax: 500000, bemStep: 1000,
      prazoMin: 12, prazoMax: 72, prazoStep: 12,
      taxaMin: 8, taxaMax: 36, taxaStep: 0.5,
    },
    seo: {
      titulo: 'Simulador de Financiamento de Veículo — SAC e PRICE | Simulae',
      descricao: 'Simule o financiamento do seu carro ou moto com os sistemas SAC e PRICE. Parcelas, juros e total a pagar em tempo real, sem cadastro.',
      h2: 'Como funciona o simulador de financiamento de veículo',
      intro: 'O cálculo usa o valor do veículo menos a entrada (o valor financiado), o prazo em meses e a taxa de juros anual, convertida para a taxa mensal equivalente. A partir daí, mostramos a evolução das parcelas nos dois sistemas de amortização.',
    },
  },
};

export function getTema(id: TemaId | string | undefined): TemaConfig {
  return TEMAS[(id as TemaId)] ?? TEMAS.imovel;
}
