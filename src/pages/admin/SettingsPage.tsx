import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Shield, Bell, Lock, Globe, Database, Save } from "lucide-react";

const SettingsPage = () => {
  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your VoteChain admin settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Security Settings */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Shield className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="font-display text-lg">Security</CardTitle>
                  <CardDescription>
                    Configure security and authentication settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all admin accounts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto-logout after inactivity
                  </p>
                </div>
                <Input type="number" defaultValue="30" className="w-20" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">IP Whitelisting</Label>
                  <p className="text-sm text-muted-foreground">
                    Restrict admin access to specific IPs
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display text-lg">Notifications</CardTitle>
                  <CardDescription>
                    Manage email and system notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Election Start Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when elections begin
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Vote Milestone Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify at vote count milestones
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify on suspicious activity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Settings */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="font-display text-lg">Blockchain</CardTitle>
                  <CardDescription>
                    Configure blockchain network settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Input id="network" defaultValue="Ethereum Mainnet" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract">Smart Contract Address</Label>
                <Input 
                  id="contract" 
                  defaultValue="0x742d35Cc6634C0532925a3b844Bc4..." 
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Auto Gas Adjustment</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically optimize gas fees
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Globe className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="font-display text-lg">General</CardTitle>
                  <CardDescription>
                    General platform configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org">Organization Name</Label>
                <Input id="org" defaultValue="VoteChain University" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="America/New_York" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Public Results</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow public access to election results
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button variant="hero" size="lg">
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
