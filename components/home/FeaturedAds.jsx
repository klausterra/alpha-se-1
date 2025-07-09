
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Eye, User, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedAds({ anuncios, loading, user }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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

  const getCategoryColor = (categoria) => {
    const colors = {
      produto: "bg-blue-100 text-blue-700",
      servico: "bg-purple-100 text-purple-700",
      imovel_venda: "bg-green-100 text-green-700",
      imovel_locacao: "bg-orange-100 text-orange-700"
    };
    return colors[categoria] || "bg-gray-100 text-gray-700";
  };

  const getUserTypeBadge = (type) => {
    switch (type) {
      case 'morador':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 capitalize">
            <User className="w-3 h-3" />
            Morador
          </Badge>
        );
      case 'visitante':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 capitalize">
            <User className="w-3 h-3" />
            Visitante
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Anúncios em Destaque
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Confira os últimos anúncios da nossa comunidade
          </p>
        </motion.div>

        {anuncios.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum anúncio em destaque no momento
            </h3>
            <p className="text-gray-600 mb-6">
              Seja o primeiro a anunciar ou volte em breve para ver as novidades.
            </p>
            {user && (
              <Link to={createPageUrl("CriarAnuncio")}>
                <Button className="bg-green-600 hover:bg-green-700">
                  Criar Primeiro Anúncio
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {anuncios.filter(anuncio => anuncio.id !== "mock1").map((anuncio, index) => (
                <motion.div
                  key={anuncio.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {anuncio.destacado && (
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1">
                        <div className="flex items-center justify-center text-white text-sm font-medium">
                          <Star className="w-4 h-4 mr-1" />
                          Destaque
                        </div>
                      </div>
                    )}
                    
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
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
                            className="w-16 h-16 opacity-60"
                          />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className={getCategoryColor(anuncio.categoria)}>
                          {getCategoryLabel(anuncio.categoria)}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        {getUserTypeBadge(anuncio.user_type)}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {anuncio.titulo}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {anuncio.descricao}
                      </p>

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-green-600">
                          {anuncio.preco > 0 ? formatPrice(anuncio.preco) : "Consulte"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {anuncio.nickname || anuncio.nome_anunciante}
                        </span>
                        <Link to={createPageUrl(`AnuncioDetalhes?id=${anuncio.id}`)}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Ver Mais
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {anuncios.some(a => a.id !== "mock1") && (
              <div className="text-center">
                <Link to={createPageUrl("Anuncios")}>
                  <Button variant="outline" size="lg">
                    Ver Todos os Anúncios
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
