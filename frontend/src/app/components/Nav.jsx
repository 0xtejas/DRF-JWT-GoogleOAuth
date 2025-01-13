"use client"

import React, { useState, useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Alert,
} from "@nextui-org/react";
import AlertComponent from "./AlertComponent";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function Nav() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertColor, setAlertColor] = useState('danger'); // Add state for alert color
  const [email, setEmail] = useState(''); // Add state for email
  const [profilePicture, setProfilePicture] = useState(''); // Add state for profile picture

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/api/auth/profile/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEmail(data.email);
          setProfilePicture(data.profile_picture); // Set profile picture
        } else {
          console.error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('An error occurred while fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('jwt_token');
    const refreshToken = localStorage.getItem('refresh_token'); // Corrected variable name

    if (!token || !refreshToken) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL}/api/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        setAlertMessage(data.message || 'Logout Successful');
        setAlertColor(data.alertColor || 'success'); // Set alert color from backend
        setTimeout(() => {
            window.location.reload();
        }, 2000); // Redirect after 2 seconds to show the alert
      } else {
        setAlertMessage(data.message || 'Failed to logout');
        setAlertColor(data.alertColor || 'danger'); // Set alert color from backend
      }
    } catch (error) {
      setAlertMessage(error.message || 'An error occurred');
      setAlertColor('danger'); // Default to danger color on error
    }
  }

  return (
    <div>
      <AlertComponent
        alertMessage={alertMessage}
        alertColor={alertColor}
        onClose={() => setAlertMessage(null)}
      />
      <Navbar>
        <NavbarBrand>
          <AcmeLogo />
          <p className="font-bold text-inherit">ACME</p>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              Features
            </Link>
          </NavbarItem>
          <NavbarItem isActive>
            <Link aria-current="page" color="secondary" href="#">
              Customers
            </Link>
          </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href="#">
                Integrations
              </Link>
            </NavbarItem>
          </NavbarContent>

        <NavbarContent as="div" justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name="Jason Hughes"
                size="sm"
                src={profilePicture || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} // Use profile picture
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{email}</p> {/* Display the fetched email */}
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="logout" color="danger">
                <div
                  className="flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <span>Logout</span>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>
    </div>
  );
}
