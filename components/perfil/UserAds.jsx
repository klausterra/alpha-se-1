
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AdEditForm from "./AdEditForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function UserAds({ anuncios, onUpdate, onDelete }) {
  const [editingAd, setEditingAd] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const getStatusLabel = (status) => ({ pending: "Pendente", active: "Ativo", expired: "Expirado", rejected: "Rejeitado" }[status] || status);
  const getStatusColor = (status) => ({ pending: "bg-yellow-100 text-yellow-800", active: "bg-green-100 text-green-800", expired: "bg-gray-100", rejected: "bg-red-100 text-red-800" }[status] || "bg-gray-100");

  const handleDelete = async (adId) => {
    await onDelete(adId);
    // Não redireciona - permanece na página de anúncios
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Meus Anúncios ({anuncios.length})</CardTitle>
          <Link to={createPageUrl("CriarAnuncio")}>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Anúncio
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {anuncios.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Você ainda não tem anúncios</h3>
              <p className="text-gray-600 mt-2">Clique em "Novo Anúncio" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {anuncios.map(anuncio => (
                <div key={anuncio.id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-32 h-32 md:h-auto flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    {anuncio.imagens?.[0] ? (
                      <img src={anuncio.imagens[0]} alt={anuncio.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-50">
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7bcb2cd18_Alphase.png"
                          alt="Alpha-se"
                          className="w-12 h-12 opacity-60"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{anuncio.titulo}</h3>
                    <div className="flex items-center gap-2 my-2">
                      <Badge className={getStatusColor(anuncio.status)}>{getStatusLabel(anuncio.status)}</Badge>
                      {anuncio.destacado && <Badge className="bg-yellow-100 text-yellow-800"><Star className="w-3 h-3 mr-1" /> Destaque</Badge>}
                    </div>
                    <p className="text-xl font-bold text-green-600">{formatPrice(anuncio.preco)}</p>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 self-start md:self-center">
                    <Button variant="outline" size="sm" onClick={() => setEditingAd(anuncio)}>
                      <Edit className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" /> Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente seu anúncio.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(anuncio.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {editingAd && (
        <AdEditForm
          anuncio={editingAd}
          onUpdate={onUpdate}
          onClose={() => setEditingAd(null)}
        />
      )}
    </>
  );
}
