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
interface ReviewDataLocatorOptions {
    enabled?: boolean;
    root?: string;
    include?: readonly SourceLocatorPattern[];
    exclude?: readonly SourceLocatorPattern[];
    filePath?: 'relative' | 'absolute';
    /** 매칭할 component 이름 패턴. 기본은 `Section`으로 시작하는 이름. */
    componentPattern?: RegExp;
    fileAttribute?: string;
    lineAttribute?: string;
}
/**
 * page data 파일의 section 객체(`component: 'SectionXxx'`)에 출처 파일/라인을
 * `__wrkDataFile`/`__wrkDataLine` prop 으로 주입한다. 라인 보존을 위해 같은 줄에만 삽입한다.
 */
declare const reviewDataLocator: (options?: ReviewDataLocatorOptions) => Plugin;

export { type ReviewDataLocatorOptions, type ReviewSourceLocatorOptions, reviewDataLocator, reviewSourceLocator };
