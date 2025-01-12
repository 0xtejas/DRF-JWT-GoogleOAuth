"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AcmeIcon } from "../components/AcmeIcon";

const LoginPage = () => {
    const router = useRouter();
  
    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
  
      if (accessToken && refreshToken) {
        localStorage.setItem('jwt_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        router.replace('/home');
      }
    }, [router]);
  
    const handleLogin = () => {
      window.location.href = 'http://localhost:8000/api/auth/google/login/';
    };
    
    return (
        <div className="flex items-center justify-center h-screen bg-cover bg-center">
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
                > Continue with Google
                </Button>
            </div> 
        </div>
    );
}

export default LoginPage;
