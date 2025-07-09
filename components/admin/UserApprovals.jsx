import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Calendar, UserCheck, UserX, Eye, Download, Bot, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GoogleDriveViewer from "../shared/GoogleDriveViewer";
import { User } from "@/api/entities";
import { ExtractDataFromUploadedFile } from "@/api/integrations";

export default function UserApprovals({ users, onAction, onExtractionSuccess }) {
  const [viewingFileUrl, setViewingFileUrl] = React.useState(null);
  const [viewingFileTitle, setViewingFileTitle] = React.useState("");
  const [extractingData, setExtractingData] = React.useState(null);
  const [extractionMessage, setExtractionMessage] = React.useState({ type: "", text: "" });
  
  const pendingUsers = users.filter(user => user.approval_status !== 'approved');
  
  const handleViewProof = (url, title) => {
    if (!url) {
      alert("Não há arquivo para visualizar.");
      return;
    }
    setViewingFileUrl(url);
    setViewingFileTitle(title);
  };
  
  const handleDownloadProof = (url, userName, proofType) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    const urlParts = url.split('.');
    const fileExtension = urlParts.length > 1 ? urlParts.pop().split('?')[0] : 'file';
    link.download = `${userName.replace(/\s+/g, '_')}_${proofType}_${format(new Date(), 'yyyyMMdd')}.${fileExtension}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExtractData = async (user) => {
    if (!user.residence_proof_url) {
      setExtractionMessage({ 
        type: "error", 
        text: "Nenhum comprovante de residência disponível para análise." 
      });
      return;
    }

    setExtractingData(user.id);
    setExtractionMessage({ type: "", text: "" });

    try {
      // Schema para extração dos dados
      const extractionSchema = {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Nome completo da pessoa ou empresa no documento"
          },
          address: {
            type: "string", 
            description: "Endereço completo (rua, número, bairro, cidade, CEP) encontrado no documento"
          }
        },
        required: ["name", "address"]
      };

      // Chamar a integração diretamente
      const extractionResult = await ExtractDataFromUploadedFile({
        file_url: user.residence_proof_url,
        json_schema: extractionSchema
      });

      if (extractionResult.status === 'success' && extractionResult.output) {
        const { name, address } = extractionResult.output;
        
        if (name && address) {
          // Atualizar o usuário com os dados extraídos
          await User.update(user.id, {
            extracted_name: name,
            extracted_address: address
          });

          setExtractionMessage({ 
            type: "success", 
            text: `✅ Dados extraídos com sucesso! Nome: ${name}, Endereço: ${address}` 
          });
          
          // Chama a função para recarregar os dados no componente pai
          if (onExtractionSuccess) {
            onExtractionSuccess();
          }
        } else {
          setExtractionMessage({ 
            type: "error", 
            text: "❌ IA não conseguiu extrair nome e endereço do documento."
          });
        }
      } else {
        setExtractionMessage({ 
          type: "error", 
          text: `❌ Erro na integração de IA: ${extractionResult.details || 'Falha desconhecida'}`
        });
      }
    } catch (err) {
      console.error('Erro ao chamar a integração de extração:', err);
      setExtractionMessage({ 
        type: "error", 
        text: `❌ Erro de comunicação: ${err.message}` 
      });
    } finally {
      setExtractingData(null);
      // Limpar mensagem após 8 segundos
      setTimeout(() => {
        setExtractionMessage({ type: "", text: "" });
      }, 8000);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado"
    };
    return labels[status] || status;
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      morador: "Morador",
      visitante: "Visitante",
      administrador: "Administrador"
    };
    return labels[type] || type;
  };

  const getUserTypeColor = (type) => {
    const colors = {
      morador: "bg-blue-100 text-blue-800",
      visitante: "bg-purple-100 text-purple-800",
      administrador: "bg-indigo-100 text-indigo-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aprovações de Usuários</CardTitle>
          <p className="text-sm text-gray-500 pt-1">
            Revise e defina o status de cada usuário pendente.
          </p>
        </CardHeader>
        <CardContent>
          {extractionMessage.text && (
            <Alert className={`mb-4 ${extractionMessage.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
              <AlertDescription className={extractionMessage.type === "error" ? "text-red-800" : "text-green-800"}>
                {extractionMessage.text}
              </AlertDescription>
            </Alert>
          )}

          {pendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma aprovação pendente
              </h3>
              <p className="text-gray-600">
                Todos os usuários foram processados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {user.full_name}
                      </h3>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(user.approval_status)}>
                          {getStatusLabel(user.approval_status)}
                        </Badge>
                        <Badge className={getUserTypeColor(user.user_type)}>
                          {getUserTypeLabel(user.user_type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      Cadastrado em {format(new Date(user.created_date), "dd/MM/yyyy")}
                    </div>
                  </div>

                  {/* Dados Extraídos pela IA */}
                  {(user.extracted_name || user.extracted_address) && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        Dados Extraídos pela IA
                      </h4>
                      {user.extracted_name && (
                        <p className="text-sm text-blue-800">
                          <strong>Nome:</strong> {user.extracted_name}
                        </p>
                      )}
                      {user.extracted_address && (
                        <p className="text-sm text-blue-800">
                          <strong>Endereço:</strong> {user.extracted_address}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Documentos */}
                  <div className="space-y-2 mb-4">
                    {user.residence_proof_url && (
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="text-sm">Comprovante de Residência</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProof(user.residence_proof_url, `Comprovante de Residência - ${user.full_name}`)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" /> Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadProof(user.residence_proof_url, user.full_name, 'residencia')}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800"
                          >
                            <Download className="w-4 h-4" /> Baixar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExtractData(user)}
                            disabled={extractingData === user.id}
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-800"
                          >
                            {extractingData === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                            {extractingData === user.id ? 'Analisando...' : 'Analisar com IA'}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {user.payment_proof_url && (
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="text-sm">Comprovante de Pagamento</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProof(user.payment_proof_url, `Comprovante de Pagamento - ${user.full_name}`)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" /> Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadProof(user.payment_proof_url, user.full_name, 'pagamento')}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800"
                          >
                            <Download className="w-4 h-4" /> Baixar
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {!user.residence_proof_url && !user.payment_proof_url && (
                      <div className="text-center py-3 text-gray-500 text-sm">
                        Nenhum comprovante enviado.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAction(user.id, 'approve_morador')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Aprovar Morador
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                           <Calendar className="w-4 h-4 mr-1" />
                           Aprovar Visitante
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onAction(user.id, 'approve_visitante_3')}>
                          Por 3 dias
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction(user.id, 'approve_visitante_30')}>
                          Por 30 dias
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onAction(user.id, 'reject')}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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