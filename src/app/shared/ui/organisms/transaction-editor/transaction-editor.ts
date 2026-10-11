import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Disposición proyectada del editor, sin formularios, operaciones ni dominio.
 * Slots públicos: transactionSection, transactionToolbar, transactionColumns,
 * transactionLine, transactionPayment, transactionNumeric, transactionTotal,
 * transactionTotals, transactionActions y transactionTone (neutral/success/danger).
 * transactionCell contiene la etiqueta adaptable; transactionLabel vincula
 * etiquetas accesibles sin duplicar la cabecera visual en escritorio.
 * No se permite estilizar la estructura interna de los controles proyectados.
 */
@Component({
  selector: 'app-transaction-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './transaction-editor.html',
  styleUrl: './transaction-editor.scss',
})
export class TransactionEditor {}
