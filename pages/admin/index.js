import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import { subscribeAllOrders, updateOrder } from "../../lib/firestoreHelpers";

export default function Admin() {
  const { user, isAdmin, loading, logout } = useAuth();
    const router = useRouter();
      const [orders, setOrders] = useState([]);

        useEffect(() => {
            if (loading) return;
                if (!user) router.push("/login");
                    else if (!isAdmin) router.push("/dashboard");
                      }, [user, isAdmin, loading]);

                        useEffect(() => {
                            if (!isAdmin) return;
                                return subscribeAllOrders(setOrders);
                                  }, [isAdmin]);

                                    if (!isAdmin) return null;

                                      return (
                                          <div className="container">
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                                                        <h2>پنل مدیریت</h2>
                                                                <button className="btn secondary" onClick={logout}>خروج</button>
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
                                                                                                                                                                                                                                  
