import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore, setUnauthorizedHandler } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clear();
      setUser(null);
    });

    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    // Free hosting can take a while to wake up, so tell the user.
    const timer = setTimeout(() => setSlow(true), 3000);
    api
      .me()
      .then((d) => setUser(d.user))
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        setReady(true);
      });
    return () => clearTimeout(timer);
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await api.login({ email, password });
    tokenStore.set(d.token);
    setUser(d.user);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const d = await api.register({ name, email, password });
    tokenStore.set(d.token);
    setUser(d.user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, slow, login, register, logout }),
    [user, ready, slow, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
