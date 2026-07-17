import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
      useEffect(() => {
          if (loading) return;
              if (!user) router.push("/login");
                  else router.push(isAdmin ? "/admin" : "/dashboard");
                    }, [user, loading]);
                      return null;
                      }
                      
