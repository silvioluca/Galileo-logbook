import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeAuth, signInGoogle, signOutUser } from '../services/authService';

// Unico account autorizzato a creare/eliminare schede, template e strumenti
// (vedi anche le Firestore security rules, che devono usare la stessa email).
const OWNER_EMAIL = 'silvio.phy@gmail.com';

const AuthContext = createContext({
  user: null,
  isOwner: false,
  loading: true,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isOwner = user?.email === OWNER_EMAIL;

  return (
    <AuthContext.Provider value={{ user, isOwner, loading, signIn: signInGoogle, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
