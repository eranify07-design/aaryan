import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
}

interface ShopContextType {
  shops: Shop[];
  currentShop: Shop | null;
  setCurrentShop: (shop: Shop | null) => void;
  loading: boolean;
  addShop: (name: string) => Promise<void>;
  renameShop: (shopId: string, newName: string) => Promise<void>;
  deleteShop: (shopId: string) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setShops([]);
      setCurrentShop(null);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "shops"), where("ownerId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: Shop[] = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          ownerId: d.data().ownerId,
          createdAt: d.data().createdAt?.toDate() ?? new Date(),
        }));
        setShops(data);
        setLoading(false);
      },
      (err) => {
        if (err?.code === "permission-denied") {
          console.warn("Firestore shops permission denied. Please update Firestore security rules.");
        } else {
          console.error("Shops listener error:", err);
        }
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  const addShop = async (name: string) => {
    if (!user) return;
    if (shops.length >= 2) throw new Error("Maximum 2 shops allowed");
    await addDoc(collection(db, "shops"), {
      name,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const renameShop = async (shopId: string, newName: string) => {
    await updateDoc(doc(db, "shops", shopId), { name: newName });
  };

  const deleteShop = async (shopId: string) => {
    const productsQ = query(collection(db, "products"), where("shopId", "==", shopId));
    const prodSnap = await getDocs(productsQ);
    for (const d of prodSnap.docs) await deleteDoc(d.ref);

    const salesQ = query(collection(db, "sales"), where("shopId", "==", shopId));
    const salesSnap = await getDocs(salesQ);
    for (const d of salesSnap.docs) await deleteDoc(d.ref);

    await deleteDoc(doc(db, "shops", shopId));
    if (currentShop?.id === shopId) setCurrentShop(null);
  };

  return (
    <ShopContext.Provider value={{ shops, currentShop, setCurrentShop, loading, addShop, renameShop, deleteShop }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
