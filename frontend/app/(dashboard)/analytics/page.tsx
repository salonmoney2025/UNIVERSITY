'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Activity, Users, Shield, TrendingUp, TrendingDown, Clock,
  Globe, Smartphone, AlertTriangle, CheckCircle, Download,
  BarChart3, LineChart, PieChart
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface OverviewData {
  users: {
    total: number
    active: number
    new_last_period: number
    unique_active: number
  }
  activity: {
    total_actions: number
    avg_actions_per_user: number
  }
  security: {
    total_logins: number
    failed_logins: number
    success_rate: number
    active_sessions: number
    twofa_enabled_users: number
    twofa_adoption_rate: number
  }
  system_health: {
    avg_session_duration_minutes: number
  }
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [activityTimeline, setActivityTimeline] = useState<any>(null)
  const [securityData, setSecurityData] = useState<any>(null)
  const [userBehavior, setUserBehavior] = useState<any>(null)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = { days: timeRange }

      const [overviewRes, timelineRes, securityRes, behaviorRes, sessionRes] = await Promise.all([
        api.get('/analytics/advanced/overview/', { params }),
        api.get('/analytics/advanced/activity_timeline/', { params: { ...params, group_by: 'day' } }),
        api.get('/analytics/advanced/security_analytics/', { params }),
        api.get('/analytics/advanced/user_behavior/', { params }),
        api.get('/analytics/advanced/session_analytics/', { params }),
      ])

      setOverview(overviewRes.data)
      setActivityTimeline(timelineRes.data)
      setSecurityData(securityRes.data)
      setUserBehavior(behaviorRes.data)
      setSessionData(sessionRes.data)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load analytics data',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      const response = await api.get('/analytics/advanced/export_report/', {
        params: { days: timeRange },
      })

      // Download as JSON file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: 'Analytics report downloaded',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to export report',
      })
    }
  }

  if (loading || !overview) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive system analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.users.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {overview.users.new_last_period} new
              </span>
              <span className="ml-2">
                {overview.users.active} active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activity.total_actions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.activity.avg_actions_per_user} avg per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Success Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.security.success_rate}%</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-red-600">
                {overview.security.failed_logins} failed
              </span>
              <span className="mx-1">/</span>
              <span>{overview.security.total_logins} total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.security.active_sessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.system_health.avg_session_duration_minutes.toFixed(1)} min avg duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">User Behavior</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 2FA Adoption */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                <CardDescription>2FA adoption and usage statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Adoption Rate</span>
                    <span className="font-medium">{overview.security.twofa_adoption_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${overview.security.twofa_adoption_rate}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {overview.security.twofa_enabled_users} of {overview.users.total} users
                  </div>
                </div>

                {securityData?.two_factor_auth && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-medium text-sm">Verification Statistics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-2 font-medium">
                          {securityData.two_factor_auth.total_verifications}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {securityData.two_factor_auth.success_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Failed Logins */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Failed Login Attempts</CardTitle>
                <CardDescription>Analysis of failed authentication attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {securityData?.failed_logins?.by_reason && (
                  <div className="space-y-3">
                    {securityData.failed_logins.by_reason.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{item.failure_reason || 'Unknown'}</span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                    {securityData.failed_logins.suspicious_ips.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          {securityData.failed_logins.total_suspicious} Suspicious IPs Detected
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Permission Changes */}
          {securityData?.permissions?.recent_changes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Permission Changes</CardTitle>
                <CardDescription>Latest permission and role modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityData.permissions.recent_changes.slice(0, 10).map((change: any) => (
                    <div key={change.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={change.action === 'GRANTED' ? 'default' : 'destructive'}>
                            {change.action}
                          </Badge>
                          <span className="text-sm font-medium">{change.permission_display}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {change.performed_by_display} → {change.user_display}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(change.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* User Behavior Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Most Active Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Active Users</CardTitle>
                <CardDescription>Top users by total actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userBehavior?.most_active_users?.slice(0, 10).map((user: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {user.user__first_name} {user.user__last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.user__email}</div>
                      </div>
                      <div className="text-sm font-medium">{user.total_actions} actions</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Common Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Common Actions</CardTitle>
                <CardDescription>Frequently performed actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userBehavior?.common_actions?.map((action: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{action.action}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {action.unique_users} users
                        </span>
                        <Badge variant="secondary">{action.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions by Model */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity by Resource</CardTitle>
              <CardDescription>Actions performed on different system resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userBehavior?.actions_by_model?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{item.count}</div>
                    <div className="text-sm text-muted-foreground mt-1">{item.model_name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Device Types</CardTitle>
                <CardDescription>Sessions by device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessionData?.device_distribution?.map((device: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{device.device_type || 'Unknown'}</span>
                      </div>
                      <Badge variant="secondary">{device.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Browser Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Browsers</CardTitle>
                <CardDescription>Most used browsers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessionData?.browser_distribution?.slice(0, 5).map((browser: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{browser.browser || 'Unknown'}</span>
                      <Badge variant="secondary">{browser.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Countries</CardTitle>
                <CardDescription>Sessions by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessionData?.geographic_distribution?.slice(0, 5).map((country: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{country.country || 'Unknown'}</span>
                      </div>
                      <Badge variant="secondary">{country.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Duration */}
          {sessionData?.session_duration && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Duration Distribution</CardTitle>
                <CardDescription>
                  Average: {sessionData.session_duration.average_minutes.toFixed(1)} minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(sessionData.session_duration.distribution).map(([bucket, count]: [string, any]) => (
                    <div key={bucket} className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground mt-1">{bucket}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activity Timeline Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
              <CardDescription>Daily activity and login trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-8">
                Activity timeline chart would be displayed here using a charting library like Chart.js or Recharts
              </div>
              {/* This would be replaced with actual charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Recent Activity Points</h4>
                  <div className="space-y-2">
                    {activityTimeline?.activity?.slice(-7).map((point: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>{new Date(point.period).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{point.unique_users} users</span>
                          <Badge variant="secondary">{point.total_actions} actions</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Recent Login Activity</h4>
                  <div className="space-y-2">
                    {activityTimeline?.logins?.slice(-7).map((point: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>{new Date(point.period).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">{point.successful} ✓</span>
                          <span className="text-red-600">{point.failed} ✗</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
