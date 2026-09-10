import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { useReviewShellStoreApi } from '../store/store.context';
import { useReviewShellRefs } from '../store/shell.refs';
import { createCustomPanelRegistry, type CustomPanelRegistry } from './registry';

const Context = createContext<CustomPanelRegistry | null>(null);

export function CustomPanelProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const store = useReviewShellStoreApi();
  const refs = useReviewShellRefs();
  const [registry] = useState(() => createCustomPanelRegistry(store));
  useLayoutEffect(() => { registry.setEnabled(enabled); }, [enabled, registry]);
  useLayoutEffect(() => {
    refs.invalidateCustomPanelsRef.current = registry.invalidate;
    registry.start();
    return () => {
      refs.invalidateCustomPanelsRef.current = null;
      registry.stop();
    };
  }, [refs, registry]);
  return <Context.Provider value={registry}>{children}</Context.Provider>;
}

export function useCustomPanelRegistry(): CustomPanelRegistry {
  const registry = useContext(Context);
  if (!registry) throw new Error('Custom panels require a ReviewShell provider');
  return registry;
}

export function CustomPanelHost() {
  const registry = useCustomPanelRegistry();
  return <div className="df-review-custom-panel-host" ref={registry.setHost} />;
}
