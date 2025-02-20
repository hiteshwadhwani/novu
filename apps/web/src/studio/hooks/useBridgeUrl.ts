import { useLocalStorage } from '@mantine/hooks';
import { useLocation } from 'react-router-dom';
import { TUNNEL_URL_LOCAL_STORAGE_KEY } from '../../api/bridge/utils';
import { useEnvironment } from '../../hooks/useEnvironment';
import { isStudioRoute } from '../utils/isStudioRoute';

export const useBridgeUrl = () => {
  const { pathname } = useLocation();
  const { environment, isLoading } = useEnvironment();

  const [bridgeUrl] = useLocalStorage({ key: TUNNEL_URL_LOCAL_STORAGE_KEY });

  function setBridgeUrl(url: string) {
    localStorage.setItem(TUNNEL_URL_LOCAL_STORAGE_KEY, url);
  }

  return {
    bridgeUrl: isStudioRoute(pathname) ? bridgeUrl : environment?.echo?.url ?? '',
    setBridgeUrl,
    isLoading,
  };
};
