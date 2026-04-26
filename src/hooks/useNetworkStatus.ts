import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

import { logger } from '@/utils/logger';

export function useNetworkStatus(): { isConnected: boolean | null } {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    NetInfo.fetch()
      .then(state => {
        if (mounted) {
          setIsConnected(state.isConnected);
        }
      })
      .catch(() => {});

    const unsubscribe = NetInfo.addEventListener(state => {
      logger.info('[useNetworkStatus] connection changed', {
        isConnected: state.isConnected,
      });
      if (mounted) {
        setIsConnected(state.isConnected);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isConnected };
}
