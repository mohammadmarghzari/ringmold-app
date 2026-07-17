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
                  <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
                        <h1>قالب‌ساز انگشتر</h1>
                              <p style={{ color: "#9aa4b8" }}>برای ادامه با اکانت جیمیل وارد شو</p>
                                    <button className="btn" onClick={login}>ورود با گوگل</button>
                                        </div>
                                          );
                                          }
                                          
