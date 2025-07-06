import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import LoginForm from './auth/LoginForm';
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";

export default function LoginPrompt() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    // O reload será feito pelo componente LoginForm ou pelo redirecionamento do Google
  };

  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4f8d08c82_Alphase.png" 
                  alt="Alpha-se Logo" 
                  className="w-10 h-10"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Acesso Exclusivo
              </CardTitle>
              <p className="text-gray-600">
                Para ver esta página, você precisa fazer o login com sua conta Google.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Benefícios */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Comunidade Segura</h4>
                    <p className="text-sm text-gray-600">Apenas moradores e visitantes verificados.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Conecte-se com Vizinhos</h4>
                    <p className="text-sm text-gray-600">Compre, venda e contrate serviços com segurança.</p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={() => setShowLoginDialog(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  size="lg"
                >
                  Entrar com Google
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dialog de Login */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md p-0 border-0">
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onClose={() => setShowLoginDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}