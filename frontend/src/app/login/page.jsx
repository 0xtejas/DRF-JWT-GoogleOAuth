"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Alert } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AcmeIcon } from "../components/AcmeIcon";
import AlertComponent from "../components/AlertComponent";

const LoginPage = () => {
  const router = useRouter();
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertColor, setAlertColor] = useState('danger'); // Add state for alert color

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const expiry = parseInt(localStorage.getItem('token_expiry'), 10); // Parse expiry as integer
    const now = new Date().getTime();

    if (token && expiry && now < expiry) {
      router.replace('/home');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const tokenExpiry = parseInt(urlParams.get('token_expiry'), 10); // Parse tokenExpiry as integer

    if (accessToken && refreshToken && tokenExpiry) {
      localStorage.setItem('jwt_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('token_expiry', tokenExpiry);
      router.replace('/home');
    } else if (urlParams.get('error')) {
      setAlertMessage(urlParams.get('error'));
      setAlertColor(urlParams.get('alertColor') || 'danger'); // Set alert color from URL params
    }
  }, [router]);

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_DJANGO_URL}/api/auth/google/login/`;
  };

  return (
    <div className="flex items-center justify-center h-screen bg-cover bg-center">
      <AlertComponent
        alertMessage={alertMessage}
        alertColor={alertColor}
        onClose={() => setAlertMessage(null)}
      />
      <div className="bg-white p-8 rounded shadow-md text-center w-full max-w-lg">
        <div className="flex flex-col items-center pb-6">
          <AcmeIcon className="w-16 h-16 text-black" />
          <p className="text-2xl font-bold text-black">Welcome Back</p>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>
        <Button
          onClick={handleLogin}
          icon={<Icon icon="akar-icons:google-fill" />}
          className="w-full"
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
}

export default LoginPage;
