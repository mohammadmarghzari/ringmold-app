import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import {
  subscribeWallet, subscribeUserChargeRequests, subscribeWalletTransactions,
  requestCharge, subscribeSettings,
} from "../lib/walletHelpers";

const TX_LABEL = { charge: "شارژ کیف پول", usage: "هزینه استفاده از ابزار اندازه‌گیری" };
const REQ_STATUS_LABEL = { pending: "در انتظار تایید", approved: "تایید شد", rejected: "رد شد" };

export default function Wallet() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState({ walletBalance: 0 });
  const [requests, setRequests] = useState([]);
  const [txs, setTxs] = useState([]);
  const [settings, setSettings] = useState({ ratePerMinute: 500 });
  const [amount, setAmount] = useState(100000);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    const u1 = subscribeWallet(user.uid, setWallet);
    const u2 = subscribeUserChargeRequests(user.uid, setRequests);
    const u3 = subscribeWalletTransactions(user.uid, setTxs);
    const u4 = subscribeSettings(setSettings);
    return () => { u1(); u2(); u3(); u4(); };
  }, [user]);

  const submitRequest = async () => {
    if (!amount || amount <= 0) return;
    setSending(true);
    await requestCharge(user.uid, user.email, Number(amount));
    setSending(false);
    alert("درخواست شارژ ثبت شد. بعد از تایید ادمین به کیف پولت اضافه می‌شه.");
  };

  if (!user) return null;

  return (
    <div className="container">
      <h2 style={{ marginTop: 20 }}>کیف پول</h2>

      <div className="card">
        <b>موجودی فعلی</b>
        <div style={{ fontSize: 28, color: "#c9a24b", marginTop: 6 }}>
          {(wallet.walletBalance || 0).toLocaleString("fa-IR")} تومان
        </div>
        <p style={{ fontSize: 13, color: "#9aa4b8", marginTop: 6 }}>
          نرخ فعلی استفاده از ابزار اندازه‌گیری: {settings.ratePerMinute?.toLocaleString("fa-IR")} تومان به ازای هر دقیقه.
        </p>
      </div>

      <div className="card">
        <b>شارژ کیف پول</b>
        <p style={{ fontSize: 13, color: "#9aa4b8" }}>مبلغ رو وارد کن. درخواست ثبت می‌شه و بعد از تایید ادمین به موجودیت اضافه می‌شه.</p>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ marginTop: 8 }} />
        <button className="btn" style={{ width: "100%", marginTop: 10 }} disabled={sending} onClick={submitRequest}>
          {sending ? "در حال ارسال..." : "ثبت درخواست شارژ"}
        </button>
      </div>

      <div className="card">
        <b>درخواست‌های شارژ</b>
        {requests.length === 0 && <p style={{ color: "#8a93a8", fontSize: 13 }}>درخواستی ثبت نشده.</p>}
        {requests.map((r) => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14 }}>
            <span>{Number(r.amount).toLocaleString("fa-IR")} تومان</span>
            <span className={`badge ${r.status === "approved" ? "done" : r.status === "rejected" ? "" : "new"}`}>
              {REQ_STATUS_LABEL[r.status]}
            </span>
          </div>
        ))}
      </div>

      <div className="card">
        <b>تاریخچه تراکنش‌ها</b>
        {txs.length === 0 && <p style={{ color: "#8a93a8", fontSize: 13 }}>تراکنشی ثبت نشده.</p>}
        {txs.map((t) => (
          <div key={t.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14 }}>
            <span>{TX_LABEL[t.type] || t.type}</span>
            <span style={{ color: t.amount < 0 ? "#e08a8a" : "#6fe0a0" }}>
              {t.amount < 0 ? "" : "+"}{Number(t.amount).toLocaleString("fa-IR")} تومان
            </span>
          </div>
        ))}
      </div>

      <button className="btn secondary" style={{ width: "100%" }} onClick={() => router.push("/dashboard")}>
        بازگشت به داشبورد
      </button>
    </div>
  );
}
