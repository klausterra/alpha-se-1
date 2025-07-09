
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, CheckCircle, Upload, Camera, CreditCard, FileText, AlertCircle, Info, Phone, ExternalLink, Download } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { sendNotificationEmail } from "@/api/functions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createStripeCheckout } from "@/api/functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GoogleDriveViewer from "../shared/GoogleDriveViewer";

// Dummy Influencer for demonstration. In a real application, this would be an actual API integration.
const Influencer = {
  filter: async ({ codigo_indicacao }) => {
    // Simulate an asynchronous API call
    return new Promise(resolve => {
      setTimeout(() => {
        if (codigo_indicacao === "ALPHA2024") { // Example code
          resolve([{ id: "influencer_alpha", codigo_indicacao: "ALPHA2024", name: "Alpha Influencer" }]);
        } else {
          resolve([]);
        }
      }, 300);
    });
  }
};

const condominiosLagoaIngleses = {
  real: "Real", flores: "Flores", arvores: "Árvores", passaros: "Pássaros",
  inconfidentes: "Inconfidentes", mirante: "Mirante", costa_laguna: "Costa Laguna",
  reserva_laguna: "Reserva Laguna", felice: "Felice", lumiere: "Lumiere", aguas: "Águas"
};

export default function UserInfo({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(""); // Stores which doc is uploading: 'residence', 'payment', or ''
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPaying, setIsPaying] = useState(false);
  const [viewingProof, setViewingProof] = useState(null); // New state for dialog

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    nickname: user?.nickname || "",
    phone: user?.phone || "",
    user_type: user?.user_type || "visitante", // Default to visitante for new users
    condominio_principal: user?.condominio_principal || "",
    condominio_lagoa_ingleses: user?.condominio_lagoa_ingleses || "",
    address: user?.address || "",
    profile_picture_url: user?.profile_picture_url || user?.picture || "",
    // extracted_name and extracted_address are not part of formData as they are derived user properties
  });

  // Verificar se é um novo usuário que precisa completar o perfil
  const isNewUser = !user?.phone || user?.phone === '' || !user?.nickname || user?.nickname === '';
  const needsProfileCompletion = isNewUser;

  useEffect(() => {
    // Sync formData with user prop changes, especially important after initial save or external user update
    setFormData({
      full_name: user?.full_name || "",
      nickname: user?.nickname || "",
      phone: user?.phone || "",
      user_type: user?.user_type || "visitante",
      condominio_principal: user?.condominio_principal || "",
      condominio_lagoa_ingleses: user?.condominio_lagoa_ingleses || "",
      address: user?.address || "",
      profile_picture_url: user?.profile_picture_url || user?.picture || "",
    });

    // Check for temporary indication code only if it's a new user flow
    if (needsProfileCompletion) {
      const codigoTemp = localStorage.getItem('codigo_indicacao_temp');
      if (codigoTemp) {
        handleCodigoIndicacao(codigoTemp);
        localStorage.removeItem('codigo_indicacao_temp');
      }
    }
  }, [user, needsProfileCompletion]);

  const handleCodigoIndicacao = async (codigo) => {
    try {
      const influencers = await Influencer.filter({ codigo_indicacao: codigo });
      if (influencers.length > 0) {
        const influencerId = influencers[0].id;
        await onUpdate({
          codigo_indicacao_usado: codigo,
          influencer_id: influencerId
        });
        displayMessage('success', `Código de indicação "${codigo}" aplicado com sucesso!`);
      } else {
        displayMessage('error', `Código de indicação "${codigo}" inválido.`);
      }
    } catch (error) {
      console.error("Erro ao processar código de indicação:", error);
      displayMessage('error', "Erro ao processar código de indicação.");
    }
  };

  const displayMessage = (type, text, duration = 3000) => {
    setMessage({ type, text });
    if (duration !== null) { // Changed condition to allow null for no timeout
      setTimeout(() => setMessage({ type: '', text: '' }), duration);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage({ type: '', text: '' });
    try {
      // Adicionado o parâmetro is_public: true
      const { file_url } = await UploadFile({ file, is_public: true });
      await onUpdate({ profile_picture_url: file_url });
      setFormData(prev => ({ ...prev, profile_picture_url: file_url }));
      displayMessage('success', "Foto de perfil atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      displayMessage('error', "Erro ao atualizar foto de perfil.", 5000);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (e, proofType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(proofType);
    setMessage({ type: '', text: '' });
    
    try {
        displayMessage('info', 'Enviando arquivo...', null);
        const { file_url } = await UploadFile({ file });
        
        const updateData = {};
        const urlField = proofType === 'residence' ? 'residence_proof_url' : 'payment_proof_url';
        updateData[urlField] = file_url;

        await onUpdate(updateData);
        
        displayMessage('success', '✅ Comprovante enviado com sucesso!', 3000);

    } catch (error) {
        console.error('Erro no upload:', error);
        displayMessage('error', '❌ Erro ao processar o arquivo. Tente novamente.', 5000);
    } finally {
        setUploadingDoc("");
    }
  };

  const handleStripePayment = async () => {
    setIsPaying(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await createStripeCheckout();
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Não foi possível iniciar o pagamento. Resposta inválida do servidor.");
      }
    } catch (error) {
      console.error("Erro ao iniciar pagamento Stripe:", error);
      displayMessage('error', "Erro ao iniciar o pagamento. Tente novamente mais tarde.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault(); // Prevent default form submission if called from a form

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validações
      if (!formData.full_name || formData.full_name.trim() === "") {
        throw new Error("Nome completo é obrigatório.");
      }
      if (!formData.nickname || formData.nickname.trim() === "") {
        throw new Error("Apelido é obrigatório.");
      }
      if (!formData.phone || formData.phone.trim() === "") {
        throw new Error("Telefone é obrigatório.");
      }
      if (!formData.user_type) {
        throw new Error("Tipo de usuário é obrigatório.");
      }
      // Validação de endereço APENAS para moradores
      if (formData.user_type === 'morador' && (!formData.address || formData.address.trim() === "")) {
        throw new Error("Endereço completo é obrigatório para moradores.");
      }
      if (formData.user_type === 'morador' && (!formData.condominio_principal || (formData.condominio_principal === 'alphaville_lagoa_ingleses' && !formData.condominio_lagoa_ingleses))) {
        throw new Error("Informações do condomínio são obrigatórias para moradores.");
      }


      const dataToUpdate = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
            // Keep core fields even if empty, others only if they have a value
            return value !== null && value !== undefined &&
                   (key === 'full_name' || key === 'nickname' || key === 'phone' || key === 'user_type' || value !== '');
        })
      );

      await onUpdate(dataToUpdate);

      displayMessage('success', "Dados atualizados com sucesso!");
      if (!needsProfileCompletion) {
        setEditing(false);
      }

    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      displayMessage('error', error.message || "Erro ao salvar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadProof = async (url) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = ''; // Tells browser to download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      displayMessage('error', "Erro ao baixar o arquivo. Tente novamente.");
    }
  };

  const handleViewProof = (url, proofType) => {
    if (!url) return;

    setViewingProof({
      url: url,
      proofType: proofType
    });
  };

  const getStatusLabel = (status, paymentStatus, userType) => {
    if (userType === 'visitante') {
      if (status === 'approved' && paymentStatus === 'paid') return "Ativo";
      if (status === 'approved' && paymentStatus === 'expired') return "Inativo";
      if (status === 'approved' && paymentStatus === 'pending') return "Em Análise";
      if (status === 'pending') return "Em Análise";
      if (status === 'rejected') return "Inativo";
    }

    if (status === 'pending') return "Em Análise";
    if (status === 'approved') return "Ativo";
    if (status === 'rejected') return "Inativo";

    return "Em Análise";
  };

  const getStatusColor = (status, paymentStatus, userType) => {
    const finalStatus = getStatusLabel(status, paymentStatus, userType);
    const colors = {
      "Em Análise": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Ativo": "bg-green-100 text-green-800 border-green-200",
      "Inativo": "bg-red-100 text-red-800 border-red-200"
    };
    return colors[finalStatus] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getUserTypeLabel = (type) => {
    return {
      morador: "Morador",
      visitante: "Visitante",
      administrador: "Administrador"
    }[type] || type;
  };

  const getUserTypeColor = (type) => {
    const colors = {
      morador: "bg-blue-100 text-blue-800 border-blue-200",
      visitante: "bg-purple-100 text-purple-800 border-purple-200",
      administrador: "bg-indigo-100 text-indigo-800 border-indigo-200"
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTooltipText = (userType, status, paymentStatus) => {
    const currentOverallStatus = getStatusLabel(status, paymentStatus, userType);

    if (currentOverallStatus === "Inativo") {
      if (userType === 'visitante' && paymentStatus === 'expired') {
        return "Sua conta de visitante está inativa pois o período de acesso pago expirou. Para reativar, realize um novo pagamento.";
      }
      return "Sua conta está inativa. Isso pode ser devido a uma reprovação de cadastro ou expiração de acesso. Entre em contato com o suporte se necessário.";
    }

    if (currentOverallStatus === "Em Análise") {
      if (userType === 'morador') {
        return "Sua conta está aguardando a aprovação dos administradores. Certifique-se de ter enviado o comprovante de residência.";
      } else if (userType === 'visitante') {
        if (paymentStatus === 'pending') {
          return "Sua conta de visitante está em análise aguardando a confirmação do pagamento ou o envio do comprovante.";
        }
        return "Sua conta de visitante está em análise aguardando a aprovação dos administradores.";
      }
    }

    if (currentOverallStatus === "Ativo") {
      return "Sua conta está ativa e aprovada para usar a plataforma. Você tem acesso total aos recursos.";
    }

    return "Este é o status geral da sua conta na plataforma. Reflete a sua permissão de acesso e aprovação.";
  };

  if (needsProfileCompletion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-900">Bem-vindo ao Alpha-se!</CardTitle>
          <CardDescription className="text-base">
            Vamos completar seu perfil para você começar a usar a plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message.type && (
            <Alert
              className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : (message.type === 'info' ? 'border-blue-200 bg-blue-50 text-blue-800' : (message.type === 'warning' ? 'border-orange-200 bg-orange-50 text-orange-800' : 'destructive'))}`}
            >
              {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : (message.type === 'info' || message.type === 'warning' ? <Info className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />)}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Login realizado com sucesso! Agora complete as informações abaixo.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 w-full">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={formData.profile_picture_url}
                    alt={formData.full_name}
                  />
                  <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                    {formData.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label>Foto de Perfil</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="file"
                      id="profile-picture"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={uploadingImage}
                    />
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      disabled={uploadingImage}
                    >
                      <label htmlFor="profile-picture" className={uploadingImage ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                        <Camera className="w-4 h-4 mr-2" />
                        {uploadingImage ? 'Enviando...' : 'Alterar Foto'}
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange(e.target.id, e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nickname">Como quer ser chamado? *</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleChange(e.target.id, e.target.value)}
                  placeholder="Ex: João, Maria, Zé..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este é o nome que outros usuários verão nos seus anúncios
                </p>
              </div>
              <div>
                <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="(31) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleChange(e.target.id, e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Você é:</Label>
                <Select value={formData.user_type} onValueChange={(value) => handleChange('user_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu tipo de usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morador">Morador dos Condomínios</SelectItem>
                    <SelectItem value="visitante">Visitante (Taxa R$ 9,99/mês)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Endereço Completo {formData.user_type === 'morador' && <span className="text-red-500">*</span>}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange(e.target.id, e.target.value)}
                  placeholder="Rua, Número, Bairro, Cidade, Estado, CEP"
                  required={formData.user_type === 'morador'}
                />
                 {formData.user_type === 'morador' && <p className="text-xs text-gray-500 mt-1">Obrigatório para validar sua conta de morador.</p>}
              </div>
            </div>

            {formData.user_type === 'morador' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Condomínio Principal</Label>
                  <Select
                    value={formData.condominio_principal}
                    onValueChange={(value) => handleChange('condominio_principal', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alphaville_lagoa_ingleses">Alphaville Lagoa dos Ingleses</SelectItem>
                      <SelectItem value="outro">Outro Alphaville</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.condominio_principal === 'alphaville_lagoa_ingleses' && (
                  <div>
                    <Label>Condomínio (Lagoa dos Ingleses)</Label>
                    <Select
                      value={formData.condominio_lagoa_ingleses}
                      onValueChange={(value) => handleChange('condominio_lagoa_ingleses', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(condominiosLagoaIngleses).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Documentos e Pagamentos</h3>

              <div className="space-y-4">
                {(formData.user_type === 'morador' || user.residence_proof_url) && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Comprovante de Residência (Morador)</p>
                        <p className="text-sm text-gray-600">
                          {user.residence_proof_url ? 'Enviado' : 'Necessário para aprovação como morador'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.residence_proof_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProof(user.residence_proof_url, 'residence')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver
                        </Button>
                      )}
                      <input
                        type="file"
                        id="residence-proof"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'residence')}
                        disabled={uploadingDoc === 'residence'}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Button variant="outline" size="sm" asChild disabled={uploadingDoc === 'residence'}>
                        <label htmlFor="residence-proof" className={uploadingDoc === 'residence' ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingDoc === 'residence' ? 'Enviando...' : 'Enviar'}
                        </label>
                      </Button>
                    </div>
                  </div>
                )}

                {(formData.user_type === 'visitante' || user.payment_proof_url) && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Comprovante de Pagamento (Visitante)</p>
                        <p className="text-sm text-gray-600">
                          {user.payment_proof_url ? 'Enviado' : 'Opcional, envie se pagou por outro meio'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.payment_proof_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProof(user.payment_proof_url, 'payment')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver
                        </Button>
                      )}
                      <input
                        type="file"
                        id="payment-proof"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'payment')}
                        disabled={uploadingDoc === 'payment'}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Button variant="outline" size="sm" asChild disabled={uploadingDoc === 'payment'}>
                        <label htmlFor="payment-proof" className={uploadingDoc === 'payment' ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingDoc === 'payment' ? 'Enviando...' : 'Enviar'}
                        </label>
                      </Button>
                    </div>
                  </div>
                )}

                {formData.user_type === 'visitante' && user.payment_status !== 'paid' && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Taxa de Anunciante (Visitante)</p>
                        <p className="text-sm text-gray-600">R$ 9,99 para acesso de 30 dias</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleStripePayment}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={uploadingImage || uploadingDoc !== "" || isPaying}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isPaying ? "Aguarde..." : "Pagar R$ 9,99"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Salvando..." : "Completar Perfil"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Meus Dados</CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {message.type && (
            <Alert
              className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : (message.type === 'info' ? 'border-blue-200 bg-blue-50 text-blue-800' : (message.type === 'warning' ? 'border-orange-200 bg-orange-50 text-orange-800' : 'destructive'))}`}
            >
              {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : (message.type === 'info' || message.type === 'warning' ? <Info className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />)}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={user.profile_picture_url || user.picture}
                  alt={user.full_name}
                />
                <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label>Foto de Perfil</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="file"
                    id="profile-picture"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    disabled={uploadingImage}
                  />
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage}
                  >
                    <label htmlFor="profile-picture" className={uploadingImage ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                      <Camera className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Enviando...' : 'Alterar Foto'}
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 w-full">
              <div>
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange(e.target.id, e.target.value)}
                  disabled={!editing}
                  placeholder="Digite seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="nickname">Como quer ser chamado? *</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleChange(e.target.id, e.target.value)}
                  disabled={!editing}
                  placeholder="Ex: João, Maria, Zé..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este nome aparece para outros usuários nos seus anúncios
                </p>
              </div>
              <div>
                <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange(e.target.id, e.target.value)}
                  disabled={!editing}
                  placeholder="(31) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço Completo {formData.user_type === 'morador' && '*'}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange(e.target.id, e.target.value)}
                  disabled={!editing}
                  placeholder="Rua, Número, Bairro, Cidade, Estado, CEP"
                />
                 {editing && formData.user_type === 'morador' && <p className="text-xs text-gray-500 mt-1">Obrigatório para moradores.</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <p className="text-gray-700 p-2 bg-gray-50 rounded">{user.email}</p>
              </div>
              <div>
                <Label>Tipo de Usuário</Label>
                <div className="flex items-center gap-2 pt-2">
                  {user.user_type ? (
                      <Badge className={`${getUserTypeColor(user.user_type)} border font-semibold px-3 py-1`}>
                          {getUserTypeLabel(user.user_type)}
                      </Badge>
                  ) : (
                      <p className="text-gray-500 p-2 bg-gray-50 rounded text-sm">Não definido</p>
                  )}
                  {editing && (
                    <Select
                      value={formData.user_type}
                      onValueChange={(value) => handleChange('user_type', value)}
                      disabled={!editing}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Alterar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morador">Morador</SelectItem>
                        <SelectItem value="visitante">Visitante</SelectItem>
                        {user.user_type === 'administrador' && <SelectItem value="administrador">Administrador</SelectItem>}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Status da Conta</Label>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3 cursor-help">
                        <Badge className={`${getStatusColor(user.approval_status, user.payment_status, user.user_type)} border-2 font-bold px-4 py-2 text-base`}>
                          {getStatusLabel(user.approval_status, user.payment_status, user.user_type)}
                        </Badge>
                        <Info className="w-5 h-5 text-gray-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-center">
                      <p>{getTooltipText(user.user_type, user.approval_status, user.payment_status)}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="mt-3 text-center text-sm text-gray-600">
                  {user.user_type === 'visitante' && user.payment_status && (
                    <p>Pagamento: <span className="font-medium capitalize">
                      {user.payment_status === 'paid' ? 'Realizado' : user.payment_status === 'pending' ? 'Pendente' : 'Expirado'}
                      </span>
                    </p>
                  )}
                  {getStatusLabel(user.approval_status, user.payment_status, user.user_type) === 'Em Análise' && (
                    <p className="text-yellow-700 font-medium">⏳ Aguardando análise da documentação</p>
                  )}
                  {getStatusLabel(user.approval_status, user.payment_status, user.user_type) === 'Inativo' && user.user_type === 'visitante' && user.payment_status === 'expired' && (
                    <p className="text-red-700 font-medium">⚠️ Seu acesso expirou. Realize um novo pagamento.</p>
                  )}
                </div>
              </div>
            </div>

            {user.user_type === 'morador' && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Informações de Morador</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Condomínio Principal</Label>
                    <Select
                      value={formData.condominio_principal}
                      onValueChange={(value) => handleChange('condominio_principal', value)}
                      disabled={!editing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alphaville_lagoa_ingleses">Alphaville Lagoa dos Ingleses</SelectItem>
                        <SelectItem value="outro">Outro Alphaville</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.condominio_principal === 'alphaville_lagoa_ingleses' && (
                    <div>
                      <Label>Condomínio (Lagoa dos Ingleses)</Label>
                      <Select
                        value={formData.condominio_lagoa_ingleses}
                        onValueChange={(value) => handleChange('condominio_lagoa_ingleses', value)}
                        disabled={!editing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(condominiosLagoaIngleses).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">
                Documentos para Aprovação
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Comprovante de Residência (Morador)</p>
                      <p className="text-sm text-gray-600">
                        {user.residence_proof_url ? 'Enviado' : 'Necessário para aprovação como morador'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.residence_proof_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProof(user.residence_proof_url, 'residence')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver
                      </Button>
                    )}
                    <input
                      type="file"
                      id="residence-proof"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'residence')}
                      disabled={uploadingDoc === 'residence'}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <Button variant="outline" size="sm" asChild disabled={uploadingDoc === 'residence'}>
                      <label htmlFor="residence-proof" className={uploadingDoc === 'residence' ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingDoc === 'residence' ? 'Enviando...' : 'Enviar'}
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Comprovante de Pagamento (Visitante)</p>
                      <p className="text-sm text-gray-600">
                        {user.payment_proof_url ? 'Enviado' : 'Opcional, envie se pagou por outro meio'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.payment_proof_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProof(user.payment_proof_url, 'payment')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver
                      </Button>
                    )}
                    <input
                      type="file"
                      id="payment-proof"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'payment')}
                      disabled={uploadingDoc === 'payment'}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <Button variant="outline" size="sm" asChild disabled={uploadingDoc === 'payment'}>
                      <label htmlFor="payment-proof" className={uploadingDoc === 'payment' ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingDoc === 'payment' ? 'Enviando...' : 'Enviar'}
                      </label>
                    </Button>
                  </div>
                </div>

                {user.payment_status !== 'paid' && user.user_type === 'visitante' && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Taxa de Anunciante (Visitante)</p>
                        <p className="text-sm text-gray-600">R$ 9,99 para acesso de 30 dias</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleStripePayment}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={uploadingImage || uploadingDoc !== "" || isPaying}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isPaying ? "Aguarde..." : "Pagar R$ 9,99"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        {editing && (
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setEditing(false);
              setMessage({ type: '', text: '' });
              setFormData({
                full_name: user.full_name || "",
                nickname: user.nickname || "",
                phone: user.phone || "",
                user_type: user.user_type || "visitante",
                condominio_principal: user.condominio_principal || "",
                condominio_lagoa_ingleses: user.condominio_lagoa_ingleses || "",
                address: user.address || "",
                profile_picture_url: user.profile_picture_url || user.picture || "",
              });
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Dialog melhorado para visualizar comprovantes */}
      {viewingProof && (
        <Dialog open={!!viewingProof} onOpenChange={() => setViewingProof(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {viewingProof.proofType === 'residence' ? 'Comprovante de Residência' : 'Comprovante de Pagamento'}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Top Actions */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" onClick={() => window.open(viewingProof.url, '_blank')} className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Abrir em Nova Aba
                </Button>
                <Button variant="outline" onClick={() => handleDownloadProof(viewingProof.url)} className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Baixar Arquivo
                </Button>
              </div>

              {/* Visualizador de Arquivo */}
              <div className="border rounded-lg overflow-hidden bg-gray-100 min-h-[60vh]">
                <GoogleDriveViewer
                  fileUrl={viewingProof.url}
                  height="60vh"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
}
