import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { ADMIN_EMAILS } from "../lib/firebase";

export default function Support() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  if (!user) return null;

  return (
    <Layout>
      <h2 style={{ marginTop: 20 }}>پشتیبانی</h2>
      <div className="card">
        <b>سوال یا مشکلی داری؟</b>
        <p style={{ fontSize: 14, color: "#9aa4b8", marginTop: 8, lineHeight: 2 }}>
          برای هر سوالی درباره‌ی سفارش، کیف پول، یا هر بخش دیگه‌ی اپ، می‌تونی از همین طریق با ما در تماس باشی:
        </p>
        <a className="btn" style={{ display: "block", textAlign: "center", marginTop: 10, textDecoration: "none" }}
           href={`mailto:${ADMIN_EMAILS[0]}`}>
          ارسال ایمیل به پشتیبانی
        </a>
      </div>
    </Layout>
  );
}
