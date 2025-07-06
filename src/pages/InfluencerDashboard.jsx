
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Influencer } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Link as LinkIcon, Copy, Calendar, TrendingUp, Clock } from "lucide-react";

const PRODUCTION_BASE_URL = 'https://alpha-se-cb653d08.base44.app';

export default function InfluencerDashboard() {
  const [influencer, setInfluencer] = useState(null);
  const [indicados, setIndicados] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    hoje: 0,
    semana: 0,
    mes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await User.me();
        const influencerData = await Influencer.filter({ email: currentUser.email });
        
        if (influencerData.length > 0) {
          const currentInfluencer = influencerData[0];
          setInfluencer(currentInfluencer);
          
          const indicadosData = await User.filter({ influencer_id: currentInfluencer.id });
          setIndicados(indicadosData);
          
          // Calcular estatísticas
          const hoje = new Date();
          const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
          const inicioSemana = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
          const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          
          const statsCalculadas = {
            total: indicadosData.length,
            hoje: indicadosData.filter(user => new Date(user.created_date) >= inicioHoje).length,
            semana: indicadosData.filter(user => new Date(user.created_date) >= inicioSemana).length,
            mes: indicadosData.filter(user => new Date(user.created_date) >= inicioMes).length
          };
          
          setStats(statsCalculadas);
        } else {
          // Se não for um influencer, redireciona
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Erro ao carregar dados do influencer", error);
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Link copiado para a área de transferência!");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };
  
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>;
  }

  if (!influencer) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Acesso não autorizado.</div>;
  }

  const referralLink = `${PRODUCTION_BASE_URL}/Cadastro?ref=${influencer.codigo_indicacao}`;
  const comissaoPendente = influencer.total_comissao_acumulada - influencer.total_comissao_paga;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Painel do Influencer</h1>
          <p className="text-gray-600">Bem-vindo(a), {influencer.nome}! Acompanhe seus resultados.</p>
        </div>

        {/* Estatísticas Financeiras */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Pendente</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(comissaoPendente)}</div>
              <p className="text-xs text-muted-foreground">Total já pago: {formatCurrency(influencer.total_comissao_paga)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seu Link de Indicação</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input value={referralLink} readOnly className="text-sm" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Compartilhe este link para ganhar comissões</p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas de Indicações */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Indicados</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Todos os tempos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.mes}</div>
              <p className="text-xs text-muted-foreground">Cadastros em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.semana}</div>
              <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.hoje}</div>
              <p className="text-xs text-muted-foreground">Cadastros de hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Indicados */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Indicados</CardTitle>
            <CardDescription>Lista de usuários que se cadastraram usando seu código ({stats.total} no total).</CardDescription>
          </CardHeader>
          <CardContent>
            {indicados.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum indicado ainda</h3>
                <p className="text-gray-600 mb-4">Compartilhe seu link para começar a ganhar comissões!</p>
                <Button onClick={() => copyToClipboard(referralLink)} className="bg-green-600 hover:bg-green-700">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link de Indicação
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Status Pagamento</TableHead>
                      <TableHead>Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicados.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.created_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge variant={user.payment_status === 'paid' ? 'default' : 'outline'} className={user.payment_status === 'paid' ? 'bg-green-100 text-green-800' : ''}>
                            {user.payment_status === 'paid' ? '✅ Pago' : '⏳ Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${user.payment_status === 'paid' ? 'text-green-600' : 'text-gray-400'}`}>
                            {user.payment_status === 'paid' ? 'R$ 0,99' : 'R$ 0,00'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
