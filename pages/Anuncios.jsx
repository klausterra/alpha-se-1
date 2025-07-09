import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, Eye, User as UserIconType, ExternalLink, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "@/components/auth/LoginForm";
import { getPublicAnuncios } from "@/api/functions";
import { categories, categoryLabels, subcategoryLabels } from "@/components/anuncios/AnuncioCategories";

export default function Anuncios({ user, userLoading }) {
  const [anuncios, setAnuncios] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [filteredAnuncios, setFilteredAnuncios] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    loadAnunciosData();
  }, []);

  useEffect(() => {
    let filtered = [...anuncios];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(ad => ad.categoria === selectedCategory);

      if (selectedSubcategory !== "all") {
        filtered = filtered.filter(ad => ad.subcategoria === selectedSubcategory);
      }
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(ad =>
        (ad.titulo && ad.titulo.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (ad.descricao && ad.descricao.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (ad.nome_anunciante && ad.nome_anunciante.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (ad.nickname && ad.nickname.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredAnuncios(filtered);
  }, [anuncios, selectedCategory, selectedSubcategory, searchTerm]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria');
    const subcategoria = urlParams.get('subcategoria');
    if (categoria) {
      setSelectedCategory(categoria);
    }
    if (subcategoria) {
      setSelectedSubcategory(subcategoria);
    }
  }, []);

  const loadAnunciosData = async () => {
    setDataLoading(true);
    try {
      const { data: anunciosData } = await getPublicAnuncios();
      if (anunciosData && Array.isArray(anunciosData)) {
        setAnuncios(anunciosData);
      } else {
        console.error("Dados inválidos do backend");
        setAnuncios([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados dos anúncios:", error);
      setAnuncios([]);
    } finally {
      setDataLoading(false);
    }
  };

  const getUserTypeBadge = (anuncio) => {
    const userType = anuncio.user_type;

    switch (userType) {
      case 'morador':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 text-xs">
            <UserIconType className="w-3 h-3" />
            Morador
          </Badge>
        );
      case 'visitante':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 text-xs">
            <UserIconType className="w-3 h-3" />
            Visitante
          </Badge>
        );
      case 'administrador':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 text-xs">
            <UserIconType className="w-3 h-3" />
            Admin
          </Badge>
        );
      default:
        return null;
    }
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

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedSubcategory("all");
  };

  if (userLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Anúncios</h1>
          <p className="text-sm text-gray-600">
            Explore produtos e serviços da comunidade.
            {!user && (
              <span className="text-green-600 font-medium ml-1">
                Faça login para entrar em contato com os anunciantes.
              </span>
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div
            className="flex items-center justify-between p-4 cursor-pointer md:cursor-default"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setFiltersOpen(!filtersOpen);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform md:hidden ${filtersOpen ? 'rotate-180' : ''}`} />
          </div>

          <div className={`border-t ${filtersOpen || (typeof window !== 'undefined' && window.innerWidth >= 768) ? 'block' : 'hidden'} md:block`}>
            <div className="p-4 grid gap-3 md:grid-cols-3 md:gap-4">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar anúncios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {Object.keys(categories).map(cat => (
                    <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory} disabled={selectedCategory === 'all'}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as subcategorias</SelectItem>
                  {selectedCategory !== 'all' && categories[selectedCategory]?.map(subcat => (
                    <SelectItem key={subcat} value={subcat}>{subcategoryLabels[subcat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredAnuncios.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' || selectedSubcategory !== 'all'
                  ? 'Nenhum anúncio encontrado'
                  : 'Nenhum anúncio disponível'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' || selectedSubcategory !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Seja o primeiro a anunciar na plataforma.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredAnuncios.map((anuncio, index) => (
              <motion.div
                key={anuncio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img
                      src={anuncio.imagem_preview_url || anuncio.imagens?.[0] || "https://alpha-se.com.br/img/padrao.jpg"}
                      alt={anuncio.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={`${getCategoryColor(anuncio.categoria)} text-xs`}>
                        {subcategoryLabels[anuncio.subcategoria] || categoryLabels[anuncio.categoria]}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      {getUserTypeBadge(anuncio)}
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
                        {anuncio.preco ? formatPrice(anuncio.preco) : "Preço a combinar"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 truncate">
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
        )}
      </div>
    </div>
  );
}