declare module "@babel/standalone" {
  interface TransformOptions {
    presets?: string[];
    filename?: string;
    plugins?: string[];
  }

  export function transform(
    code: string,
    options: TransformOptions
  ): { code: string };
}
