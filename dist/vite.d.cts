import { Plugin } from 'vite';

type SourceLocatorPattern = string | RegExp;
interface ReviewSourceLocatorOptions {
    enabled?: boolean;
    root?: string;
    include?: readonly SourceLocatorPattern[];
    exclude?: readonly SourceLocatorPattern[];
    filePath?: 'relative' | 'absolute';
    line?: boolean;
    column?: boolean;
    attributePrefix?: string;
}
declare const reviewSourceLocator: (options?: ReviewSourceLocatorOptions) => Plugin;

export { type ReviewSourceLocatorOptions, reviewSourceLocator };
