
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Anuncio } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Star,
  DollarSign,
  Eye,
  AlertTriangle,
  ClipboardCheck,
  Mail,
  Gift,
  Loader2 
} from "lucide-react";

import AdminStats from "../components/admin/AdminStats";
import UserApprovals from "../components/admin/UserApprovals";
import AdManagement from "../components/admin/AdManagement";
import UserManagement from "../components/admin/UserManagement";
import EmailTemplateManager from "../components/admin/EmailTemplateManager";
import InfluencerManagement from "../components/admin/InfluencerManagement";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      if (userData.user_type !== 'administrador') {
        window.location.href = "/";
        return;
      }
      setUser(userData);

      const [usersData, anunciosData] = await Promise.all([
        User.list(),
        Anuncio.list("-created_date")
      ]);

      setUsers(usersData);
      setAnuncios(anunciosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setLoading(false);
  };

  const handleUserAction = async (userId, action) => {
    try {
        let updateData = {};
        const expirationDate = new Date();

        switch (action) {
            case 'approve_morador':
                updateData = {
                    user_type: 'morador',
                    approval_status: 'approved',
                    data_expiracao: null,
                };
                break;
            case 'approve_visitante_3':
                expirationDate.setDate(expirationDate.getDate() + 3);
                updateData = {
                    user_type: 'visitante',
                    approval_status: 'approved',
                    payment_status: 'paid',
                    data_expiracao: expirationDate.toISOString().split('T')[0],
                };
                break;
            case 'approve_visitante_30':
                expirationDate.setDate(expirationDate.getDate() + 30);
                updateData = {
                    user_type: 'visitante',
                    approval_status: 'approved',
                    payment_status: 'paid',
                    data_expiracao: expirationDate.toISOString().split('T')[0],
                };
                break;
            case 'reject':
                updateData = { approval_status: 'rejected' };
                break;
            default:
                return;
        }

        await User.update(userId, updateData);
        await loadData();
    } catch (error) {
        console.error("Erro ao atualizar status do usuário:", error);
    }
  };

  const handleUserUpdate = async (userId, data) => {
    try {
      await User.update(userId, data);
      await loadData();
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleUserDelete = async (userId) => {
    try {
      await User.delete(userId);
      await loadData();
    } catch (error) {
      console.error("Erro ao apagar usuário:", error);
    }
  };

  const handleAdAction = async (adId, action, value = null) => {
    try {
      const updateData = {};
      
      if (action === 'approve') {
        updateData.status = 'active';
      } else if (action === 'reject') {
        updateData.status = 'rejected';
      } else if (action === 'highlight') {
        updateData.destacado = value;
      } else if (action === 'delete') {
        await Anuncio.delete(adId);
        await loadData();
        return;
      }

      await Anuncio.update(adId, updateData);
      await loadData();
    } catch (error) {
      console.error("Erro ao atualizar anúncio:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
            Painel Administrativo
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Gerencie usuários, anúncios e monitore a plataforma
          </p>
        </div>

        <AdminStats users={users} anuncios={anuncios} />

        <Tabs defaultValue="approvals" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="approvals" className="flex flex-col items-center gap-1 py-3 px-2 text-xs md:text-sm">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Aprovações</span>
              <span className="sm:hidden">Aprov.</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex flex-col items-center gap-1 py-3 px-2 text-xs md:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Anúncios</span>
              <span className="sm:hidden">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex flex-col items-center gap-1 py-3 px-2 text-xs md:text-sm">
              <Users className="w-4 h-4" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="influencers" className="flex flex-col items-center gap-1 py-3 px-2 text-xs md:text-sm">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Influencers</span>
               <span className="sm:hidden">Influ.</span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex flex-col items-center gap-1 py-3 px-2 text-xs md:text-sm">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Emails</span>
              <span className="sm:hidden">Email</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals">
            <UserApprovals 
              users={users} 
              onAction={handleUserAction}
              onExtractionSuccess={loadData}
            />
          </TabsContent>

          <TabsContent value="ads">
            <AdManagement 
              anuncios={anuncios} 
              onAdAction={handleAdAction}
            />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement 
              users={users} 
              onUserUpdate={handleUserUpdate}
              onUserDelete={handleUserDelete}
            />
          </TabsContent>

          <TabsContent value="influencers">
            <InfluencerManagement />
          </TabsContent>

          <TabsContent value="emails">
            <EmailTemplateManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
