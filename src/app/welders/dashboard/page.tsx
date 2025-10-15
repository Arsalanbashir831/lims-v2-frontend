"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Users, CreditCard, FileText, TrendingUp, Clock, CheckCircle, Loader2 } from "lucide-react"
import { useWelderDashboardStats } from "@/hooks/use-welder-dashboard"

export default function WeldersDashboardPage() {
  const { data: stats, isLoading, error } = useWelderDashboardStats()

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welders Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Welders Management System
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load dashboard statistics</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welders Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Welders Management System
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Welders
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.welders?.total_welders ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active: {stats?.welders?.active_welders ?? 0} | Activity Rate: {stats?.welders?.activity_rate?.toFixed(0) ?? 0}%
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Records
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.welder_operator_performance?.total_records ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total performance records
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Welder Cards
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.welder_cards?.active_cards ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total: {stats?.welder_cards?.total_cards ?? 0} | Inactive: {stats?.welder_cards?.inactive_cards ?? 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Testing Reports
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.welder_testing_reports?.total_reports ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Welders Tested: {stats?.welder_testing_reports?.total_welders_tested ?? 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Qualifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">John Smith - GTAW Certification</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Passed
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Sarah Johnson - SMAW Recert</p>
                  <p className="text-sm text-muted-foreground">5 days ago</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Passed
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Mike Wilson - GMAW Test</p>
                  <p className="text-sm text-muted-foreground">1 week ago</p>
                </div>
              </div>
              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Welder Activity Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 bg-secondary rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ 
                          width: `${Math.min((stats?.welders?.activity_rate ?? 0), 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stats?.welders?.activity_rate?.toFixed(0) ?? 0}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cards Activity Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 bg-secondary rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ 
                          width: `${Math.min((stats?.welder_cards?.activity_rate ?? 0), 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stats?.welder_cards?.activity_rate?.toFixed(0) ?? 0}%
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <p className="text-sm font-medium">Statistics Overview</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Reports</span>
                    <Badge variant="secondary">{stats?.welder_testing_reports?.total_reports ?? 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Performance Records</span>
                    <Badge variant="secondary">{stats?.welder_operator_performance?.total_records ?? 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total PQRs</span>
                    <Badge variant="secondary">{stats?.welder_pqrs?.total_pqrs ?? 0}</Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
