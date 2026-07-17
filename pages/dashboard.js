import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { createOrder, subscribeUserOrders } from "../lib/firestoreHelpers";

const statusLabel = { new: "جدید", photos_uploaded: "عکس‌ها آپلود شد", measured: "اندازه‌گیری شد", done: "آماده تحویل" };
const statusClass = { new: "new", photos_uploaded: "new", measured: "measured", done: "done" };

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
          if (!loading && !user) router.push("/login");
    }, [user, loading]);

    useEffect(() => {
          if (!user) return;
          return subscribeUserOrders(user.uid, setOrders);
    }, [user]);

    const handleNewOrder = async () => {
          const id = await createOrder(user.uid, user.email);
          router.push(`/new-order/${id}`);
    };

    if (!user) return null;

    return (
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
              <h2>سفارش‌های من</h2>
              <button className="btn secondary" onClick={logout}>خروج</button>
            </div>
            <button className="btn" style={{ width: "100%", margin: "10px 0 20px" }} onClick={handleNewOrder}>
              + سفارش جدید (عکس‌های انگشتر)
            </button>
      {orders.map(o => (
                <div className="card" key={o.id} onClick={() => router.push(
                            o.status === "done" ? `/result/${o.id}` :
                            o.status === "photos_uploaded" ? `/measure/${o.id}` :
                            `/new-order/${o.id}`
                          )} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>سفارش #{o.id.slice(0, 6)}</span>
                    <span className={`badge ${statusClass[o.status]}`}>{statusLabel[o.status]}</span>
                  </div>
                </div>
              ))}
      {orders.length === 0 && <p style={{ color: "#8a93a8" }}>هنوز سفارشی ثبت نکردی.</p>}
          </div>
        );
}
