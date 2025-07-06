
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Users } from "lucide-react";

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidade
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sua privacidade é importante para nós. Esta política explica como coletamos, usamos e protegemos suas informações no Alpha-se.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Informações que Coletamos</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Coletamos informações que você nos fornece diretamente ao se cadastrar e usar nossa plataforma:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nome completo e endereço de e-mail</li>
                  <li>Número de telefone/WhatsApp para contato</li>
                  <li>Informações do condomínio (para moradores)</li>
                  <li>Fotos e descrições dos anúncios que você publica</li>
                  <li>Mensagens enviadas através do sistema de chat</li>
                  <li>Comprovantes de residência ou pagamento (quando aplicável)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Como Usamos suas Informações</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Utilizamos suas informações para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Criar e manter sua conta na plataforma</li>
                  <li>Verificar sua elegibilidade como morador ou visitante</li>
                  <li>Facilitar a comunicação entre compradores e vendedores</li>
                  <li>Processar pagamentos de visitantes</li>
                  <li>Enviar notificações importantes sobre sua conta</li>
                  <li>Melhorar nossos serviços e funcionalidades</li>
                  <li>Garantir a segurança e prevenir fraudes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Compartilhamento de Informações</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Não vendemos, alugamos ou comercializamos suas informações pessoais.</strong>
                </p>
                <p>Podemos compartilhar suas informações apenas nas seguintes situações:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Com outros usuários da plataforma (nome e foto no perfil público)</li>
                  <li>Com provedores de serviços que nos auxiliam (processamento de pagamentos, hospedagem)</li>
                  <li>Quando exigido por lei ou para proteger nossos direitos legais</li>
                  <li>Em caso de fusão, aquisição ou venda de ativos (com prévia notificação)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Segurança dos Dados</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Criptografia de dados em trânsito e em repouso</li>
                  <li>Autenticação segura via Google OAuth</li>
                  <li>Controles de acesso rigorosos</li>
                  <li>Monitoramento contínuo de segurança</li>
                </ul>
                <p>
                  No entanto, nenhum método de transmissão pela internet é 100% seguro. Fazemos o possível para proteger seus dados, mas não podemos garantir segurança absoluta.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Seus Direitos</h2>
              <div className="space-y-4 text-gray-700">
                <p>Você tem o direito de:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Acessar e atualizar suas informações pessoais</li>
                  <li>Solicitar a exclusão de sua conta e dados</li>
                  <li>Retirar o consentimento para processamento de dados</li>
                  <li>Portabilidade dos seus dados</li>
                  <li>Apresentar reclamações sobre o uso de seus dados</li>
                </ul>
                <p>
                  Para exercer esses direitos, entre em contato conosco através do e-mail: 
                  <strong> contato@alpha-se.com.br</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies e Tecnologias Similares</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência na plataforma, 
                  incluindo cookies de sessão, preferências e análise de uso.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Alterações nesta Política</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos alterações 
                  significativas, notificaremos você por e-mail ou através de um aviso destacado na plataforma.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Entre em Contato</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, 
                  entre em contato conosco:
                </p>
                <div className="mt-4">
                  <p><strong>E-mail:</strong> contato@alpha-se.com.br</p>
                  <p><strong>WhatsApp:</strong> (31) 99555-7007</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            <strong>Última atualização:</strong> 30 de Janeiro de 2025
          </p>
        </div>
      </div>
    </div>
  );
}
