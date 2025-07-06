
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Chat } from "@/api/entities";
import { Anuncio } from "@/api/entities";
import { User } from "@/api/entities";
import { Mensagem } from "@/api/entities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, ArrowLeft, MessageCircle, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sendNotificationEmail } from "@/api/functions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ChatPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const chatId = urlParams.get("id");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);
  const [anuncio, setAnuncio] = useState(null);
  const [outroUsuario, setOutroUsuario] = useState({ name: "", photo: "" });
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingChat, setDeletingChat] = useState(false);

  useEffect(() => {
    if (!chatId) {
      navigate(createPageUrl("Conversas"));
      return;
    }
    loadData();
    const interval = setInterval(loadNewMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const chatResults = await Chat.filter({ id: chatId });
      if (!chatResults || chatResults.length === 0) {
        throw new Error("Chat não encontrado");
      }
      
      const chatData = chatResults[0];
      if (chatData.vendedor_email !== currentUser.email && chatData.comprador_email !== currentUser.email) {
        throw new Error("Acesso negado a este chat.");
      }
      setChat(chatData);

      const isVendedor = chatData.vendedor_email === currentUser.email;
      setOutroUsuario({ 
        name: isVendedor ? chatData.comprador_nome : chatData.vendedor_nome, 
        photo: isVendedor ? chatData.comprador_foto_url : chatData.vendedor_foto_url 
      });

      // Carregar anúncio
      try {
        const anuncioResults = await Anuncio.filter({ id: chatData.anuncio_id });
        if (anuncioResults && anuncioResults.length > 0) {
          setAnuncio(anuncioResults[0]);
        }
      } catch (error) {
        console.log("Erro ao carregar anúncio:", error);
      }

      await loadInitialMessages(chatData, currentUser);
      
      setTimeout(() => inputRef.current?.focus(), 100);

    } catch (error) {
      console.error("Erro ao carregar dados do chat:", error);
      navigate(createPageUrl("Conversas"));
    } finally {
      setLoading(false);
    }
  };

  const loadInitialMessages = async (chatData, currentUser) => {
    try {
      const mensagensDoChat = await Mensagem.filter({ chat_id: chatId }, "created_date");
      setMensagens(mensagensDoChat);
      await marcarComoLidas(chatData, currentUser.email);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };
  
  const loadNewMessages = async () => {
    try {
      const lastMessageDate = mensagens.length > 0 ? mensagens[mensagens.length - 1].created_date : new Date(0).toISOString();
      const novasMensagens = await Mensagem.filter({ 
        chat_id: chatId,
        created_date: { "$gt": lastMessageDate }
      }, "created_date");
      
      if (novasMensagens.length > 0) {
        setMensagens(prev => [...prev, ...novasMensagens]);
        if (chat && user) {
          await marcarComoLidas(chat, user.email);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar novas mensagens:", error);
    }
  };

  const marcarComoLidas = async (chatData, userEmail) => {
    try {
      const updates = {};
      if (chatData.vendedor_email === userEmail && (chatData.nao_lidas_vendedor || 0) > 0) {
        updates.nao_lidas_vendedor = 0;
      } else if (chatData.comprador_email === userEmail && (chatData.nao_lidas_comprador || 0) > 0) {
        updates.nao_lidas_comprador = 0;
      }

      if (Object.keys(updates).length > 0) {
        await Chat.update(chatId, updates);
      }
    } catch (error) {
      console.error("Erro ao marcar como lidas:", error);
    }
  };

  const handleEnviarMensagem = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim() || enviandoMensagem) return;

    setEnviandoMensagem(true);
    try {
      const mensagemCriada = await Mensagem.create({
        chat_id: chatId,
        remetente_email: user.email,
        conteudo: novaMensagem,
      });

      setMensagens(prev => [...prev, mensagemCriada]);
      setNovaMensagem("");

      const isVendedor = chat.vendedor_email === user.email;
      const updates = {
        ultima_mensagem: novaMensagem,
        ultima_mensagem_data: new Date().toISOString(),
      };
      
      if (isVendedor) {
        updates.nao_lidas_comprador = (chat.nao_lidas_comprador || 0) + 1;
      } else {
        updates.nao_lidas_vendedor = (chat.nao_lidas_vendedor || 0) + 1;
      }
      
      await Chat.update(chatId, updates);

      // Notificação por email
      try {
        const outroUsuarioEmail = isVendedor ? chat.comprador_email : chat.vendedor_email;
        await sendNotificationEmail({
          to: outroUsuarioEmail,
          subject: `Nova mensagem de ${user.full_name} sobre "${anuncio?.titulo || 'um anúncio'}"`,
          body: `
            Você recebeu uma nova mensagem em sua conversa sobre o anúncio "${anuncio?.titulo || 'um anúncio'}".<br/><br/>
            <b>${user.full_name}:</b> ${novaMensagem}<br/><br/>
            <a href="https://alpha-se-u166.base44.com/Chat?id=${chatId}">Clique aqui para responder.</a>
          `
        });
      } catch (emailError) {
        console.log("Erro ao enviar notificação por email:", emailError);
      }

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setEnviandoMensagem(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleDeleteChat = async () => {
    setDeletingChat(true);
    try {
      // Primeiro, deletar todas as mensagens do chat
      const mensagensDoChat = await Mensagem.filter({ chat_id: chatId });
      for (const mensagem of mensagensDoChat) {
        await Mensagem.delete(mensagem.id);
      }
      
      // Depois, deletar o chat
      await Chat.delete(chatId);
      
      // Redirecionar para a página de conversas
      navigate(createPageUrl("Conversas"));
      
    } catch (error) {
      console.error("Erro ao deletar chat:", error);
      alert("Erro ao deletar conversa. Tente novamente.");
    } finally {
      setDeletingChat(false);
      setShowDeleteDialog(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !chat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat não encontrado</h2>
          <p className="text-gray-600 mb-4">Esta conversa não existe ou você não tem acesso.</p>
          <Button onClick={() => navigate(createPageUrl("Conversas"))}>
            Voltar para Conversas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto p-4">
          {/* Primeira linha - Informações do usuário */}
          <div className="flex items-center gap-4 mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Conversas"))}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar>
              <AvatarImage src={outroUsuario.photo} />
              <AvatarFallback className="bg-gray-200">
                {outroUsuario.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <h2 className="font-semibold truncate">{outroUsuario.name}</h2>
            </div>
            
            {/* Menu de opções */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Apagar Conversa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Segunda linha - Informações do anúncio */}
          {anuncio && (
            <div className="flex items-center gap-3 pl-12">
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {anuncio.imagens?.[0] ? (
                  <img
                    src={anuncio.imagens[0]}
                    alt={anuncio.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-50">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7bcb2cd18_Alphase.png"
                      alt="Alpha-se"
                      className="w-6 h-6 opacity-60"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Anúncio: {anuncio.titulo}
                </p>
                <p className="text-sm text-green-600 font-semibold">
                  {anuncio.preco ? formatPrice(anuncio.preco) : 'Preço a combinar'}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          {mensagens.map((msg) => {
            const isMyMessage = msg.remetente_email === user.email;
            return (
              <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-sm ${
                  isMyMessage 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white border'
                }`}>
                  <p>{msg.conteudo}</p>
                  <p className={`text-xs mt-1 ${
                    isMyMessage ? 'text-green-200' : 'text-gray-500'
                  }`}>
                    {format(new Date(msg.created_date), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white border-t sticky bottom-0 z-40">
        <div className="max-w-2xl mx-auto p-4">
          <form onSubmit={handleEnviarMensagem} className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1"
              autoComplete="off"
            />
            <Button 
              type="submit" 
              disabled={enviandoMensagem || !novaMensagem.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </footer>

      {/* Dialog de confirmação para deletar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar esta conversa? Todas as mensagens serão perdidas permanentemente.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChat}
              disabled={deletingChat}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {deletingChat ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Apagando...
                </>
              ) : (
                "Apagar Conversa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
