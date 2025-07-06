import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Gift, ArrowRight } from "lucide-react";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";

export default function LoginForm({ onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codigoIndicacao, setCodigoIndicacao] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Se houver um código de indicação, salvamos no localStorage para usar após o login.
      if (codigoIndicacao.trim()) {
        localStorage.setItem('codigo_indicacao_temp', codigoIndicacao.trim());
      }
      
      // O User.login() aciona o fluxo de autenticação do Google.
      await User.login();
      
      // O redirecionamento e a atualização do estado da página serão tratados pelo Base44.
    } catch (err) {
      console.error("Erro no login com Google:", err);
      setError("Não foi possível iniciar o login com Google. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4f8d08c82_Alphase.png" 
            alt="Alpha-se Logo" 
            className="w-10 h-10"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Acesse o Alpha-se
        </CardTitle>
        <p className="text-gray-600 text-sm mt-2">
          Use sua conta Google para entrar ou se cadastrar de forma segura.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Seção de Código de Indicação */}
        <div className="space-y-3">
          {!showCodeInput ? (
            <Button
              variant="outline"
              onClick={() => setShowCodeInput(true)}
              className="w-full text-green-600 border-green-200 hover:bg-green-50"
            >
              <Gift className="w-4 h-4 mr-2" />
              Tenho um código de indicação
            </Button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="codigoIndicacao">Código de Indicação (Opcional)</Label>
              <div className="flex gap-2">
                <Input
                  id="codigoIndicacao"
                  placeholder="Ex: INFLU10"
                  value={codigoIndicacao}
                  onChange={(e) => setCodigoIndicacao(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCodeInput(false);
                    setCodigoIndicacao("");
                  }}
                  className="px-3"
                >
                  ✕
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Botão do Google */}
        <Button
          onClick={handleGoogleLogin}
          className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
          disabled={loading}
          size="lg"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? "Conectando..." : "Continuar com Google"}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>

        {/* Informação adicional */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Ao entrar, você concorda com nossos{" "}
            <Link to={createPageUrl("TermosDeServico")} className="text-green-600 hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link to={createPageUrl("PoliticaPrivacidade")} className="text-green-600 hover:underline">
              Política de Privacidade
            </Link>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}