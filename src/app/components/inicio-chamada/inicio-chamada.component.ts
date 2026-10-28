import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Chamada final da página inicial ("Faça as contas antes de fechar negócio"), volta à calculadora do topo. */
@Component({
  selector: 'app-inicio-chamada',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-chamada.component.html',
  styleUrl: './inicio-chamada.component.scss',
})
export class InicioChamadaComponent {}
