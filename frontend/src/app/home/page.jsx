'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    console.log('JWT Token:', token);
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const handleGoogleSignIn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      console.log('Google Sign-In Token:', token);
      if (token) {
        console.log('Setting token in localStorage');
        localStorage.setItem('jwt_token', token);
        router.push('/home');
      } else {
        console.log('Token not found in URL parameters');
      }
    };
    handleGoogleSignIn();
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