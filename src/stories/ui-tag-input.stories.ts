import type { Meta, StoryObj } from '@storybook/angular';
import { TagInputComponent } from '../app/shared/ui/molecules/tag-input/tag-input.component';
import { FormsModule } from '@angular/forms';

const meta: Meta<TagInputComponent> = {
  title: '2. Molecules/TagInput',
  component: TagInputComponent,
  tags: ['autodocs'],
  argTypes: {
    label:       { control: 'text' },
    placeholder: { control: 'text' },
    maxTags:     { control: 'number' },
    disabled:    { control: 'boolean' },
    error:       { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<TagInputComponent>;

export const Default: Story = {
  decorators: [
    () => ({
      props: { tags: ['Angular', 'TypeScript'] },
      template: `
        <app-tag-input
          label="Tecnologías"
          placeholder="Escribe y presiona Enter"
          [(ngModel)]="tags"
        ></app-tag-input>
        <p style="margin-top:.5rem;font-size:.85rem;color:var(--text-color-secondary)">
          Tags: {{ tags | json }}
        </p>
      `,
      imports: [TagInputComponent, FormsModule],
    }),
  ],
};

export const ConSugerencias: Story = {
  decorators: [
    () => ({
      props: {
        tags: [],
        options: [
          { value: 'angular', label: 'Angular' },
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
          { value: 'svelte', label: 'Svelte' },
          { value: 'nextjs', label: 'Next.js' },
        ],
      },
      template: `
        <app-tag-input
          label="Frameworks favoritos"
          placeholder="Selecciona o escribe"
          [options]="options"
          [(ngModel)]="tags"
        ></app-tag-input>
      `,
      imports: [TagInputComponent, FormsModule],
    }),
  ],
};

export const Deshabilitado: Story = {
  decorators: [
    () => ({
      props: { tags: ['Angular', 'RxJS'] },
      template: `
        <app-tag-input
          label="Tecnologías (solo lectura)"
          [disabled]="true"
          [(ngModel)]="tags"
        ></app-tag-input>
      `,
      imports: [TagInputComponent, FormsModule],
    }),
  ],
};

export const ConLimite: Story = {
  decorators: [
    () => ({
      props: { tags: ['HTML', 'CSS'] },
      template: `
        <app-tag-input
          label="Habilidades (máx. 3)"
          [maxTags]="3"
          [(ngModel)]="tags"
        ></app-tag-input>
      `,
      imports: [TagInputComponent, FormsModule],
    }),
  ],
};
