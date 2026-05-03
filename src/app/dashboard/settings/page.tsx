'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Save, LogOut, Smartphone, Monitor, Laptop, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date-utils';

interface Device {
  id: string;
  deviceName: string;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionRes, devicesRes] = await Promise.all([
          api.get<{ user: User }>('/auth/get-session'),
          api.get<{ success: boolean; data: Device[] }>('/devices')
        ]);

        if (sessionRes.user) {
          setUser(sessionRes.user);
          setName(sessionRes.user.name || '');
          setEmail(sessionRes.user.email);
        }

        if (devicesRes.success) {
          setDevices(devicesRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch settings data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.patch<{ success: boolean; message: string; data: User }>('/users/me', {
        name: name
      });
      
      if (response.success) {
        setUser(response.data);
        alert('Profile updated successfully!');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const revokeDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to sign out from this device?')) return;

    try {
      const response = await api.delete<{ success: boolean }>(`/devices/${deviceId}`);
      if (response.success) {
        setDevices(devices.filter(d => d.id !== deviceId));
      }
    } catch (err) {
      console.error('Failed to revoke device:', err);
    }
  };

  const getDeviceIcon = (os: string | null) => {
    const lowerOs = os?.toLowerCase() || '';
    if (lowerOs.includes('ios') || lowerOs.includes('android')) return <Smartphone size={20} />;
    if (lowerOs.includes('mac') || lowerOs.includes('windows') || lowerOs.includes('linux')) return <Laptop size={20} />;
    return <Monitor size={20} />;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-foreground/60">Loading settings...</div>;
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight m-0">Settings</h1>
        <p className="text-foreground/70 m-0">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8 max-w-[800px]">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and public profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start gap-8">
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-4xl font-semibold">
                    {name?.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-foreground hover:bg-surface-hover hover:text-primary transition-all cursor-pointer">
                    <Camera size={16} />
                  </button>
                </div>
                
                <form onSubmit={handleSave} className="flex-1 flex flex-col gap-6 w-full">
                  <Input 
                    label="Full Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    fullWidth 
                  />
                  <Input 
                    label="Email Address" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    fullWidth 
                    type="email"
                    disabled
                  />
                  <div className="flex justify-end mt-4">
                    <Button 
                      type="submit" 
                      isLoading={isSaving} 
                      leftIcon={<Save size={16} />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your active sessions across devices.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {devices.length === 0 ? (
                  <p className="text-sm text-foreground/60">No active sessions found.</p>
                ) : (
                  devices.map(device => (
                    <div key={device.id} className="flex items-center gap-4 p-4 border border-border rounded-md bg-surface">
                      <div className="w-12 h-12 rounded-md bg-surface-hover flex items-center justify-center text-foreground/70">
                        {getDeviceIcon(device.os)}
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="font-medium flex items-center gap-2">
                          {device.deviceName} 
                          {device.ipAddress && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-hover text-foreground/60 font-mono">{device.ipAddress}</span>}
                        </div>
                        <div className="text-sm text-foreground/60">
                          {device.os || 'Unknown OS'} • {device.browser || 'Unknown Browser'} • {device.lastUsedAt ? `Last used ${formatDate(device.lastUsedAt)}` : 'Never used'}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-error hover:bg-error/10 hover:text-error" onClick={() => revokeDevice(device.id)}>
                        Revoke
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
