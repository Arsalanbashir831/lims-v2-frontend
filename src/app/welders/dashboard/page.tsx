"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Users, CreditCard, FileText, TrendingUp, Clock, CheckCircle, Loader2, ExternalLink, Eye } from "lucide-react"
import { useWelderDashboardStats } from "@/hooks/use-welder-dashboard"
import { useWelderCards } from "@/hooks/use-welder-cards"
import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { Button } from "@/components/ui/button"

export default function WeldersDashboardPage() {
  const { data: stats, isLoading, error } = useWelderDashboardStats()
  const { data: welderCardsData, isLoading: welderCardsLoading } = useWelderCards(1, "", 3)

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
                  {stats?.welders?.overview?.total_welders ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active: {stats?.welders?.overview?.active_welders ?? 0} | Activity Rate: {stats?.welders?.overview?.activity_rate?.toFixed(0) ?? 0}%
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
                  {stats?.welder_performance_records?.overview?.total_records ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active: {stats?.welder_performance_records?.overview?.active_records ?? 0} | Activity Rate: {stats?.welder_performance_records?.overview?.activity_rate?.toFixed(0) ?? 0}%
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
                  {stats?.welder_cards?.overview?.active_cards ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total: {stats?.welder_cards?.overview?.total_cards ?? 0} | Inactive: {stats?.welder_cards?.overview?.inactive_cards ?? 0}
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
                  {stats?.testing_reports?.overview?.total_reports ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active: {stats?.testing_reports?.overview?.active_reports ?? 0} | Activity Rate: {stats?.testing_reports?.overview?.activity_rate?.toFixed(0) ?? 0}%
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Welder Cards</CardTitle>
            <Link 
              href={ROUTES.APP.WELDERS.WELDER_CARDS.ROOT}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All
              <ExternalLink className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {welderCardsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : welderCardsData?.results?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No welder cards found</p>
              </div>
            ) : (
              welderCardsData?.results?.slice(0, 3).map((card) => (
                <div
                  key={card.id}
                  className="block hover:bg-muted/50 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {card.welder_info?.operator_name || 'Unknown Welder'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Card #{card.card_no} | ID: {card.welder_info?.operator_id}
                        </p>
                      </div>
                    </div>
                    <Button 
                      asChild
                      size="sm"
                      className="h-fit w-fit px-3 py-1"
                    >
                      <Link href={ROUTES.APP.WELDERS.WELDER_CARDS.VIEW(card.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
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
                          width: `${Math.min((stats?.welders?.overview?.activity_rate ?? 0), 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stats?.welders?.overview?.activity_rate?.toFixed(0) ?? 0}%
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
                          width: `${Math.min((stats?.welder_cards?.overview?.activity_rate ?? 0), 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stats?.welder_cards?.overview?.activity_rate?.toFixed(0) ?? 0}%
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <p className="text-sm font-medium">Statistics Overview</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Reports</span>
                    <Badge variant="secondary">{stats?.testing_reports?.overview?.total_reports ?? 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Performance Records</span>
                    <Badge variant="secondary">{stats?.welder_performance_records?.overview?.total_records ?? 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total PQRs</span>
                    <Badge variant="secondary">{stats?.pqrs?.overview?.total_pqrs ?? 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Certificates</span>
                    <Badge variant="secondary">{stats?.welder_certificates?.overview?.total_certificates ?? 0}</Badge>
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
