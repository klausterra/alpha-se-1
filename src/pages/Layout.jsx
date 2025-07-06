

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Influencer } from "@/api/entities"; // Importar
import {
  Home,
  Plus,
  Search,
  User as UserIcon,
  Settings,
  Menu,
  X,
  LogOut,
  Phone,
  MessageCircle,
  Instagram,
  Gift // Importar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { sendNotificationEmail } from "@/api/functions";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "@/components/auth/LoginForm";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isInfluencer, setIsInfluencer] = useState(false); // Novo estado
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSendingWelcomeEmail, setIsSendingWelcomeEmail] = useState(false);
  const [isSendingAdminNotification, setIsSendingAdminNotification] = useState(false);


  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      let userData = await User.me();
      
      // Checa se o visitante expirou e atualiza o status se necessário
      if (userData?.user_type === 'visitante' && userData?.approval_status === 'approved' && userData?.data_expiracao) {
          const expirationDate = new Date(userData.data_expiracao);
          const today = new Date();
          // Garante que a comparação seja apenas por data, ignorando a hora
          expirationDate.setHours(23, 59, 59, 999); // Set to end of day for comparison

          today.setHours(0, 0, 0, 0); // Set today to start of day for comparison

          if (expirationDate.getTime() < today.getTime()) { // Compare using getTime()
              await User.updateMyUserData({ approval_status: 'rejected', payment_status: 'expired' });
              // Recarrega os dados do usuário para refletir a mudança
              userData = await User.me();
          }
      }
      
      setUser(userData);

      // Verifica se o usuário é um influencer
      if (userData) {
          const influencerData = await Influencer.filter({ email: userData.email }, '', 1);
          if (influencerData.length > 0) {
              setIsInfluencer(true);
          }
      }

      // Verificar se é um novo usuário e enviar email de boas-vindas
      if (userData && !userData.welcome_email_sent && !isSendingWelcomeEmail) {
        setIsSendingWelcomeEmail(true); // Ativa o bloqueio para não enviar de novo
        try {
          const { sendWelcomeEmail } = await import("@/api/functions");
          await sendWelcomeEmail({
            userEmail: userData.email,
            userName: userData.full_name || 'Usuário',
            userType: userData.user_type || 'visitante'
          });
          
          // Marcar que o email foi enviado
          await User.updateMyUserData({ welcome_email_sent: true });
        } catch (emailError) {
          console.log('Erro ao enviar email de boas-vindas:', emailError);
          // Não bloquear o login se o email falhar
        } finally {
          setIsSendingWelcomeEmail(false); // Libera o bloqueio
        }
      }

      // Email de notificação para admin
      if (userData && !userData.new_user_notification_sent && !isSendingAdminNotification) {
        setIsSendingAdminNotification(true); // Ativa o bloqueio para não enviar de novo
        try {
          await sendNotificationEmail({
            to: "contato@alpha-se.com.br",
            subject: "Novo Usuário Cadastrado - Alpha-se",
            body: `
              Um novo usuário se cadastrou na plataforma Alpha-se.

              Nome: ${userData.full_name}
              Email: ${userData.email}

              Por favor, acesse o painel de administração para revisar e aprovar o cadastro.
            `
          });
          
          // Marcar que o email de notificação foi enviado
          await User.updateMyUserData({ new_user_notification_sent: true });

        } catch (emailError) {
          console.log('Notification email failed:', emailError);
          // Não bloquear o login se o email falhar
        } finally {
          setIsSendingAdminNotification(false); // Libera o bloqueio
        }
      }

    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
    window.location.href = createPageUrl("Home");
  };

  const navigationItems = [
    { name: "Início", url: createPageUrl("Home"), icon: Home },
    { name: "Anúncios", url: createPageUrl("Anuncios"), icon: Search },
    { name: "Criar Anúncio", url: createPageUrl("CriarAnuncio"), icon: Plus },
  ];

  if (user) {
    navigationItems.push({
      name: "Conversas",
      url: createPageUrl("Conversas"),
      icon: MessageCircle
    });
  }
  
  if (isInfluencer) { // Adiciona link do painel do influencer
    navigationItems.push({
      name: "Painel Influencer",
      url: createPageUrl("InfluencerDashboard"),
      icon: Gift
    });
  }

  if (user?.user_type === 'administrador') {
    navigationItems.push({
      name: "Admin",
      url: createPageUrl("Admin"),
      icon: Settings
    });
  }

  navigationItems.push({
    name: "Meu Perfil",
    url: createPageUrl("Perfil"),
    icon: UserIcon
  });

  // Se for a página de chat, renderiza apenas o conteúdo dela, sem o layout principal.
  if (currentPageName === 'Chat') {
    return (
      <>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            // Passa dados do usuário para a página de chat, caso precise
            return React.cloneElement(child, { user, userLoading: loading });
          }
          return child;
        })}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <style>{`
        :root {
          --alpha-green: #22c55e;
          --alpha-dark: #16a34a;
          --alpha-light: #dcfce7;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4f8d08c82_Alphase.png"
                alt="Alpha-se Logo"
                className="w-10 h-10"
              />
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900">Alpha-se</h1>
                <p className="text-xs text-green-600 -mt-1">Seu vizinho tem!</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    location.pathname === item.url
                      ? "bg-green-100 text-green-700 font-semibold"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50 font-medium"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {user.full_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-green-600 text-xs capitalize">{user.user_type}</p>
                    </div>
                  </div>
                  <Link to={createPageUrl("Perfil")}>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-green-600">
                      <UserIcon className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LoginButton />
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-green-100 relative z-50">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.url
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            // Passa o usuário e o status de loading para a página filha
            return React.cloneElement(child, { user, userLoading: loading });
          }
          return child;
        })}
      </main>

      {/* Footer */}
      {currentPageName !== 'Chat' && (
        <footer className="bg-white border-t border-green-100 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4f8d08c82_Alphase.png"
                    alt="Alpha-se Logo"
                    className="w-8 h-8"
                  />
                  <span className="text-xl font-bold text-gray-900">Alpha-se</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Conectando moradores e visitantes do Alphaville Lagoa dos Ingleses.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contato</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp: (31) 99555-7007</span>
                  </div>
                  <a 
                    href="https://www.instagram.com/alphase.oficial" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>@alphase.oficial</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Links Úteis</h3>
                <div className="space-y-2">
                  <Link 
                    to={createPageUrl("PoliticaPrivacidade")} 
                    className="block text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    Política de Privacidade
                  </Link>
                  <Link 
                    to={createPageUrl("TermosDeServico")} 
                    className="block text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    Termos de Serviço
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Informações</h3>
                <p className="text-xs text-gray-500">
                  O Alpha-se é uma plataforma que conecta pessoas. Não nos responsabilizamos pelas negociações realizadas entre os usuários.
                </p>
              </div>
            </div>

            <div className="border-t border-green-100 mt-8 pt-6 text-center">
              <p className="text-sm text-gray-500">
                © 2025 Alpha-se. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

// Componente separado para o botão de login
function LoginButton() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    // Reload the page to ensure the Layout component re-fetches user data
    window.location.reload(); 
  };

  return (
    <>
      <Button
        onClick={() => setShowLoginDialog(true)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Entrar
      </Button>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md p-0 border-0">
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onClose={() => setShowLoginDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

