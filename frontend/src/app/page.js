"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "./components/Nav";
export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
      router.push('/home'); // Redirect to /home
    }
  }, [router]);

  if (loading) {
    return null;
  }

  return null;
}
