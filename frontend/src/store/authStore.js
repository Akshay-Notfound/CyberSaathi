import useStore from './useStore';

// Adapter to support useAuthStore style ({ login, loading, error, user, token })
export const useAuthStore = useStore;
export default useStore;
