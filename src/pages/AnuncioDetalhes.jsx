
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Anuncio } from "@/api/entities";
import { Chat } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  Star,
  Calendar,
  User as UserIcon,
  MapPin,
  Phone,
  Heart,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import LoginPrompt from "../components/LoginPrompt";
import ImageGallery from "../components/anuncios/ImageGallery";

export default function AnuncioDetalhes({ user, userLoading }) {
  const [anuncio, setAnuncio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareMessage, setShareMessage] = useState("");
  const [isStartingChat, setIsStartingChat] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Garante que a página comece no topo
    window.scrollTo(0, 0);
    loadAnuncio();
  }, []);

  const loadAnuncio = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');

      if (!id) {
        navigate(createPageUrl("Anuncios"));
        return;
      }

      const anuncioData = await Anuncio.get(id);
      if (!anuncioData) {
        navigate(createPageUrl("Anuncios"));
        return;
      }

      // Debug das imagens
      console.log('=== DEBUG ANÚNCIO ===');
      console.log('Anúncio completo:', anuncioData);
      console.log('Campo imagens:', anuncioData.imagens);
      console.log('Tipo do campo imagens:', typeof anuncioData.imagens);
      console.log('É array?', Array.isArray(anuncioData.imagens));
      if (Array.isArray(anuncioData.imagens)) {
        console.log('Quantidade de imagens:', anuncioData.imagens.length);
        anuncioData.imagens.forEach((img, i) => {
          console.log(`Imagem ${i + 1}:`, img);
        });
      }
      console.log('===================');

      setAnuncio(anuncioData);
    } catch (error) {
      console.error("Erro ao carregar anúncio:", error);
      navigate(createPageUrl("Anuncios"));
    }
    setLoading(false);
  };

  const fallbackCopyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Link copiado para a área de transferência!");
    } catch (err) {
      console.error('Falha ao copiar o link:', err);
      setShareMessage("Erro ao copiar o link.");
    } finally {
      // Aumenta o tempo do toast para 3 segundos
      setTimeout(() => setShareMessage(""), 3000);
    }
  };

  const handleShare = async () => {
    const previewUrl = `${window.location.origin}/functions/anuncioPreview?id=${anuncio.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: anuncio.titulo,
          text: `Confira este anúncio no Alpha-se: ${anuncio.titulo}`,
          url: previewUrl,
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Compartilhamento cancelado pelo usuário.');
          return;
        }
        // Mensagem informativa no console em vez de erro
        console.log(`Compartilhamento nativo não disponível (${error.name}). Ativando fallback: copiar link.`);
        await fallbackCopyToClipboard(previewUrl);
      }
    } else {
      // Se a API de compartilhamento não existir
      console.log('API de compartilhamento nativo não encontrada. Ativando fallback: copiar link.');
      await fallbackCopyToClipboard(previewUrl);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      return;
    }

    if (user.email === anuncio.created_by) {
      alert("Você não pode iniciar uma conversa com seu próprio anúncio.");
      return;
    }

    setIsStartingChat(true);
    try {
      const existingChats = await Chat.filter({
        anuncio_id: anuncio.id,
        comprador_email: user.email
      });

      if (existingChats.length > 0) {
        navigate(createPageUrl(`Chat?id=${existingChats[0].id}`));
        return;
      }

      const newChat = await Chat.create({
        anuncio_id: anuncio.id,
        vendedor_email: anuncio.created_by,
        comprador_email: user.email,
        vendedor_nome: anuncio.nome_anunciante,
        comprador_nome: user.full_name,
        vendedor_foto_url: anuncio.anunciante_foto_url,
        comprador_foto_url: user.profile_picture_url || user.picture
      });

      navigate(createPageUrl(`Chat?id=${newChat.id}`));
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error);
      alert("Erro ao iniciar conversa. Tente novamente.");
    }
    setIsStartingChat(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      imoveis: "bg-green-100 text-green-700",
      veiculos: "bg-blue-100 text-blue-700",
      para_casa: "bg-yellow-100 text-yellow-700",
      servicos: "bg-purple-100 text-purple-700",
      eletronicos: "bg-indigo-100 text-indigo-700",
      moda_beleza: "bg-pink-100 text-pink-700",
      bebes_criancas: "bg-orange-100 text-orange-700"
    };
    return colors[categoria] || "bg-gray-100 text-gray-700";
  };

  const categoryLabels = {
    imoveis: "Imóveis",
    veiculos: "Veículos",
    para_casa: "Para Casa",
    servicos: "Serviços",
    eletronicos: "Eletrônicos",
    moda_beleza: "Moda e Beleza",
    bebes_criancas: "Bebês e Crianças"
  };

  const subcategoryLabels = {
    venda_casa: "Casa para Venda",
    venda_apto: "Apartamento para Venda",
    venda_lote: "Lote para Venda",
    aluguel_casa: "Casa para Aluguel",
    aluguel_apto: "Apartamento para Aluguel",
    aluguel_lote: "Lote para Aluguel",
    carros: "Carros",
    motos: "Motos",
    outros_veiculos: "Outros Veículos",
    moveis: "Móveis",
    eletrodomesticos: "Eletrodomésticos",
    decoracao: "Decoração",
    reformas_reparos: "Reformas e Reparos",
    aulas_cursos: "Aulas e Cursos",
    saude_bem_estar: "Saúde e Bem-estar",
    eventos: "Eventos",
    outros_servicos: "Outros Serviços",
    celulares: "Celulares",
    computadores: "Computadores",
    outros_eletronicos: "Outros Eletrônicos",
    roupas: "Roupas",
    acessorios: "Acessórios",
    cosmeticos: "Cosméticos",
    roupas_bebes: "Roupas de Bebê",
    brinquedos: "Brinquedos",
    carrinhos_bebe: "Carrinhos de Bebê",
    moveis_infantis: "Móveis Infantis",
    livros_infantis: "Livros Infantis",
    artigos_bebe: "Artigos para Bebê"
  };

  const getCategoryDisplayLabel = (categoria, subcategoria) => {
    return subcategoryLabels[subcategoria] || categoryLabels[categoria];
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card className="overflow-hidden">
            <Skeleton className="h-64 md:h-96 w-full" />
            <CardContent className="p-4 md:p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  if (!anuncio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Anúncio não encontrado</h2>
          <p className="text-gray-600 mb-4">O anúncio que você está procurando não existe ou foi removido.</p>
          <Link to={createPageUrl("Anuncios")}>
            <Button>Ver Todos os Anúncios</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {shareMessage && (
        <div className="fixed bottom-5 right-5 z-50">
          <Alert className="bg-gray-900 text-white border-gray-700 shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <AlertDescription>
              {shareMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>

          {anuncio && (
            <Card className="overflow-hidden">
              <ImageGallery images={anuncio.imagens} />
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getCategoryColor(anuncio.categoria)}`}>
                        {getCategoryDisplayLabel(anuncio.categoria, anuncio.subcategoria)}
                      </Badge>
                      {anuncio.destacado && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs sm:text-sm">
                          <Star className="w-3 h-3 mr-1" />
                          Destaque
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {anuncio.titulo}
                    </h1>
                    <p className="text-3xl md:text-4xl font-bold text-green-600 mb-4">
                      {anuncio.preco ? formatPrice(anuncio.preco) : "Preço a combinar"}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h2 className="font-semibold text-lg">Detalhes</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Publicado em {format(new Date(anuncio.created_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">ID:</span>
                      <span className="font-mono text-xs">{anuncio.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h2 className="font-semibold text-lg mb-3">Descrição</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {anuncio.descricao}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h2 className="font-semibold text-lg mb-3">Anunciante</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={anuncio.anunciante_foto_url} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {(anuncio.nickname || anuncio.nome_anunciante)?.[0]?.toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {anuncio.nickname || anuncio.nome_anunciante}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <UserIcon className="w-3 h-3" />
                          <span className="capitalize">{anuncio.user_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {user && anuncio.created_by !== user.email && (
                  <div className="border-t pt-6 flex flex-col md:flex-row gap-3">
                    <Button
                      onClick={handleStartChat}
                      disabled={isStartingChat || !user || user.email === anuncio.created_by}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {isStartingChat ? "Iniciando..." : "Iniciar Conversa"}
                    </Button>

                    <motion.div
                      animate={{
                          scale: [1, 1.05, 1],
                          opacity: [1, 0.8, 1],
                          boxShadow: [
                              "0 0 0px rgba(34, 197, 94, 0.4)",
                              "0 0 20px rgba(34, 197, 94, 0.6)",
                              "0 0 0px rgba(34, 197, 94, 0.4)"
                          ]
                      }}
                      transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                      }}
                      className="flex-1 md:flex-none"
                    >
                      <Button
                          variant="outline"
                          onClick={handleShare}
                          className="w-full border-green-500 border-2 text-green-600 font-bold hover:bg-green-50 hover:text-green-700 bg-green-50/50 shadow-lg"
                      >
                          <motion.div
                              animate={{
                                  rotate: [0, 5, -5, 0],
                              }}
                              transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                              }}
                          >
                              <Share2 className="w-4 h-4 mr-2" />
                          </motion.div>
                          Compartilhar
                      </Button>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
