import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm"; // Caminho correto

export default function HeroSection({ user }) {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Seção da Animação - PRIMEIRO */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center order-1 lg:order-2"
          >
            <div className="relative w-full max-w-xs h-64 sm:max-w-sm sm:h-80 flex items-center justify-center">
              
              {/* Círculos de Fundo Estáticos */}
              <div className="absolute w-full h-full border border-green-200/50 rounded-full"></div>
              <div className="absolute w-3/4 h-3/4 border border-green-300/30 rounded-full"></div>
              <div className="absolute w-1/2 h-1/2 border border-green-400/20 rounded-full"></div>

              {/* Ondas Animadas */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute border-2 border-green-300/30 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.5, 2], 
                    opacity: [0.8, 0.4, 0] 
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: "easeOut"
                  }}
                  style={{ width: '33%', height: '33%' }}
                />
              ))}
              
              {/* Logo Central */}
              <motion.div 
                className="relative z-10 w-1/2 h-1/2 bg-gradient-to-br from-white to-green-50 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50"
                animate={{ 
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4f8d08c82_Alphase.png" 
                  alt="Alpha-se Logo" 
                  className="w-3/4 h-3/4 object-contain"
                />
              </motion.div>

              {/* Elementos Flutuantes */}
              <motion.div
                className="absolute top-4 right-4 w-10 h-10 bg-green-200/60 rounded-full flex items-center justify-center shadow-lg"
                animate={{ y: [-8, 8, -8] }}
                transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
              >
                <span className="text-lg">🏠</span>
              </motion.div>

              <motion.div
                className="absolute bottom-4 left-4 w-12 h-12 bg-emerald-200/60 rounded-full flex items-center justify-center shadow-lg"
                animate={{ y: [8, -8, 8] }}
                transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
              >
                <span className="text-xl">🤝</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Seção de Texto - SEGUNDO */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <div className="mb-6">
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="text-gray-800 block mb-2">
                  Está procurando?
                </span>
                <motion.span 
                  className="block bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 bg-clip-text text-transparent font-extrabold relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Seu vizinho tem!
                  <motion.div 
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                  />
                </motion.span>
              </motion.h1>
            </div>
            
            <motion.p 
              className="text-base sm:text-lg text-gray-600 mb-2 max-w-lg mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              A plataforma para compra, venda e serviços entre vizinhos. 
              Seguro, prático e exclusivo.
            </motion.p>
            <motion.p 
              className="text-sm text-green-700 font-semibold mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              *Exclusivo para moradores dos condomínios Alphaville.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {user ? (
                <>
                  <Link to={createPageUrl("CriarAnuncio")}>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                      <Plus className="w-5 h-5 mr-2" />
                      Criar Anúncio
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Anuncios")}>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      <Search className="w-5 h-5 mr-2" />
                      Ver Anúncios
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <LoginButton />
                </>
              )}
            </div>

            <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Moradores verificados</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Comunidade segura</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Componente separado para o botão de login
function LoginButton() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    window.location.reload();
  };

  return (
    <>
      <Button
        size="lg"
        onClick={() => setShowLoginDialog(true)}
        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
      >
        Entrar ou Cadastrar-se
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      {showLoginDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative max-w-md w-full mx-4">
            <LoginForm 
              onSuccess={handleLoginSuccess}
              onClose={() => setShowLoginDialog(false)}
            />
            <button
              onClick={() => setShowLoginDialog(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold z-10"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}