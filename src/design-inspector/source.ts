export type DesignInspectorSourceLocation = {
  /** Source-map compatible file path or file URL. */
  file: string;
  /** Short project-relative path shown in the inspector. */
  displayPath: string;
  /** One-based source position. */
  line: number;
  column: number;
};

export type DesignInspectorSourceOptions = {
  /** Resolve only the selected element. Implementations should avoid document-wide scans. */
  resolve(
    element: Element
  ): DesignInspectorSourceLocation | null | Promise<DesignInspectorSourceLocation | null>;
  /** Open an explicitly selected location in the host application's editor adapter. */
  open(location: DesignInspectorSourceLocation): void | Promise<void>;
};
