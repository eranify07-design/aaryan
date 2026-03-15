import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  username: string;
  mobile: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (name: string, email: string, username: string, mobile: string, password: string) => Promise<void>;
  signIn: (emailOrUsername: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile({
          uid,
          name: data.name,
          email: data.email,
          username: data.username,
          mobile: data.mobile,
          createdAt: data.createdAt?.toDate() ?? new Date(),
        });
      }
    } catch (e) {
      console.error("fetchProfile error:", e);
    }
  };

  useEffect(() => {
    // Safety fallback — if Firebase never responds (network issue), stop loading after 6s
    const fallback = setTimeout(() => setLoading(false), 6000);

    const unsub = onAuthStateChanged(auth, async (u) => {
      clearTimeout(fallback);
      setUser(u);
      if (u) {
        await fetchProfile(u.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(fallback);
      unsub();
    };
  }, []);

  const signUp = async (name: string, email: string, username: string, mobile: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile: UserProfile = {
      uid: cred.user.uid,
      name,
      email,
      username,
      mobile,
      createdAt: new Date(),
    };
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
      });
    } catch (firestoreErr: any) {
      if (firestoreErr?.code === "permission-denied") {
        console.warn("Firestore rules not set — profile not saved to DB. Please update Firestore security rules.");
      } else {
        throw firestoreErr;
      }
    }
    setUserProfile(profile);
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    let emailToUse = emailOrUsername;
    if (!emailOrUsername.includes("@")) {
      try {
        const { getDocs, collection, query, where } = await import("firebase/firestore");
        const q = query(collection(db, "users"), where("username", "==", emailOrUsername));
        const snap = await getDocs(q);
        if (snap.empty) throw new Error("Username not found. Please use your email address instead.");
        emailToUse = snap.docs[0].data().email;
      } catch (err: any) {
        if (err?.code === "permission-denied") {
          throw new Error("Cannot look up username: Firestore permissions not set. Please sign in with your email address.");
        }
        throw err;
      }
    }
    await signInWithEmailAndPassword(auth, emailToUse, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
