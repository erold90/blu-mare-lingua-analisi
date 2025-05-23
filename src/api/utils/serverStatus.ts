
/**
 * Server status utilities
 */

import { toast } from "sonner";
import { pingApi } from "../endpoints/ping";
import { getOfflineMode, setOfflineMode } from "../config";

export const checkServerStatus = async () => {
  try {
    const pingResult = await pingApi.check();
    
    if (pingResult.success && getOfflineMode()) {
      setOfflineMode(false);
      toast.success('Connessione al server ripristinata', {
        description: 'L\'app è tornata alla modalità online'
      });
    }
    
    return pingResult;
  } catch (error) {
    if (!getOfflineMode()) {
      setOfflineMode(true);
      toast.warning('Passaggio automatico alla modalità offline', {
        description: 'L\'app funzionerà con dati locali fino al ripristino della connessione'
      });
    }
    
    return {
      success: false,
      error: 'Server non raggiungibile, modalità offline attiva'
    };
  }
};

export const setOfflineModeManual = (offline: boolean) => {
  setOfflineMode(offline);
  
  if (offline) {
    toast.info('Modalità offline attivata', {
      description: 'L\'app funzionerà solo con dati locali'
    });
  } else {
    toast.info('Modalità offline disattivata', {
      description: 'L\'app tenterà di connettersi al server'
    });
    checkServerStatus();
  }
  
  return getOfflineMode();
};

export const isOfflineMode = () => {
  return getOfflineMode();
};
