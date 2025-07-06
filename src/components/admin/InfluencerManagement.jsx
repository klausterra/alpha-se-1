
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, DollarSign, Copy, Users, TrendingUp, ExternalLink } from "lucide-react";
import { Influencer } from '@/api/entities';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

const PRODUCTION_BASE_URL = 'https://alpha-se-cb653d08.base44.app';

export default function InfluencerManagement() {
  const [influencers, setInfluencers] = useState([]);
  const [influencerStats, setInfluencerStats] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState(null);
  const [formData, setFormData] = useState({ nome: '', email: '', codigo_indicacao: '' });
  const [payAmount, setPayAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = async () => {
    setLoading(true);
    try {
      const data = await Influencer.list();
      setInfluencers(data);
      
      // Carregar estatísticas para cada influencer
      const stats = {};
      for (const influencer of data) {
        const indicados = await User.filter({ influencer_id: influencer.id });
        
        // Calcular estatísticas por período
        const hoje = new Date();
        const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const inicioSemana = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        
        stats[influencer.id] = {
          total: indicados.length,
          hoje: indicados.filter(user => new Date(user.created_date) >= inicioHoje).length,
          semana: indicados.filter(user => new Date(user.created_date) >= inicioSemana).length,
          mes: indicados.filter(user => new Date(user.created_date) >= inicioMes).length,
          pagos: indicados.filter(user => user.payment_status === 'paid').length
        };
      }
      
      setInfluencerStats(stats);
    } catch (error) {
      console.error('Erro ao carregar influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleOpenDialog = (influencer = null) => {
    setEditingInfluencer(influencer);
    if (influencer) {
      setFormData(influencer);
    } else {
      setFormData({ nome: '', email: '', codigo_indicacao: generateRandomCode() });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const link = `${PRODUCTION_BASE_URL}${createPageUrl('Cadastro')}?ref=${formData.codigo_indicacao}`;
    const dataToSave = { ...formData, link_personalizado: link };

    if (editingInfluencer) {
      await Influencer.update(editingInfluencer.id, dataToSave);
    } else {
      await Influencer.create(dataToSave);
    }
    await loadInfluencers();
    setIsDialogOpen(false);
  };
  
  const handleOpenPayDialog = (influencer) => {
    setEditingInfluencer(influencer);
    setIsPayDialogOpen(true);
    const pendente = influencer.total_comissao_acumulada - influencer.total_comissao_paga;
    setPayAmount(pendente > 0 ? pendente : 0);
  };
  
  const handleConfirmPayment = async () => {
    if (!editingInfluencer || payAmount <= 0) return;
    
    const newTotalPaid = (editingInfluencer.total_comissao_paga || 0) + parseFloat(payAmount);
    
    await Influencer.update(editingInfluencer.id, {
      total_comissao_paga: newTotalPaid
    });
    
    await loadInfluencers();
    setIsPayDialogOpen(false);
    setEditingInfluencer(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copiado para a área de transferência!');
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando influencers...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciar Influencers</CardTitle>
            <CardDescription>Adicione, edite e gerencie seus parceiros de afiliação.</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Influencer
          </Button>
        </CardHeader>
        <CardContent>
          {influencers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum influencer cadastrado</h3>
              <p className="text-gray-600 mb-4">Comece adicionando seu primeiro parceiro de afiliação.</p>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Primeiro Influencer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Versão Mobile */}
              <div className="md:hidden space-y-4">
                {influencers.map(inf => {
                  const stats = influencerStats[inf.id] || { total: 0, hoje: 0, semana: 0, mes: 0, pagos: 0 };
                  const comissaoPendente = (inf.total_comissao_acumulada || 0) - (inf.total_comissao_paga || 0);
                  const referralLink = `${PRODUCTION_BASE_URL}${createPageUrl('Cadastro')}?ref=${inf.codigo_indicacao}`;
                  
                  return (
                    <Card key={inf.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{inf.nome}</h3>
                            <p className="text-sm text-gray-600">{inf.email}</p>
                            <Badge variant="outline" className="mt-1">
                              Código: {inf.codigo_indicacao}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="icon" onClick={() => handleOpenPayDialog(inf)}>
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleOpenDialog(inf)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="font-medium text-blue-900">Total</p>
                            <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <p className="font-medium text-green-900">Pagos</p>
                            <p className="text-xl font-bold text-green-600">{stats.pagos}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm font-medium mb-2">Comissão Pendente</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(comissaoPendente)}</p>
                        </div>
                        
                        <div className="border-t pt-3">
                          <p className="text-xs text-gray-600 mb-2">Link de Indicação:</p>
                          <div className="flex items-center gap-2">
                            <Input 
                              value={referralLink} 
                              readOnly 
                              className="text-xs"
                            />
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => copyToClipboard(referralLink)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              
              {/* Versão Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Influencer</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Indicações</TableHead>
                      <TableHead>Comissões</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {influencers.map(inf => {
                      const stats = influencerStats[inf.id] || { total: 0, hoje: 0, semana: 0, mes: 0, pagos: 0 };
                      const comissaoPendente = (inf.total_comissao_acumulada || 0) - (inf.total_comissao_paga || 0);
                      const referralLink = `${PRODUCTION_BASE_URL}${createPageUrl('Cadastro')}?ref=${inf.codigo_indicacao}`;
                      
                      return (
                        <TableRow key={inf.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{inf.nome}</p>
                              <p className="text-sm text-gray-500">{inf.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{inf.codigo_indicacao}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{stats.total} total</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                <p>💰 {stats.pagos} pagaram</p>
                                <p>📅 {stats.mes} este mês</p>
                                <p>📊 {stats.semana} esta semana</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-green-600">{formatCurrency(comissaoPendente)}</p>
                              <p className="text-xs text-gray-500">Pago: {formatCurrency(inf.total_comissao_paga || 0)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 max-w-xs">
                              <Input 
                                value={referralLink}
                                readOnly 
                                className="text-xs"
                              />
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => copyToClipboard(referralLink)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleOpenPayDialog(inf)}>
                                  <DollarSign className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleOpenDialog(inf)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInfluencer ? 'Editar' : 'Novo'} Influencer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Nome</Label><Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} /></div>
            <div><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div><Label>Código de Indicação</Label><Input value={formData.codigo_indicacao} onChange={e => setFormData({...formData, codigo_indicacao: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para Pagamento */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Registrar Pagamento de Comissão</DialogTitle>
                  <p>Influencer: {editingInfluencer?.nome}</p>
              </DialogHeader>
              <div className="py-4">
                  <Label>Valor a Pagar</Label>
                  <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                  <p className="text-sm text-muted-foreground mt-2">
                      Este valor será somado ao total já pago ao influencer.
                  </p>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleConfirmPayment}>Confirmar Pagamento</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
