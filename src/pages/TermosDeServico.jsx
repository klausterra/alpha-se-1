
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Scale, Shield, AlertTriangle } from "lucide-react";

export default function TermosDeServico() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Scale className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Termos de Serviço
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estes termos regulam o uso da plataforma Alpha-se. Ao usar nossos serviços, você concorda com estes termos.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Sobre o Alpha-se</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  O Alpha-se é uma plataforma digital que conecta moradores e visitantes dos condomínios 
                  Alphaville para compra, venda e contratação de serviços de forma segura e prática.
                </p>
                <p>
                  <strong>Importante:</strong> O Alpha-se atua como uma plataforma de conexão entre usuários. 
                  Não somos parte das transações realizadas entre os usuários e não nos responsabilizamos 
                  pelas negociações, produtos ou serviços oferecidos.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Elegibilidade e Cadastro</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Moradores:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Devem comprovar residência em condomínios Alphaville</li>
                  <li>Têm acesso completo e gratuito à plataforma</li>
                  <li>Podem criar anúncios ilimitados</li>
                </ul>
                
                <p><strong>Visitantes:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Pessoas que não residem nos condomínios Alphaville</li>
                  <li>Pagam taxa de R$ 9,99 para acesso de 30 dias</li>
                  <li>Podem criar e visualizar anúncios durante o período pago</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Uso Adequado da Plataforma</h2>
              <div className="space-y-4 text-gray-700">
                <p>Você concorda em:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fornecer informações verdadeiras e precisas</li>
                  <li>Manter seus dados de contato atualizados</li>
                  <li>Usar a plataforma apenas para fins legais</li>
                  <li>Respeitar outros usuários da comunidade</li>
                  <li>Não publicar conteúdo ofensivo, discriminatório ou ilegal</li>
                  <li>Não tentar burlar os sistemas de segurança</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Anúncios e Transações</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Criação de Anúncios:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Você é responsável pela veracidade das informações</li>
                  <li>Não é permitido anunciar produtos ilegais ou proibidos</li>
                  <li>Reservamo-nos o direito de remover anúncios inadequados</li>
                </ul>
                
                <p><strong>Transações:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>As negociações ocorrem diretamente entre compradores e vendedores</li>
                  <li>O Alpha-se não participa das transações financeiras</li>
                  <li>Recomendamos sempre verificar a idoneidade antes de comprar/vender</li>
                  <li>Use locais seguros para encontros presenciais</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">Limitações de Responsabilidade</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p><strong>O Alpha-se NÃO se responsabiliza por:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Qualidade, segurança ou legalidade dos produtos/serviços anunciados</li>
                  <li>Veracidade das informações fornecidas pelos usuários</li>
                  <li>Cumprimento de acordos entre compradores e vendedores</li>
                  <li>Perdas financeiras resultantes de transações entre usuários</li>
                  <li>Danos causados por produtos/serviços adquiridos através da plataforma</li>
                  <li>Problemas de comunicação entre usuários</li>
                </ul>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <p className="text-amber-800">
                    <strong>Aviso Importante:</strong> Sempre exerça cautela ao realizar transações. 
                    Verifique a idoneidade dos outros usuários, teste produtos antes da compra e 
                    use métodos de pagamento seguros.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pagamentos e Reembolsos</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Taxa de Visitante:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Valor: R$ 9,99 por período de 30 dias</li>
                  <li>Pagamento processado via Stripe (seguro e confiável)</li>
                  <li>Acesso liberado imediatamente após confirmação</li>
                  <li>Renovação necessária após expiração</li>
                </ul>
                
                <p><strong>Política de Reembolso:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Reembolsos serão analisados caso a caso</li>
                  <li>Problemas técnicos que impeçam o uso da plataforma</li>
                  <li>Solicitações devem ser feitas em até 7 dias</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Suspensão e Encerramento</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Podemos suspender ou encerrar sua conta se:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Houver violação destes Termos de Serviço</li>
                  <li>Detectarmos atividade fraudulenta ou suspeita</li>
                  <li>Não fornecer documentação adequada quando solicitada</li>
                  <li>Receber múltiplas reclamações de outros usuários</li>
                  <li>Usar a plataforma para fins comerciais não autorizados</li>
                </ul>
                
                <p>
                  Você pode encerrar sua conta a qualquer momento através das configurações 
                  do perfil ou entrando em contato conosco.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Modificações dos Termos</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Reservamo-nos o direito de modificar estes Termos de Serviço a qualquer momento. 
                  Quando fizermos alterações significativas:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Notificaremos você por e-mail</li>
                  <li>Publicaremos um aviso destacado na plataforma</li>
                  <li>As alterações entrarão em vigor 7 dias após a notificação</li>
                </ul>
                <p>
                  O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lei Aplicável</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Estes Termos de Serviço são regidos pelas leis brasileiras. Quaisquer disputas 
                  serão resolvidas pelos tribunais competentes do Brasil.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Entre em Contato</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  Para dúvidas sobre estes Termos de Serviço ou questões relacionadas à plataforma:
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
