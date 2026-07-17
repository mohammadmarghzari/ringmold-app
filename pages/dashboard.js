import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { createOrder, subscribeUserOrders } from "../lib/firestoreHelpers";
import { subscribeWallet } from "../lib/walletHelpers";
import Layout from "../components/Layout";

const statusLabel = { new: "جدید", designed: "طرح ثبت شد", done: "آماده تحویل" };
const statusClass = { new: "new", designed: "measured", done: "done" };

export default function Dashboard() {
    const { user, loading } = useAuth();
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
      <Layout wallet={wallet.walletBalance || 0}>
            <h2 style={{ marginTop: 20 }}>سفارش‌های من</h2>

            <div className="feature-grid">
              <div className="feature-card" onClick={handleNewOrder}>
                <span className="icon">💍</span>
                <span>سفارش جدید</span>
              </div>
              <div className="feature-card" onClick={() => router.push("/wallet")}>
                <span className="icon">💳</span>
                <span>کیف پول</span>
              </div>
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
      </Layout>
        );
}
