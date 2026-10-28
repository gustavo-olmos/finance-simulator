import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TemaId } from '../../models/tema.model';

/** "Escolha o que você quer financiar" da página inicial: um card por simulador. */
@Component({
  selector: 'app-inicio-simuladores',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-simuladores.component.html',
  styleUrl: './inicio-simuladores.component.scss',
})
export class InicioSimuladoresComponent {
  readonly simuladores = [
    {
      tema: 'imovel' as TemaId,
      rota: '/financiamento-imovel',
      titulo: 'Financiamento de imóvel',
      curto: 'Imóvel',
      descricao: 'Casa, apartamento ou terreno. Veja quanto a entrada e o prazo mudam a parcela e o total de juros.',
      resumo: 'Casa, apartamento ou terreno',
      chips: ['Casa', 'Apartamento', 'Terreno'],
      acao: 'Simular imóvel',
    },
    {
      tema: 'veiculo' as TemaId,
      rota: '/financiamento-veiculo',
      titulo: 'Financiamento de veículo',
      curto: 'Veículo',
      descricao: 'Carro novo, seminovo ou moto. Compare prazos e descubra quanto uma entrada maior reduz a parcela.',
      resumo: 'Carro 0 km, seminovo ou moto',
      chips: ['Carro 0 km', 'Seminovo', 'Moto'],
      acao: 'Simular veículo',
    },
  ];
}
