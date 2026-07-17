import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { createOrder, subscribeUserOrders } from "../lib/firestoreHelpers";
import { subscribeWallet } from "../lib/walletHelpers";

const statusLabel = { new: "جدید", designed: "طرح ثبت شد", done: "آماده تحویل" };
const statusClass = { new: "new", designed: "measured", done: "done" };

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [wallet, setWallet] = useState({ walletBalance: 0 });

    useEffect(() => {
          if (!loading && !user) router.push("/login");
    }, [user, loading]);

    useEffect(() => {
          if (!user) return;
          return subscribeUserOrders(user.uid, setOrders);
    }, [user]);

    useEffect(() => {
          if (!user) return;
          return subscribeWallet(user.uid, setWallet);
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
            <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => router.push("/wallet")}>
              <span>کیف پول: <b style={{ color: "#c9a24b" }}>{(wallet.walletBalance || 0).toLocaleString("fa-IR")} تومان</b></span>
              <span style={{ color: "#9aa4b8", fontSize: 13 }}>مدیریت →</span>
            </div>

            {orders.length === 0 && (
              <div className="card">
                <b>مراحل کار چطوریه؟</b>
                <ol style={{ fontSize: 14, color: "#9aa4b8", marginTop: 8, paddingRight: 18, lineHeight: 2 }}>
                  <li>سفارش جدید بزن و سایز انگشتت و مشخصات طرح (شکل روکار، نگین، حکاکی) رو وارد کن.</li>
                  <li>هرچی طرح خاص‌تری می‌خوای، توی کادر توضیحات کامل بنویس — برای قالب‌ساز فرستاده می‌شه.</li>
                  <li>مدل سه‌بعدی قالب و نقشه‌ی فنی PDF ساخته می‌شه؛ فایل STL رو بده به قالب‌ساز.</li>
                  <li>هزینه‌ی استفاده از ابزار طراحی بر اساس مدت زمان کارت از کیف پولت کسر می‌شه — یادت نره قبلش شارژش کنی.</li>
                </ol>
              </div>
            )}

            <button className="btn" style={{ width: "100%", margin: "10px 0 20px" }} onClick={handleNewOrder}>
              + سفارش جدید (طراحی انگشتر)
            </button>
      {orders.map(o => (
                <div className="card" key={o.id} onClick={() => router.push(
                            o.status === "new" ? `/new-order/${o.id}` : `/result/${o.id}`
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
