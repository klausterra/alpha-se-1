// src/pages/AnuncioDetalhes.js

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  Share2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import LoginForm from "@/components/auth/LoginForm";
import ImageGallery from "@/components/anuncios/ImageGallery";
import { Anuncio } from "@/api/entities";
import { Chat } from "@/api/entities";
import { Mensagem } from "@/api/entities";

const DEFAULT_IMAGE_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4f8d08c82_Alphase.png";

export default function AnuncioDetalhes({ user, userLoading }) {
  const [anuncio, setAnuncio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const carregarAnuncio = async () => {
      setLoading(true);
      try {
        const id = new URLSearchParams(window.location.search).get("id");
        if (!id) {
          navigate(createPageUrl("Anuncios"));
          return;
        }
        const dados = await Anuncio.filter({ id }, "", 1);
        if (dados?.length) {
          setAnuncio(dados[0]);
        } else {
          navigate(createPageUrl("Anuncios"));
        }
      } catch (e) {
        console.error("Erro ao carregar anúncio:", e);
        navigate(createPageUrl("Anuncios"));
      } finally {
        setLoading(false);
      }
    };
    carregarAnuncio();
    return () => controller.abort();
  }, []);

  const handleShare = () => {
  if (!anuncio) return;
  const anuncioUrl = window.location.origin +
    `/anuncio?id=${anuncio.id}`;
  const text = `Confira este anúncio no Alpha-se: ${anuncio.titulo}`;
  window.open(
  `https://wa.me/?text=${encodeURIComponent(
    `Confira este anúncio: ${anuncio.titulo} ` +
    `https://alpha-se.com.br/anuncio?id=${anuncio.id}`
  )}`,
  "_blank"
 );
};



  const handleStartChat = async () => {
    if (!user) return setShowLoginDialog(true);
    if (!anuncio) return;
    if (user.email === anuncio.created_by) {
      alert("Não pode conversar com seu próprio anúncio.");
      return;
    }
    setIsStartingChat(true);
    try {
      const chats = await Chat.filter({
        anuncio_id: anuncio.id,
        comprador_email: user.email,
      });
      let chatId;
      if (chats?.length) {
        chatId = chats[0].id;
      } else {
        const novo = await Chat.create({
          anuncio_id: anuncio.id,
          vendedor_email: anuncio.created_by,
          comprador_email: user.email,
          vendedor_nome: anuncio.nickname || anuncio.nome_anunciante,
          comprador_nome: user.nickname || user.full_name,
          vendedor_foto_url: anuncio.anunciante_foto_url,
          comprador_foto_url: user.profile_picture_url || user.picture,
          status: "ativo",
        });
        chatId = novo.id;

        const msg = `Olá! Tenho interesse no seu anúncio: ${anuncio.titulo}`;
        await Mensagem.create({
          chat_id: chatId,
          remetente_email: user.email,
          conteudo: msg,
        });
        await Chat.update(chatId, {
          ultima_mensagem: msg,
          ultima_mensagem_data: new Date().toISOString(),
          nao_lidas_vendedor: 1,
        });
      }
      navigate(createPageUrl(`Chat?id=${chatId}`));
    } catch (e) {
      console.error("Erro ao iniciar conversa:", e);
      alert("Erro ao iniciar conversa.");
    }
    setIsStartingChat(false);
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Anúncio não encontrado</h2>
          <p className="text-gray-600 mb-4">Este anúncio não existe ou foi removido.</p>
          <Link to={createPageUrl("Anuncios")}>
            <Button>Voltar aos Anúncios</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>

        <Card className="mt-4 overflow-hidden">
          {anuncio.destacado && (
            <div className="bg-yellow-400 text-white px-4 py-2 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" /> Anúncio em Destaque
            </div>
          )}
          <div className="aspect-video bg-gray-100">
            {anuncio.imagens?.length > 0 ? (
              <ImageGallery images={anuncio.imagens} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <AvatarImage src={DEFAULT_IMAGE_URL} alt="Imagem padrão do anúncio" />
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex gap-2 mb-4">
              <Badge>{anuncio.categoria}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4">{anuncio.titulo}</h1>
            <div className="text-4xl text-green-600 font-bold mb-6">
              {anuncio.preco ? anuncio.preco.toLocaleString('pt-BR', {style:'currency',currency:'BRL'}) : "Preço a combinar"}
            </div>
            <p className="text-gray-700 mb-6 whitespace-pre-wrap">{anuncio.descricao}</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 text-sm">
                Publicado em {format(new Date(anuncio.created_date), "dd 'de' MMMM 'de' yyyy", {locale: ptBR})}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button onClick={handleStartChat} disabled={isStartingChat}>
            <MessageCircle className="w-4 h-4 mr-2" />
            {isStartingChat ? "Iniciando..." : "Enviar Mensagem"}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Compartilhar
          </Button>
        </div>
      </div>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <LoginForm
            onSuccess={() => {
              setShowLoginDialog(false);
              window.location.reload();
            }}
            onClose={() => setShowLoginDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
