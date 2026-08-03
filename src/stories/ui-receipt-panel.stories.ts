import type { Meta, StoryObj } from '@storybook/angular';
import { ReceiptPanel } from '../app/shared/ui/organisms/receipt-panel/receipt-panel';

const meta: Meta<ReceiptPanel> = {
  title: '3. Organisms/ReceiptPanel',
  component: ReceiptPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ReceiptPanel>;

export const PaymentReceipt: Story = {
  args: {
    title: 'Comprobante de pago',
    eyebrow: 'Operación confirmada',
    subtitle: 'Listo para una tiquetera térmica.',
    ariaLabel: 'Comprobante de demostración',
    fields: [
      { id: 'date', label: 'Fecha', value: '25/07/2026 08:30' },
      { id: 'operation', label: 'Operación', value: 'OP-DEMO-001' },
      { id: 'customer', label: 'Cliente', value: 'CLIENTE DE PRUEBA' },
      { id: 'amount', label: 'Monto', value: 'S/ 25.00', emphasis: true },
    ],
    printText: [
      '================================',
      '           RAPIDIARIO',
      '================================',
      'Operacion: OP-DEMO-001',
      'Monto: S/ 25.00',
      '================================',
    ].join('\n'),
  },
};
