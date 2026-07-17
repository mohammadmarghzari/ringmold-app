import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Login() {
  const { user, login, isAdmin } = useAuth();
    const router = useRouter();

      useEffect(() => {
          if (user) router.push(isAdmin ? "/admin" : "/dashboard");
            }, [user]);

              return (
                  <div className="container" style={{ paddingTop: 60, textAlign: "center" }}>
                        <h1>قالب‌ساز انگشتر</h1>
                              <p style={{ color: "#9aa4b8" }}>برای ادامه با اکانت جیمیل وارد شو</p>
                                    <button className="btn" onClick={login}>ورود با گوگل</button>

                                    <div className="card" style={{ textAlign: "right", marginTop: 30 }}>
                                      <b>این اپ چیکار می‌کنه؟</b>
                                      <p style={{ fontSize: 14, color: "#9aa4b8", marginTop: 8, lineHeight: 2 }}>
                                        از روی چند تا عکس ساده که با گوشیت از انگشتر می‌گیری (همراه یه مرجع اندازه مثل سکه)، اندازه‌ی دقیق حلقه رو در می‌آره، یه مدل سه‌بعدی از قالب می‌سازه، فایل قابل چاپ سه‌بعدی (STL) و نقشه‌ی فنی PDF بهت می‌ده — همون چیزی که قالب‌ساز برای ساخت مدل مستر ریخته‌گری بهش نیاز داره. هزینه‌ی استفاده از ابزار اندازه‌گیری بر اساس مدت زمان کارت از کیف پولت کسر می‌شه.
                                      </p>
                                    </div>
                                        </div>
                                          );
                                          }
                                          
