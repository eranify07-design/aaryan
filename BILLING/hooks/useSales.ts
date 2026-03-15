import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  purchasePrice: number;
}

export interface Sale {
  id: string;
  shopId: string;
  items: SaleItem[];
  totalAmount: number;
  totalProfit: number;
  createdAt: Date;
}

export function useSales(shopId: string | undefined) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setSales([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "sales"), where("shopId", "==", shopId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: Sale[] = snap.docs.map((d) => ({
          id: d.id,
          shopId: d.data().shopId,
          items: d.data().items ?? [],
          totalAmount: d.data().totalAmount ?? 0,
          totalProfit: d.data().totalProfit ?? 0,
          createdAt: d.data().createdAt?.toDate() ?? new Date(),
        }));
        data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setSales(data);
        setLoading(false);
      },
      (err) => {
        if (err?.code !== "permission-denied") console.error("Sales listener:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [shopId]);

  const addSale = async (sale: Omit<Sale, "id" | "createdAt">) => {
    await addDoc(collection(db, "sales"), {
      ...sale,
      createdAt: serverTimestamp(),
    });
  };

  const deleteSale = async (sale: Sale) => {
    await deleteDoc(doc(db, "sales", sale.id));
    for (const item of sale.items) {
      if (item.productId) {
        await updateDoc(doc(db, "products", item.productId), {
          stock: increment(item.quantity),
        });
      }
    }
  };

  const getDailySales = (date: Date) => {
    return sales.filter((s) => {
      const d = s.createdAt;
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });
  };

  const getMonthlySales = (year: number, month: number) => {
    return sales.filter((s) => {
      const d = s.createdAt;
      return d.getFullYear() === year && d.getMonth() === month;
    });
  };

  const getYearlySales = (year: number) => {
    return sales.filter((s) => s.createdAt.getFullYear() === year);
  };

  return { sales, loading, addSale, deleteSale, getDailySales, getMonthlySales, getYearlySales };
}
