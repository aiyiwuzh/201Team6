import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Bell, Mail, MessageCircle, Shield, Trash2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface SettingsPageProps {
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export function SettingsPage({ onLogout, onDeleteAccount }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    notifications: {
      newMatches: true,
      messages: true,
      emailDigest: false,
      marketingEmails: false,
    },
    privacy: {
      showAge: true,
      showLocation: true,
      invisibleMode: false,
    },
    email: 'user@example.com',
    language: 'en',
  });

  const handleSave = () => {
    // Simulate API call
    toast.success('Settings saved successfully!');
  };

  const handleDeleteAccount = () => {
    // Simulate API call
    toast.success('Account deleted. Redirecting to login...');
    if (onDeleteAccount) {
      setTimeout(() => {
        onDeleteAccount();
      }, 1500);
    }
  };

  const handleLogout = () => {
    // Simulate logout
    toast.success('Logged out successfully!');
    if (onLogout) {
      setTimeout(() => {
        onLogout();
      }, 1000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-0">
      <div className="bg-[#141414] border border-white/10 rounded-lg p-6 md:p-8">
        <h2 className="text-white mb-6">Settings</h2>

        {/* Account Settings */}
        <section className="mb-8">
          <h3 className="text-white mb-4">Account</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-400">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="mt-1 bg-[#1a1a1a] border-white/10 text-white"
              />
            </div>

            <div>
              <Label htmlFor="language" className="text-gray-400">Language</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <Separator className="my-8 bg-white/10" />

        {/* Notification Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-[#991B1B]" size={20} />
            <h3 className="text-white">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">New Match Notifications</Label>
                <p className="text-gray-500">Get notified when you have a new match</p>
              </div>
              <Switch
                checked={settings.notifications.newMatches}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    notifications: { ...settings.notifications, newMatches: checked } 
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Message Notifications</Label>
                <p className="text-gray-500">Get notified when you receive a message</p>
              </div>
              <Switch
                checked={settings.notifications.messages}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    notifications: { ...settings.notifications, messages: checked } 
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Email Digest</Label>
                <p className="text-gray-500">Receive weekly summary of your activity</p>
              </div>
              <Switch
                checked={settings.notifications.emailDigest}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    notifications: { ...settings.notifications, emailDigest: checked } 
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Marketing Emails</Label>
                <p className="text-gray-500">Receive tips and updates from TopTrait</p>
              </div>
              <Switch
                checked={settings.notifications.marketingEmails}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    notifications: { ...settings.notifications, marketingEmails: checked } 
                  })
                }
              />
            </div>
          </div>
        </section>

        <Separator className="my-8 bg-white/10" />

        {/* Privacy Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-[#991B1B]" size={20} />
            <h3 className="text-white">Privacy</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Show Age on Profile</Label>
                <p className="text-gray-500">Display your age to potential matches</p>
              </div>
              <Switch
                checked={settings.privacy.showAge}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    privacy: { ...settings.privacy, showAge: checked } 
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Show Location</Label>
                <p className="text-gray-500">Display your location to potential matches</p>
              </div>
              <Switch
                checked={settings.privacy.showLocation}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    privacy: { ...settings.privacy, showLocation: checked } 
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Invisible Mode</Label>
                <p className="text-gray-500">Hide your profile from the discovery page</p>
              </div>
              <Switch
                checked={settings.privacy.invisibleMode}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    privacy: { ...settings.privacy, invisibleMode: checked } 
                  })
                }
              />
            </div>
          </div>
        </section>

        <Separator className="my-8 bg-white/10" />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[#991B1B] hover:bg-[#7d1616]">
            Save Changes
          </Button>
        </div>

        <Separator className="my-8 bg-white/10" />

        {/* Danger Zone */}
        <section>
          <h3 className="text-[#991B1B] mb-4">Danger Zone</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-[#991B1B]/30 rounded-lg bg-[#991B1B]/10">
              <div>
                <Label className="text-gray-300">Logout</Label>
                <p className="text-gray-500">Sign out of your account</p>
              </div>
              <Button onClick={handleLogout} variant="outline" className="border-white/20 text-white hover:bg-white/5">
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-[#991B1B]/30 rounded-lg bg-[#991B1B]/10">
              <div>
                <Label className="text-gray-300">Delete Account</Label>
                <p className="text-gray-500">Permanently delete your account and all data</p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#141414] border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-[#1a1a1a] border-white/10 text-white hover:bg-white/5">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-[#991B1B] hover:bg-[#7d1616]">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}