
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Star, Eye, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function AdManagement({ anuncios, onAdAction }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      expired: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendente",
      active: "Ativo",
      expired: "Expirado",
      rejected: "Rejeitado"
    };
    return labels[status] || status;
  };

  const getCategoryLabel = (categoria) => {
    const labels = {
      produto: "Produto",
      servico: "Serviço", 
      imovel_venda: "Venda",
      imovel_locacao: "Locação"
    };
    return labels[categoria] || categoria;
  };

  const handleDelete = async (adId) => {
    if (window.confirm('Tem certeza que deseja excluir este anúncio permanentemente?')) {
      await onAdAction(adId, 'delete');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Anúncios</CardTitle>
      </CardHeader>
      <CardContent>
        {anuncios.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum anúncio encontrado
            </h3>
            <p className="text-gray-600">
              Os anúncios aparecerão aqui quando forem criados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {anuncios.map((anuncio) => (
              <div key={anuncio.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {anuncio.titulo}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {anuncio.descricao}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(anuncio.status)}>
                        {getStatusLabel(anuncio.status)}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoryLabel(anuncio.categoria)}
                      </Badge>
                      {anuncio.destacado && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Destaque
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {formatPrice(anuncio.preco)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(anuncio.created_date), "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-1 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Anunciante:</p>
                    <p className="font-medium">{anuncio.nome_anunciante}</p>
                  </div>
                </div>

                {/* Imagens */}
                {anuncio.imagens && anuncio.imagens.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Imagens:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {anuncio.imagens.map((image, index) => (
                        <a
                          key={index}
                          href={image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <img
                            src={image}
                            alt={`Imagem ${index + 1}`}
                            className="w-16 h-16 object-cover rounded hover:opacity-75 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap gap-2">
                  {anuncio.status === 'active' && (
                    <>
                      <Button
                        size="sm"
                        variant={anuncio.destacado ? "outline" : "default"}
                        onClick={() => onAdAction(anuncio.id, 'highlight', !anuncio.destacado)}
                        className={anuncio.destacado ? "" : "bg-yellow-500 hover:bg-yellow-600"}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        {anuncio.destacado ? 'Remover Destaque' : 'Destacar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onAdAction(anuncio.id, 'reject')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(anuncio.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
