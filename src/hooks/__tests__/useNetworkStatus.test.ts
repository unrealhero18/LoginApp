import NetInfo from '@react-native-community/netinfo';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const mockedNetInfo = jest.mocked(NetInfo);
const mockUnsubscribe = jest.fn();

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(),
    addEventListener: jest.fn(),
  },
}));

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNetInfo.addEventListener.mockReturnValue(mockUnsubscribe);
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: null } as never);
  });

  it('returns null before the initial fetch resolves', () => {
    mockedNetInfo.fetch.mockReturnValue(new Promise(() => {}) as never);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isConnected).toBeNull();
  });

  it('seeds isConnected from NetInfo.fetch() on mount', async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as never);
    const { result } = renderHook(() => useNetworkStatus());
    await waitFor(() => expect(result.current.isConnected).toBe(true));
  });

  it('updates isConnected when the addEventListener callback fires', async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as never);
    const { result } = renderHook(() => useNetworkStatus());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    const listener = (mockedNetInfo.addEventListener as jest.Mock).mock
      .calls[0][0] as (state: { isConnected: boolean | null }) => void;

    act(() => {
      listener({ isConnected: false });
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('removes the event listener on unmount', async () => {
    const { unmount } = renderHook(() => useNetworkStatus());
    await act(async () => {});
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
