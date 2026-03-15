import { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Product {
  id: string;
  shopId: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  photoUrl: string;
  createdAt: Date;
}

export function useProducts(shopId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "products"), where("shopId", "==", shopId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: Product[] = snap.docs.map((d) => ({
          id: d.id,
          shopId: d.data().shopId,
          name: d.data().name,
          purchasePrice: d.data().purchasePrice ?? 0,
          sellingPrice: d.data().sellingPrice ?? 0,
          stock: d.data().stock ?? 0,
          photoUrl: d.data().photoUrl ?? "",
          createdAt: d.data().createdAt?.toDate() ?? new Date(),
        }));
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        if (err?.code !== "permission-denied") console.error("Products listener:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [shopId]);

  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    await addDoc(collection(db, "products"), {
      ...product,
      createdAt: serverTimestamp(),
    });
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    await updateDoc(doc(db, "products", productId), updates);
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
    } catch (err: any) {
      console.error("Delete product error:", err.code, err.message);
      throw new Error(err.message || "Failed to delete product. Check Firebase permissions.");
    }
  };

  const decreaseStock = async (productId: string, qty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newStock = Math.max(0, product.stock - qty);
    await updateDoc(doc(db, "products", productId), { stock: newStock });
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, decreaseStock };
}
