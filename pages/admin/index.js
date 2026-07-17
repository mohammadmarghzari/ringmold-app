import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import { subscribeAllOrders, updateOrder } from "../../lib/firestoreHelpers";
import {
  subscribeSettings, updateRatePerMinute,
  subscribeAllChargeRequests, approveCharge, rejectCharge,
} from "../../lib/walletHelpers";

export default function Admin() {
  const { user, isAdmin, loading, logout } = useAuth();
    const router = useRouter();
      const [orders, setOrders] = useState([]);
      const [settings, setSettings] = useState({ ratePerMinute: 500 });
      const [rateInput, setRateInput] = useState(500);
      const [chargeRequests, setChargeRequests] = useState([]);

        useEffect(() => {
            if (loading) return;
                if (!user) router.push("/login");
                    else if (!isAdmin) router.push("/dashboard");
                      }, [user, isAdmin, loading]);

                        useEffect(() => {
                            if (!isAdmin) return;
                                return subscribeAllOrders(setOrders);
                                  }, [isAdmin]);

                        useEffect(() => {
                            if (!isAdmin) return;
                            return subscribeSettings((s) => { setSettings(s); setRateInput(s.ratePerMinute); });
                        }, [isAdmin]);

                        useEffect(() => {
                            if (!isAdmin) return;
                            return subscribeAllChargeRequests(setChargeRequests);
                        }, [isAdmin]);

                        const saveRate = async () => {
                            await updateRatePerMinute(Number(rateInput));
                            alert("نرخ به‌روز شد.");
                        };

                        const pendingRequests = chargeRequests.filter((r) => r.status === "pending");

                                    if (!isAdmin) return null;

                                      return (
                                          <div className="container">
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                                                        <h2>پنل مدیریت</h2>
                                                                <button className="btn secondary" onClick={logout}>خروج</button>
                                                                      </div>

                                                <div className="card">
                                                    <b>تنظیمات نرخ استفاده</b>
                                                    <p style={{ fontSize: 13, color: "#9aa4b8" }}>نرخ فعلی: {settings.ratePerMinute?.toLocaleString("fa-IR")} تومان به ازای هر دقیقه استفاده از ابزار اندازه‌گیری.</p>
                                                    <input type="number" value={rateInput} onChange={(e) => setRateInput(e.target.value)} />
                                                    <button className="btn" style={{ marginTop: 10 }} onClick={saveRate}>ذخیره نرخ</button>
                                                </div>

                                                <div className="card">
                                                    <b>درخواست‌های شارژ در انتظار تایید ({pendingRequests.length})</b>
                                                    {pendingRequests.length === 0 && <p style={{ color: "#8a93a8", fontSize: 13 }}>درخواستی در انتظار نیست.</p>}
                                                    {pendingRequests.map((r) => (
                                                        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                                                            <span style={{ fontSize: 14 }}>{r.userEmail} - {Number(r.amount).toLocaleString("fa-IR")} تومان</span>
                                                            <div style={{ display: "flex", gap: 6 }}>
                                                                <button className="btn" onClick={() => approveCharge(r.id, r.uid, r.amount)}>تایید</button>
                                                                <button className="btn secondary" onClick={() => rejectCharge(r.id)}>رد</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                            {orders.map(o => (
                                                                                    <div className="card" key={o.id}>
                                                                                              <div>سفارش #{o.id.slice(0, 6)} - {o.userEmail}</div>
                                                                                                        <div style={{ fontSize: 13, color: "#9aa4b8" }}>وضعیت: {o.status} - نوع: {o.ringType}</div>
                                                                                                                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                                                                                                                              {o.photos?.map((p, i) => (
                                                                                                                                            <img key={i} src={p.url} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                                                                                                                                                        ))}
                                                                                                                                                                  </div>
                                                                                                                                                                            <button className="btn secondary" style={{ marginTop: 8 }}
                                                                                                                                                                                        onClick={() => updateOrder(o.id, { status: "done" })}>
                                                                                                                                                                                                    علامت گذاری به عنوان آماده تحویل
                                                                                                                                                                                                              </button>
                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                            ))}
                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                  );
                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                  
