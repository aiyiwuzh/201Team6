import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Bell, Shield, Trash2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../figmalib/supabase';
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

export function SettingsPage({ onLogout, onDeleteAccount: _onDeleteAccount }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    notifications: {
      newMatches: { enabled: true, optIn: true },
      messages: { enabled: true, optIn: true },
      emailDigest: { enabled: false, optIn: false },
      marketingEmails: { enabled: false, optIn: false },
    },
    privacy: {
      showAge: { enabled: true, optIn: true },
      showLocation: { enabled: true, optIn: true },
      invisibleMode: { enabled: false, optIn: false },
    },
    email: '',
    language: 'en',
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user email and settings on component mount
  useEffect(() => {
    const fetchUserAndSettings = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          setSettings(prev => ({ ...prev, email: user.email || '' }));

          // Try to fetch saved settings from database
          const { data: savedSettings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (savedSettings && !error) {
            setSettings({
              notifications: {
                newMatches: { enabled: savedSettings.new_matches ?? true, optIn: savedSettings.new_matches_opt_in ?? true },
                messages: { enabled: savedSettings.messages ?? true, optIn: savedSettings.messages_opt_in ?? true },
                emailDigest: { enabled: savedSettings.email_digest ?? false, optIn: savedSettings.email_digest_opt_in ?? false },
                marketingEmails: { enabled: savedSettings.marketing_emails ?? false, optIn: savedSettings.marketing_emails_opt_in ?? false },
              },
              privacy: {
                showAge: { enabled: savedSettings.show_age ?? true, optIn: savedSettings.show_age_opt_in ?? true },
                showLocation: { enabled: savedSettings.show_location ?? true, optIn: savedSettings.show_location_opt_in ?? true },
                invisibleMode: { enabled: savedSettings.invisible_mode ?? false, optIn: savedSettings.invisible_mode_opt_in ?? false },
              },
              email: user.email || '',
              language: savedSettings.language ?? 'en',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSettings();
  }, []);

  const handleSave = async () => {
    if (!userId) {
      toast.error('User not found');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          new_matches: settings.notifications.newMatches.enabled,
          new_matches_opt_in: settings.notifications.newMatches.optIn,
          messages: settings.notifications.messages.enabled,
          messages_opt_in: settings.notifications.messages.optIn,
          email_digest: settings.notifications.emailDigest.enabled,
          email_digest_opt_in: settings.notifications.emailDigest.optIn,
          marketing_emails: settings.notifications.marketingEmails.enabled,
          marketing_emails_opt_in: settings.notifications.marketingEmails.optIn,
          show_age: settings.privacy.showAge.enabled,
          show_age_opt_in: settings.privacy.showAge.optIn,
          show_location: settings.privacy.showLocation.enabled,
          show_location_opt_in: settings.privacy.showLocation.optIn,
          invisible_mode: settings.privacy.invisibleMode.enabled,
          invisible_mode_opt_in: settings.privacy.invisibleMode.optIn,
          language: settings.language,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving settings:', error);
        toast.error('Failed to save settings');
      } else {
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

 const handleDeleteAccount = async () => {
  // 1. Double-confirm with user (already done via AlertDialog)

  try {
    // Optional: Ask for password re-entry for extra security
    // You could add a small password input modal here

    const { error: rpcError } = await supabase.rpc('delete_user_account');

    if (rpcError) {
      if (rpcError.code === '42501') {
        toast.error('Permission denied. Please re-login and try again.');
      } else {
        toast.error('Failed to delete account: ' + rpcError.message);
      }
      console.error(rpcError);
      return;
    }

    // Success — user is deleted from auth + your tables
    toast.success('Account permanently deleted.');
    
   await supabase.auth.signOut();

    // Immediate hard redirect to login page
    // This works 100% even if you're using client-side routing
    window.location.href = '/login';

  } catch (err) {
    toast.error('Something went wrong. Please try again.');
    console.error(err);
  }
};

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    if (onLogout) {
      setTimeout(() => {
        onLogout();
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto pb-20 md:pb-0">
        <div className="bg-[#141414] border border-white/10 rounded-lg p-6 md:p-8">
          <p className="text-white">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Display label maps
  const notificationLabels: Record<string, string> = {
    newMatches: 'New Match Notifications',
    messages: 'Message Notifications',
    emailDigest: 'Email Digest',
    marketingEmails: 'Marketing Emails',
  };

  const privacyLabels: Record<string, string> = {
    showAge: 'Show Age on Profile',
    showLocation: 'Show Location',
    invisibleMode: 'Invisible Mode',
  };

  // Helper to render a single toggle row
  const SettingRow = ({
    title,
    description,
    value,
    onToggle,
  }: {
    title: string;
    description: string;
    value: { enabled: boolean; optIn: boolean };
    onToggle: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col pr-4">
        <Label className="text-gray-300">{title}</Label>
        <p className="text-gray-500">{description}</p>
      </div>
      <div className="min-w-[64px] flex justify-end">
        <Switch
          id={`${title}-toggle`}
          aria-label={`${title} toggle`}
          checked={value.optIn}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-[#991B1B] bg-white/10 border border-white/20"
        />
      </div>
    </div>
  );

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
                disabled
                className="mt-1 bg-[#1a1a1a] border-white/10 text-white opacity-70"
              />
              <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
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
            {Object.entries(settings.notifications).map(([key, value]) => (
              <SettingRow
                key={key}
                title={notificationLabels[key] ?? key}
                description={`Control notifications for ${notificationLabels[key] ?? key}`}
                value={value}
                onToggle={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      [key]: { enabled: checked, optIn: checked },
                    },
                  })
                }
              />
            ))}
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
            <SettingRow
              title={privacyLabels.showAge}
              description="Display your age to potential matches"
              value={settings.privacy.showAge}
              onToggle={(checked) =>
                setSettings({
                  ...settings,
                  privacy: {
                    ...settings.privacy,
                    showAge: { enabled: checked, optIn: checked },
                  },
                })
              }
            />

            <SettingRow
              title={privacyLabels.showLocation}
              description="Display your location to potential matches"
              value={settings.privacy.showLocation}
              onToggle={(checked) =>
                setSettings({
                  ...settings,
                  privacy: {
                    ...settings.privacy,
                    showLocation: { enabled: checked, optIn: checked },
                  },
                })
              }
            />

            <SettingRow
              title={privacyLabels.invisibleMode}
              description="Hide your profile from the discovery page"
              value={settings.privacy.invisibleMode}
              onToggle={(checked) =>
                setSettings({
                  ...settings,
                  privacy: {
                    ...settings.privacy,
                    invisibleMode: { enabled: checked, optIn: checked },
                  },
                })
              }
            />
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
                    <AlertDialogAction onClick={handleDeleteAccount}className="bg-[#991B1B] hover:bg-red-800">
                    Yes, Delete My Account Forever
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