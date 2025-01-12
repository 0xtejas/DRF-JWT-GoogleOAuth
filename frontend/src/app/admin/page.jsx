'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@nextui-org/react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertColor, setAlertColor] = useState('danger'); // Add state for alert color

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/login');
    } else {
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
        const contentType = response.headers.get('content-type');
        if (!response.ok) {
          if (contentType && contentType.includes('application/json')) {
            return response.json().then(data => {
              throw new Error(data.message || 'Failed to login to admin');
            });
          } else {
            throw new Error('Failed to login to admin');
          }
        }
        return response.json();
      })
      .then(data => {
        window.location.href = `${djangoUrl}/admin/`;
      })
      .catch(error => {
        console.error('Auto-login error:', error);
        setAlertMessage(error.message || 'An error occurred');
        setAlertColor('danger'); // Default to danger color on error
        setTimeout(() => {
          router.push('/login');
        }, 3000); // Wait for 3 seconds before redirecting
      });
    }
  }, [router]);

  if (loading) {
    return null;
  }

  return (
    <div>
      {alertMessage && (
        <Alert
          color={alertColor} // Use dynamic alert color
          description={alertMessage}
          isVisible={true}
          title="Admin Login Error"
          variant="faded"
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
}