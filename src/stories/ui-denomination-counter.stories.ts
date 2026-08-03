import type { Meta, StoryObj } from '@storybook/angular';
import {
  DenominationCounter,
  DenominationDefinition,
} from '../app/shared/ui/organisms/denomination-counter/denomination-counter';

const penDenominations: readonly DenominationDefinition[] = [
  { code: 'PEN_200', value: 200, label: 'S/ 200', description: 'Billete' },
  { code: 'PEN_100', value: 100, label: 'S/ 100', description: 'Billete' },
  { code: 'PEN_50', value: 50, label: 'S/ 50', description: 'Billete' },
  { code: 'PEN_20', value: 20, label: 'S/ 20', description: 'Billete' },
  { code: 'PEN_10', value: 10, label: 'S/ 10', description: 'Billete' },
  { code: 'PEN_5', value: 5, label: 'S/ 5', description: 'Moneda' },
  { code: 'PEN_2', value: 2, label: 'S/ 2', description: 'Moneda' },
  { code: 'PEN_1', value: 1, label: 'S/ 1', description: 'Moneda' },
  { code: 'PEN_050', value: 0.5, label: 'S/ 0.50', description: 'Moneda' },
  { code: 'PEN_020', value: 0.2, label: 'S/ 0.20', description: 'Moneda' },
  { code: 'PEN_010', value: 0.1, label: 'S/ 0.10', description: 'Moneda' },
];

const meta: Meta<DenominationCounter> = {
  title: 'Organisms/Denomination Counter',
  component: DenominationCounter,
  args: {
    title: 'Efectivo recibido',
    description: 'Cuente los billetes y monedas.',
    denominations: penDenominations,
    optional: true,
    open: false,
  },
};

export default meta;
type Story = StoryObj<DenominationCounter>;

export const Default: Story = {};

export const DetailedAudit: Story = {
  args: {
    optional: false,
    open: true,
  },
};

export const Empty: Story = {
  args: {
    denominations: [],
  },
};
