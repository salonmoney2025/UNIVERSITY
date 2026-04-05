'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  AreaChart, Area,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  AlertTriangle,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  Activity,
  Lock,
  Zap,
  Calendar
} from 'lucide-react'
import axios from 'axios'

// Color palette for charts
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [overviewData, setOverviewData] = useState<any>(null)
  const [timelineData, setTimelineData] = useState<any>(null)
  const [securityData, setSecurityData] = useState<any>(null)
  const [behaviorData, setBehaviorData] = useState<any>(null)
  const [sessionData, setSessionData] = useState<any>(null)

  // Fetch all analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true)
    setError(null)

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }

      const endpoints = [
        { name: 'overview', url: `${baseURL}/analytics/advanced/overview/?days=${days}` },
        { name: 'timeline', url: `${baseURL}/analytics/advanced/activity_timeline/?days=${days}&group_by=day` },
        { name: 'security', url: `${baseURL}/analytics/advanced/security_analytics/?days=${days}` },
        { name: 'behavior', url: `${baseURL}/analytics/advanced/user_behavior/?days=${days}` },
        { name: 'session', url: `${baseURL}/analytics/advanced/session_analytics/?days=${days}` },
      ]

      const responses = await Promise.all(
        endpoints.map(ep => axios.get(ep.url, { headers }).catch(err => ({
          data: null,
          error: err
        })))
      )

      setOverviewData(responses[0].data)
      setTimelineData(responses[1].data)
      setSecurityData(responses[2].data)
      setBehaviorData(responses[3].data)
      setSessionData(responses[4].data)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch export report
  const handleExportReport = async () => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }

      const response = await axios.get(
        `${baseURL}/analytics/advanced/export_report/?days=${days}`,
        { headers }
      )

      // Download as JSON
      const dataStr = JSON.stringify(response.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
      link.click()
    } catch (err) {
      setError('Failed to export report')
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [days])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive system metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <Button
            onClick={fetchAnalyticsData}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {overviewData && (
            <>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Users"
                  value={overviewData.users.total}
                  subtitle={`${overviewData.users.active} active`}
                  icon={<Users className="w-5 h-5" />}
                  trend={overviewData.users.new_last_period}
                />
                <MetricCard
                  title="Active Sessions"
                  value={overviewData.security.active_sessions}
                  subtitle={`${overviewData.users.unique_active} unique users`}
                  icon={<Zap className="w-5 h-5" />}
                />
                <MetricCard
                  title="Login Success Rate"
                  value={`${overviewData.security.success_rate.toFixed(1)}%`}
                  subtitle={`${overviewData.security.total_logins} total logins`}
                  icon={<Activity className="w-5 h-5" />}
                  trend={overviewData.security.failed_logins}
                />
                <MetricCard
                  title="2FA Adoption"
                  value={`${overviewData.security.twofa_adoption_rate.toFixed(1)}%`}
                  subtitle={`${overviewData.security.twofa_enabled_users} users`}
                  icon={<Lock className="w-5 h-5" />}
                />
              </div>

              {/* Activity Chart */}
              {timelineData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Trend</CardTitle>
                    <CardDescription>System actions over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={timelineData.activity}>
                        <defs>
                          <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="period" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Area type="monotone" dataKey="total_actions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActions)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline" className="space-y-6">
          {timelineData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Daily activity and login attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={timelineData.activity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_actions" fill="#3b82f6" />
                      <Line type="monotone" dataKey="unique_users" stroke="#10b981" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login Attempts</CardTitle>
                  <CardDescription>Successful vs failed login trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timelineData.logins}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="successful" fill="#10b981" />
                      <Bar dataKey="failed" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-6">
          {securityData && (
            <>
              {/* Security Alerts */}
              {securityData.failed_logins.suspicious_ips.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {securityData.failed_logins.suspicious_ips.length} suspicious IP addresses detected with multiple failed login attempts
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Failed Logins */}
                <Card>
                  <CardHeader>
                    <CardTitle>Failed Login Reasons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={securityData.failed_logins.by_reason}
                          dataKey="count"
                          nameKey="failure_reason"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {securityData.failed_logins.by_reason.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* 2FA Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle>2FA Verification Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={securityData.two_factor_auth.by_method}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="method" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Suspicious IPs */}
              {securityData.failed_logins.suspicious_ips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Suspicious IP Addresses</CardTitle>
                    <CardDescription>IPs with multiple failed login attempts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {securityData.failed_logins.suspicious_ips.map((ip, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded">
                          <div>
                            <p className="font-mono text-sm font-medium">{ip.ip_address}</p>
                            <p className="text-xs text-gray-600">{ip.unique_emails} unique emails targeted</p>
                          </div>
                          <Badge variant="destructive">{ip.count} attempts</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* BEHAVIOR TAB */}
        <TabsContent value="behavior" className="space-y-6">
          {behaviorData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Users */}
                <Card>
                  <CardHeader>
                    <CardTitle>Most Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {behaviorData.most_active_users.slice(0, 5).map((user, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{user.user__email}</p>
                            <p className="text-xs text-gray-600">{user.unique_action_types} action types</p>
                          </div>
                          <Badge variant="secondary">{user.total_actions}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Common Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Most Common Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={behaviorData.common_actions.slice(0, 8)}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="action" type="category" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ec4899" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Activity by Role */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Distribution by Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {behaviorData.activity_by_role.map((role, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{role.user__role || 'Unknown'}</span>
                          <span className="text-sm text-gray-600">{role.total_actions} actions</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(role.total_actions / Math.max(...behaviorData.activity_by_role.map(r => r.total_actions))) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* SESSIONS TAB */}
        <TabsContent value="sessions" className="space-y-6">
          {sessionData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Device Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Device Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sessionData.device_distribution}
                          dataKey="count"
                          nameKey="device_type"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {sessionData.device_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Browser Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Browser Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sessionData.browser_distribution.map((browser, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm">{browser.browser || 'Unknown'}</span>
                          <Badge variant="outline">{browser.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session Duration */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Duration Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(sessionData.session_duration.distribution).map(([bucket, count]) => (
                      <div key={bucket} className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">{bucket}</p>
                        <p className="text-lg font-bold text-blue-600">{count}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Average session: <span className="font-bold text-gray-900">{sessionData.session_duration.average_minutes} minutes</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution (Top 10)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sessionData.geographic_distribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Metric Card Component
function MetricCard({ title, value, subtitle, icon, trend }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center text-xs">
            <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
            <span className="text-green-600">+{trend} this period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
