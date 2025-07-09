
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Anuncio } from "@/api/entities";
import { User } from "@/api/entities";
import { getPublicAnuncios } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home as HomeIcon, 
  ShoppingBag, 
  Wrench, 
  Building,
  Star,
  MessageCircle,
  Plus,
  Users, // Make sure Users is imported for the new category
  TrendingUp,
  Car
} from "lucide-react";
import { motion } from "framer-motion";

import HeroSection from "../components/home/HeroSection";
import FeaturedAds from "../components/home/FeaturedAds";
import CategorySection from "../components/home/CategorySection";
import StatsSection from "../components/home/StatsSection";
import ContactSection from "../components/home/ContactSection";

// Esta página é PÚBLICA e deve ser acessível sem login
export default function Home() {
  const [user, setUser] = useState(null);
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Tenta buscar o usuário logado, mas NÃO bloqueia se não houver
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      // Se não há usuário logado, isso é normal e esperado para uma landing page
      setUser(null);
    }

    try {
      // Usa a função pública para carregar os anúncios
      const { data: anunciosData } = await getPublicAnuncios();
      // Limita a 6 anúncios para a seção de destaque
      setAnuncios(anunciosData?.slice(0, 6) || []);
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
      // Se falhar ao carregar anúncios, não quebra a página
      setAnuncios([]);
    }
    
    setLoading(false);
  };

  const categories = [
    {
      name: "Imóveis",
      value: "imoveis",
      icon: Building,
      color: "bg-green-100 text-green-700",
      description: "Compre ou alugue imóveis"
    },
    {
      name: "Veículos",
      value: "veiculos",
      icon: Car,
      color: "bg-red-100 text-red-700",
      description: "Carros, motos e mais"
    },
    {
      name: "Para Casa",
      value: "para_casa",
      icon: HomeIcon,
      color: "bg-orange-100 text-orange-700",
      description: "Móveis e eletrodomésticos"
    },
    {
      name: "Serviços",
      value: "servicos",
      icon: Wrench,
      color: "bg-purple-100 text-purple-700",
      description: "Contrate profissionais"
    },
    {
      name: "Bebês e Crianças",
      value: "bebes_criancas",
      icon: Users,
      color: "bg-pink-100 text-pink-700",
      description: "Tudo para os pequenos"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* A HeroSection exibe botões de login/cadastro se o usuário não estiver logado */}
      <HeroSection user={user} />
      
      <CategorySection categories={categories} />
      
      {/* A seção de anúncios em destaque é visível para todos */}
      <FeaturedAds anuncios={anuncios} loading={loading} user={user} />
      
      <StatsSection />

      {/* Call to Action com botões de login/cadastro */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Junte-se à nossa comunidade e comece a comprar, vender e oferecer serviços hoje mesmo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to={createPageUrl("CriarAnuncio")}>
                  <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Meu Anúncio
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => User.login()}
                    className="bg-white text-green-600 hover:bg-gray-100"
                  >
                    Comece Agora
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
