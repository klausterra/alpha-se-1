import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Chat } from "@/api/entities";
import { Anuncio } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import LoginPrompt from "../components/LoginPrompt";
import { Skeleton } from "@/components/ui/skeleton";

export default function Conversas() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [anuncios, setAnuncios] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Usar list() para buscar todos os chats e depois filtrar no frontend.
      const todosChats = await Chat.list("-created_date");
      
      const meusChats = todosChats.filter(chat => 
        chat.vendedor_email === userData.email || chat.comprador_email === userData.email
      );

      setChats(meusChats);

      // Carregar os anúncios relacionados
      const anunciosMap = {};
      const anuncioIds = [...new Set(meusChats.map(c => c.anuncio_id))];
      
      for (const id of anuncioIds) {
        try {
          const anuncioResults = await Anuncio.filter({ id });
          if (anuncioResults && anuncioResults.length > 0) {
            anunciosMap[id] = anuncioResults[0];
          }
        } catch (error) {
          console.log(`Erro ao buscar anúncio ${id}:`, error);
        }
      }
      setAnuncios(anunciosMap);

    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
      setUser(null);
    }
    setLoading(false);
  };

  const filteredChats = chats.filter(chat => {
    const anuncio = anuncios[chat.anuncio_id];
    const term = searchTerm.toLowerCase();
    
    const isVendedor = chat.vendedor_email === user?.email;
    const nomeOutroUsuario = (isVendedor ? chat.comprador_nome : chat.vendedor_nome) || (isVendedor ? 'Comprador' : 'Vendedor');

    const anuncioMatch = anuncio && anuncio.titulo && anuncio.titulo.toLowerCase().includes(term);
    const usuarioMatch = nomeOutroUsuario.toLowerCase().includes(term);
    const mensagemMatch = chat.ultima_mensagem && chat.ultima_mensagem.toLowerCase().includes(term);

    return anuncioMatch || usuarioMatch || mensagemMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-10 w-full mb-6" />
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Conversas</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Buscar por anúncio, pessoa ou mensagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Nenhuma conversa encontrada</h3>
            <p className="text-gray-500 mt-2">Inicie uma conversa em um anúncio para vê-la aqui.</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredChats.map(chat => {
                    const anuncio = anuncios[chat.anuncio_id];
                    const isVendedor = chat.vendedor_email === user.email;
                    
                    const nomeOutroUsuario = (isVendedor ? chat.comprador_nome : chat.vendedor_nome) || (isVendedor ? 'Comprador' : 'Vendedor');
                    const fotoOutroUsuario = isVendedor ? chat.comprador_foto_url : chat.vendedor_foto_url;
                    const fallbackInitial = nomeOutroUsuario?.[0]?.toUpperCase() || (isVendedor ? 'C' : 'V');
                    
                    const isNaoLida = (isVendedor ? chat.nao_lidas_vendedor : chat.nao_lidas_comprador) > 0;

                    return (
                        <Link to={createPageUrl(`Chat?id=${chat.id}`)} key={chat.id} className="block hover:bg-gray-50 transition-colors">
                            <div className="p-4 flex items-center gap-4">
                                <Avatar className="w-14 h-14 border">
                                    <AvatarImage src={fotoOutroUsuario} />
                                    <AvatarFallback className="bg-gray-200">
                                        {fallbackInitial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-semibold text-gray-900 truncate ${isNaoLida ? 'font-bold' : ''}`}>
                                            {nomeOutroUsuario}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                            {isNaoLida && (
                                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {chat.ultima_mensagem_data && formatDistanceToNow(new Date(chat.ultima_mensagem_data), { 
                                                    addSuffix: true, 
                                                    locale: ptBR 
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate mb-1">
                                        Anúncio: {anuncio?.titulo || 'Carregando...'}
                                    </p>
                                    <p className={`text-sm text-gray-500 truncate ${isNaoLida ? 'font-medium' : ''}`}>
                                        {chat.ultima_mensagem || 'Conversa iniciada'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}