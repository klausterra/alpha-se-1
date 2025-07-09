import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle, AlertTriangle } from "lucide-react";

export default function AdminStats({ users, anuncios }) {
  const stats = [
    {
      title: "Total de Usuários",
      value: users.length,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Usuários Pendentes",
      value: users.filter(u => u.approval_status === 'pending').length,
      icon: AlertTriangle,
      color: "text-orange-600"
    },
    {
      title: "Total de Anúncios",
      value: anuncios.length,
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Anúncios Ativos",
      value: anuncios.filter(a => a.status === 'active').length,
      icon: CheckCircle,
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}