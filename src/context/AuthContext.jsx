import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
            // Fetch the Firestore user doc
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const data = userDoc.exists() ? userDoc.data() : {};

            // Merge both Firebase Auth user and Firestore fields
            setUser({
                ...firebaseUser,
                displayName: data.name || firebaseUser.displayName || null,
                role: data.role || null,
            });
            } else {
            setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
        }, []);

    function logout() {
        return signOut(auth);
    }
    
    const value = { user, loading, logout };

    return (
      <AuthContext.Provider value={value}>
        {loading ? <div>Loading...</div> : children}
      </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
