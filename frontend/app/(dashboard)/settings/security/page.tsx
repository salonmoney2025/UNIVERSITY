'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle, Copy, Download } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface TwoFactorStatus {
  is_enabled: boolean
  message?: string
}

interface SetupResponse {
  secret_key: string
  qr_code: string
  provisioning_uri: string
  backup_codes: string[]
  message: string
}

interface TrustedDevice {
  id: string
  device_name: string
  device_fingerprint: string
  ip_address: string
  browser: string
  operating_system: string
  is_active: boolean
  is_expired: boolean
  expires_at: string
  last_used_at: string
  created_at: string
}

export default function SecuritySettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null)
  const [setupData, setSetupData] = useState<SetupResponse | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [regenerateCode, setRegenerateCode] = useState('')
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([])
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)

  useEffect(() => {
    fetchTwoFactorStatus()
    fetchTrustedDevices()
  }, [])

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await api.get('/auth/2fa/auth/status/')
      setTwoFactorStatus(response.data)
    } catch (error: any) {
      console.error('Error fetching 2FA status:', error)
    }
  }

  const fetchTrustedDevices = async () => {
    try {
      const response = await api.get('/auth/2fa/devices/')
      setTrustedDevices(response.data)
    } catch (error: any) {
      console.error('Error fetching trusted devices:', error)
    }
  }

  const handleSetup = async () => {
    setLoading(true)
    try {
      const response = await api.post('/auth/2fa/auth/setup/')
      setSetupData(response.data)
      setShowSetupDialog(true)
      toast({
        title: 'Success',
        description: 'Scan the QR code with your authenticator app',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'Failed to setup 2FA',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a 6-digit code',
      })
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/2fa/auth/verify_and_enable/', {
        code: verificationCode,
      })

      toast({
        title: 'Success',
        description: '2FA has been enabled successfully',
      })

      setShowSetupDialog(false)
      setSetupData(null)
      setVerificationCode('')
      await fetchTwoFactorStatus()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'Invalid verification code',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a 6-digit code',
      })
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/2fa/auth/disable/', {
        code: disableCode,
      })

      toast({
        title: 'Success',
        description: '2FA has been disabled',
      })

      setShowDisableDialog(false)
      setDisableCode('')
      await fetchTwoFactorStatus()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'Failed to disable 2FA',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    if (regenerateCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a 6-digit code',
      })
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/2fa/auth/regenerate_backup_codes/', {
        code: regenerateCode,
      })

      toast({
        title: 'Success',
        description: 'New backup codes have been generated',
      })

      // Show new backup codes
      setSetupData({
        ...setupData!,
        backup_codes: response.data.backup_codes,
      })

      setShowRegenerateDialog(false)
      setRegenerateCode('')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'Failed to regenerate codes',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      await api.post(`/auth/2fa/devices/${deviceId}/revoke/`)
      toast({
        title: 'Success',
        description: 'Device trust has been revoked',
      })
      await fetchTrustedDevices()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to revoke device',
      })
    }
  }

  const handleRevokeAllDevices = async () => {
    try {
      const response = await api.post('/auth/2fa/devices/revoke_all/')
      toast({
        title: 'Success',
        description: response.data.message,
      })
      await fetchTrustedDevices()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to revoke all devices',
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: 'Copied to clipboard',
    })
  }

  const downloadBackupCodes = () => {
    if (!setupData?.backup_codes) return

    const content = setupData.backup_codes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Downloaded',
      description: 'Backup codes saved to file',
    })
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and two-factor authentication
        </p>
      </div>

      <Tabs defaultValue="2fa" className="space-y-6">
        <TabsList>
          <TabsTrigger value="2fa">Two-Factor Authentication</TabsTrigger>
          <TabsTrigger value="devices">Trusted Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="2fa" className="space-y-6">
          {/* 2FA Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Add an extra layer of security to your account
                  </CardDescription>
                </div>
                {twoFactorStatus?.is_enabled ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!twoFactorStatus?.is_enabled ? (
                <div>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Two-factor authentication is currently disabled. Enable it to add an extra layer of security to your account.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleSetup} disabled={loading} className="mt-4">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Two-factor authentication is active. You'll be asked for a verification code when signing in.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowRegenerateDialog(true)}
                      disabled={loading}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Regenerate Backup Codes
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDisableDialog(true)}
                      disabled={loading}
                    >
                      Disable 2FA
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          {/* Trusted Devices */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trusted Devices</CardTitle>
                  <CardDescription>
                    Devices that don't require 2FA verification
                  </CardDescription>
                </div>
                {trustedDevices.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleRevokeAllDevices}>
                    Revoke All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {trustedDevices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trusted devices</p>
              ) : (
                <div className="space-y-4">
                  {trustedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span className="font-medium">{device.device_name}</span>
                          {device.is_expired && (
                            <Badge variant="secondary">Expired</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {device.browser} • {device.operating_system}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          IP: {device.ip_address} • Last used:{' '}
                          {new Date(device.last_used_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeDevice(device.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Follow these steps to enable 2FA on your account
            </DialogDescription>
          </DialogHeader>

          {setupData && (
            <div className="space-y-6">
              {/* Step 1: Scan QR Code */}
              <div>
                <h3 className="font-semibold mb-2">Step 1: Scan QR Code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use an authenticator app (Google Authenticator, Authy, etc.) to scan this QR code
                </p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img src={setupData.qr_code} alt="QR Code" className="w-64 h-64" />
                </div>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Can't scan? Enter this key manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm">{setupData.secret_key}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(setupData.secret_key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 2: Backup Codes */}
              <div>
                <h3 className="font-semibold mb-2">Step 2: Save Backup Codes</h3>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Save these backup codes in a safe place. You can use them to access your account if you lose your device.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg mb-2">
                  {setupData.backup_codes.map((code, idx) => (
                    <code key={idx} className="text-sm font-mono">
                      {code}
                    </code>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup Codes
                </Button>
              </div>

              {/* Step 3: Verify */}
              <div>
                <h3 className="font-semibold mb-2">Step 3: Verify & Enable</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the 6-digit code from your authenticator app to complete setup
                </p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={handleVerifyAndEnable} disabled={loading || verificationCode.length !== 6}>
                    Verify & Enable
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your 2FA code to disable two-factor authentication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling 2FA will make your account less secure
              </AlertDescription>
            </Alert>
            <div>
              <Label>Verification Code</Label>
              <Input
                type="text"
                placeholder="000000"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDisable} disabled={loading || disableCode.length !== 6}>
                Disable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Backup Codes</DialogTitle>
            <DialogDescription>
              Enter your 2FA code to generate new backup codes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Old backup codes will be invalidated when new ones are generated
              </AlertDescription>
            </Alert>
            <div>
              <Label>Verification Code</Label>
              <Input
                type="text"
                placeholder="000000"
                value={regenerateCode}
                onChange={(e) => setRegenerateCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRegenerateBackupCodes} disabled={loading || regenerateCode.length !== 6}>
                Regenerate Codes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
