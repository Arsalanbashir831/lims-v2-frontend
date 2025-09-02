"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Users, CreditCard, FileText, TrendingUp, Clock, CheckCircle } from "lucide-react"

export default function WeldersDashboardPage() {
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
              Active Qualifications
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Certificates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              +5 from last month
            </p>
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
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              +1 from last month
            </p>
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
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
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
            <CardTitle>Certification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Valid Certifications</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 bg-secondary rounded-full">
                  <div className="h-2 w-16 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-muted-foreground">80%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expiring Soon (30 days)</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 bg-secondary rounded-full">
                  <div className="h-2 w-3 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm text-muted-foreground">15%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expired</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 bg-secondary rounded-full">
                  <div className="h-2 w-1 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm text-muted-foreground">5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
