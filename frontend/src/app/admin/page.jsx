'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            router.push('/login');
        }
        else {
            setLoading(false);
            const djangoUrl = process.env.NEXT_PUBLIC_DJANGO_URL;
            fetch(`${djangoUrl}/api/auth/admin/auto-login`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            })
            .then(response => {
              if (response.ok) {
                window.location.href = `${djangoUrl}/admin/`;

              } 
              else {
                router.push('/login');
              } 
            })
            .catch(error => {
              router.push('/login');
            });
        }
    }, [router]);

    if (loading) {
        return null;
    }

    return null;
}