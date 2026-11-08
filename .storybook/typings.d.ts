declare module '*.md' {
  const content: string;
  export default content;
}

declare module '@storybook/angular/client/config' {
  export const renderToCanvas:
    NonNullable<import('@storybook/angular').Preview['renderToCanvas']>;
}
