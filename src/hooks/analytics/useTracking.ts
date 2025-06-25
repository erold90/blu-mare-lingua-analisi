
import { useSimpleTracking } from './useSimpleTracking';

// Alias per compatibilità - usa il sistema di tracking semplificato
export function useTracking() {
  return useSimpleTracking();
}
