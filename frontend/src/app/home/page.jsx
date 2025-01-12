'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const tokenExpiry = parseInt(urlParams.get('token_expiry'), 10); // Parse tokenExpiry as integer

    if (accessToken && refreshToken && tokenExpiry) {
      localStorage.setItem('jwt_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('token_expiry', tokenExpiry);
      setLoading(false);
      router.replace('/home');
    } else {
      const token = localStorage.getItem('jwt_token');
      const expiry = parseInt(localStorage.getItem('token_expiry'), 10); // Parse expiry as integer
      const now = new Date().getTime();

      if (!token || !expiry || now >= expiry) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        router.push('/login');
      } else {
        setLoading(false);
      }
    }
  }, [router]);

  if (loading) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen dark">
      <Nav />
      <div>
        <h1 className="text-2xl font-bold text-center mt-4">Welcome to the Home Page</h1>
      </div>
    </div>
  );
}