
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Edit, Trash2, AlertTriangle, Phone, Mail, ExternalLink, FileText, Users, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GoogleDriveViewer from "../shared/GoogleDriveViewer";

export default function UserManagement({ users, onUserUpdate, onUserDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    user_type: "all",
    approval_status: "all",
    payment_status: "all",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewingFileUrl, setViewingFileUrl] = useState(null);
  const [viewingFileTitle, setViewingFileTitle] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    user_type: "morador",
    approval_status: "pending",
    payment_status: "pending"
  });

  const handleViewProof = (url, title) => {
    if (!url) {
      alert("Não há arquivo para visualizar.");
      return;
    }
    setViewingFileUrl(url);
    setViewingFileTitle(title);
  };

  const handleDownloadProof = (url, userName, proofType) => {
    if (!url) {
        alert("Não há arquivo para baixar.");
        return;
    }
    const link = document.createElement('a');
    link.href = url;
    const extension = url.split('.').pop().split('?')[0] || 'file';
    const filename = `${(userName || 'user').replace(/\s/g, '_')}_${proofType}_${new Date().toISOString().split('T')[0]}.${extension}`;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(user => {
    const searchTermMatch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const typeMatch = filters.user_type === 'all' || user.user_type === filters.user_type;
    const approvalMatch = filters.approval_status === 'all' || user.approval_status === filters.approval_status;
    const paymentMatch = filters.payment_status === 'all' || (user.payment_status || 'pending') === filters.payment_status;

    return searchTermMatch && typeMatch && approvalMatch && paymentMatch;
  });

  const openEditDialog = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      phone: user.phone || "",
      user_type: user.user_type,
      approval_status: user.approval_status,
      payment_status: user.payment_status || "pending"
    });
  };

  const handleSave = async () => {
    await onUserUpdate(editingUser.id, formData);
    setEditingUser(null);
  };

  const handleDelete = async () => {
    await onUserDelete(editingUser.id);
    setIsDeleteDialogOpen(false);
    setEditingUser(null);
  };

  const getStatusLabel = (status) => ({
    pending: "Em Análise",
    approved: "Ativo",
    rejected: "Inativo",
    paid: "Pago",
    expired: "Expirado"
  }[status] || status);

  const getStatusColor = (status) => ({
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    paid: "bg-blue-100 text-blue-800",
    expired: "bg-orange-100 text-orange-800"
  }[status] || "bg-gray-100");

  const getUserTypeLabel = (type) => ({
    morador: "Morador",
    visitante: "Visitante",
    administrador: "Admin"
  }[type] || type);

  const getUserTypeColor = (type) => ({
    morador: "bg-blue-50 text-blue-700 border-blue-200",
    visitante: "bg-purple-50 text-purple-700 border-purple-200",
    administrador: "bg-indigo-50 text-indigo-700 border-indigo-200"
  }[type] || "bg-gray-50 text-gray-700 border-gray-200");

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Gerenciar Usuários</CardTitle>
          <CardDescription className="text-sm">
            Busque, edite ou apague usuários da plataforma.
          </CardDescription>
          <div className="space-y-4 pt-3">
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={filters.user_type} onValueChange={(value) => handleFilterChange('user_type', value)}>
                <SelectTrigger><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="morador">Morador</SelectItem>
                  <SelectItem value="visitante">Visitante</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.approval_status} onValueChange={(value) => handleFilterChange('approval_status', value)}>
                <SelectTrigger><SelectValue placeholder="Filtrar por aprovação" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status (Aprovação)</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="pending">Em Análise</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.payment_status} onValueChange={(value) => handleFilterChange('payment_status', value)}>
                <SelectTrigger><SelectValue placeholder="Filtrar por pagamento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status (Pagamento)</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum usuário encontrado</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <Card key={user.id} className="p-4 shadow-sm">
                  <div className="space-y-3">
                    {/* Header do usuário */}
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.picture || user.profile_picture_url} />
                        <AvatarFallback className="text-sm">{user.full_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user.full_name || 'Nome não informado'}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={`text-xs ${getUserTypeColor(user.user_type)} border`}>
                        {getUserTypeLabel(user.user_type)}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(user.approval_status)}`}>
                        {getStatusLabel(user.approval_status)}
                      </Badge>
                      {user.user_type === 'visitante' && user.payment_status && (
                        <Badge className={`text-xs ${getStatusColor(user.payment_status)}`}>
                          Pag: {getStatusLabel(user.payment_status)}
                        </Badge>
                      )}
                    </div>

                    {/* Botão de ação */}
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        className="text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status Aprovação</TableHead>
                  <TableHead>Status Pagamento</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 mb-2 opacity-50" />
                        <p>Nenhum usuário encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.picture || user.profile_picture_url} />
                            <AvatarFallback>{user.full_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getUserTypeColor(user.user_type)} border`}>
                          {getUserTypeLabel(user.user_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.approval_status)}>
                          {getStatusLabel(user.approval_status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.user_type === 'visitante' && user.payment_status && (
                          <Badge className={getStatusColor(user.payment_status)}>
                            {getStatusLabel(user.payment_status)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" onClick={() => openEditDialog(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="sm:max-w-[480px] mx-4">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription className="truncate">{editingUser.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
               {/* Avatar do Usuário */}
               <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={editingUser.profile_picture_url || editingUser.picture} />
                  <AvatarFallback className="bg-gray-200 text-gray-500 text-xl">
                    {editingUser.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
              </div>

               <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label>Tipo de Usuário</Label>
                <Select value={formData.user_type} onValueChange={(v) => setFormData({...formData, user_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morador">Morador</SelectItem>
                    <SelectItem value="visitante">Visitante</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status de Aprovação</Label>
                <Select value={formData.approval_status} onValueChange={(v) => setFormData({...formData, approval_status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Em Análise</SelectItem>
                    <SelectItem value="approved">Ativo</SelectItem>
                    <SelectItem value="rejected">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.user_type === 'visitante' && (
                <div>
                  <Label>Status do Pagamento</Label>
                  <Select value={formData.payment_status} onValueChange={(v) => setFormData({...formData, payment_status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Documentos Enviados */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="font-medium">Documentos Enviados</Label>
                {/* Comprovante de Residência */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500"/>
                    <span className="text-sm">Comprovante de Residência</span>
                  </div>
                  {editingUser.residence_proof_url ? (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleViewProof(editingUser.residence_proof_url, `Residência - ${editingUser.full_name}`)}
                      >
                        <ExternalLink className="w-3 h-3"/>Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleDownloadProof(editingUser.residence_proof_url, editingUser.full_name, 'residencia')}
                      >
                        <Download className="w-3 h-3"/>Baixar
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Não enviado</span>
                  )}
                </div>
                {/* Comprovante de Pagamento */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500"/>
                    <span className="text-sm">Comprovante de Pagamento</span>
                  </div>
                  {editingUser.payment_proof_url ? (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleViewProof(editingUser.payment_proof_url, `Pagamento - ${editingUser.full_name}`)}
                      >
                        <ExternalLink className="w-3 h-3"/>Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleDownloadProof(editingUser.payment_proof_url, editingUser.full_name, 'pagamento')}
                      >
                        <Download className="w-3 h-3"/>Baixar
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Não enviado</span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full sm:w-auto order-2 sm:order-1"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar
              </Button>
              <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                 <Button
                   variant="outline"
                   onClick={() => setEditingUser(null)}
                   className="flex-1 sm:flex-none"
                   size="sm"
                 >
                   Cancelar
                 </Button>
                 <Button
                   onClick={handleSave}
                   className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                   size="sm"
                 >
                   Salvar
                 </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      {isDeleteDialogOpen && (
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="mx-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500 w-5 h-5" />
                  Confirmar Exclusão
                </DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja apagar o usuário <strong>{editingUser?.full_name}</strong>?
                  Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full sm:w-auto"
                >
                  Confirmar Exclusão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      )}

      {/* Dialog para Visualizar Comprovante - New Dialog for GoogleDriveViewer */}
      <Dialog open={!!viewingFileUrl} onOpenChange={() => setViewingFileUrl(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 sm:p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{viewingFileTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
             <GoogleDriveViewer fileUrl={viewingFileUrl} height="100%" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
