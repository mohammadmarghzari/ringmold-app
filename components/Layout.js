import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children, wallet }) {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nav = (path) => { setOpen(false); router.push(path); };
  const initial = (user?.email || "?")[0].toUpperCase();

  return (
    <>
      <div className="topbar">
        <div className="topbar-user">
          <div className="avatar">{initial}</div>
          <span>{user?.email}</span>
        </div>
        <div className="topbar-right">
          {wallet !== undefined && (
            <div className="credit-chip" onClick={() => nav("/wallet")}>
              💰 {(wallet || 0).toLocaleString("fa-IR")} تومان
            </div>
          )}
          <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="منو">☰</button>
        </div>
      </div>

      {open && (
        <>
          <div className="drawer-overlay" onClick={() => setOpen(false)} />
          <div className="drawer">
            <button className="drawer-close" onClick={() => setOpen(false)}>✕</button>
            <div className="drawer-brand">قالب‌ساز انگشتر</div>
            <button className="drawer-item" onClick={() => nav(isAdmin ? "/admin" : "/dashboard")}>
              <span>خانه</span><span>🏠</span>
            </button>
            <button className="drawer-item" onClick={() => nav("/dashboard")}>
              <span>سفارش‌های من</span><span>📋</span>
            </button>
            <button className="drawer-item" onClick={() => nav("/wallet")}>
              <span>کیف پول / خرید اعتبار</span><span>💳</span>
            </button>
            {isAdmin && (
              <button className="drawer-item" onClick={() => nav("/admin")}>
                <span>پنل مدیریت</span><span>⚙️</span>
              </button>
            )}
            <button className="drawer-item" onClick={() => nav("/support")}>
              <span>پشتیبانی</span><span>💬</span>
            </button>
            <button className="drawer-item" onClick={() => { setOpen(false); logout(); }}>
              <span>خروج</span><span>🚪</span>
            </button>
          </div>
        </>
      )}

      <div className="container">{children}</div>
    </>
  );
}
