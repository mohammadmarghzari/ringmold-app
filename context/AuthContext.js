import { createContext, useContext, useEffect, useState } from "react";
  import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, ADMIN_EMAILS } from "../lib/firebase";
import { ensureUserProfile } from "../lib/walletHelpers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) ensureUserProfile(u);
});
    return unsub;
}, []);

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);
  const isAdmin = user ? ADMIN_EMAILS.includes(user.email) : false;

  return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
    {children}
        </AuthContext.Provider>
      );
  }

export const useAuth = () => useContext(AuthContext);
