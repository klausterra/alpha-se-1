
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Anuncio } from "@/api/entities";
import { Influencer } from "@/api/entities"; // Importar entidade Influencer
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import UserInfo from "../components/perfil/UserInfo";
import UserAds from "../components/perfil/UserAds";

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMessage, setPaymentMessage] = useState({ type: "", text: ""});
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const checkPayment = async () => {
      const paymentStatus = searchParams.get("payment");
      if (paymentStatus === 'success') {
        await handleSuccessfulPayment();
      } else if (paymentStatus === 'cancel') {
        setPaymentMessage({ type: "error", text: "O pagamento foi cancelado."});
        searchParams.delete('payment');
        searchParams.delete('session_id');
        setSearchParams(searchParams, { replace: true });
      }
    };
    
    checkPayment();
    loadData();
  }, []);

  const handleSuccessfulPayment = async () => {
    try {
      // Primeiro, atualiza o status de pagamento do usuário
      await User.updateMyUserData({ payment_status: 'paid' });
      setPaymentMessage({ type: "success", text: "Pagamento confirmado com sucesso! Agora você pode criar anúncios."});
      
      // Limpa os parâmetros da URL
      searchParams.delete('payment');
      searchParams.delete('session_id');
      setSearchParams(searchParams, { replace: true });
      
      // Agora, processa a comissão do influencer
      const currentUser = await User.me();
      if (currentUser && currentUser.influencer_id) {
          const influencer = await Influencer.get(currentUser.influencer_id);
          if (influencer) {
              const valorAssinatura = 9.90; // Valor da assinatura para cálculo da comissão
              const comissao = valorAssinatura * 0.10; // 10% de comissão
              const novaComissaoAcumulada = (influencer.total_comissao_acumulada || 0) + comissao;
              
              await Influencer.update(influencer.id, {
                  total_comissao_acumulada: novaComissaoAcumulada
              });
              console.log(`Comissão de ${comissao} registrada para ${influencer.nome}`);
          }
      }
    } catch (error) {
       setPaymentMessage({ type: "error", text: "Houve um erro ao atualizar seu status de pagamento."});
       console.error("Erro ao processar pagamento ou comissão:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      const userAds = await Anuncio.filter({ created_by: userData.email }, "-created_date");
      setAnuncios(userAds);
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  };
  
  const onUserUpdate = async (updatedData) => {
    try {
      console.log("Atualizando dados do usuário:", updatedData);
      
      // Usar updateMyUserData para atualizar os dados do usuário atual
      const updatedUser = await User.updateMyUserData(updatedData);
      console.log("Dados atualizados com sucesso:", updatedUser);
      
      // Recarregar os dados do usuário para garantir que estão atualizados
      const freshUserData = await User.me();
      setUser(freshUserData);
      
      return updatedUser;
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
      throw error;
    }
  };
  
  const onAdUpdate = async (adId, updatedData) => {
    await Anuncio.update(adId, updatedData);
    await loadData(); // Recarregar anúncios
  };
  
  const onAdDelete = async (adId) => {
    await Anuncio.delete(adId);
    await loadData(); // Recarregar anúncios
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meu Perfil
          </h1>
          <p className="text-gray-600">
            Gerencie suas informações e anúncios
          </p>
        </div>

        {paymentMessage.text && (
            <Alert className={`mb-6 ${paymentMessage.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
              <AlertDescription>{paymentMessage.text}</AlertDescription>
            </Alert>
        )}

        <Tabs defaultValue="dados" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dados" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Meus Dados
            </TabsTrigger>
            <TabsTrigger value="anuncios" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Meus Anúncios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados">
            <UserInfo user={user} onUpdate={onUserUpdate} />
          </TabsContent>
          <TabsContent value="anuncios">
            <UserAds 
              anuncios={anuncios} 
              onUpdate={onAdUpdate}
              onDelete={onAdDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
