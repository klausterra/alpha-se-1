
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Anuncio } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { categories, categoryLabels, subcategoryLabels } from "@/components/anuncios/AnuncioCategories";


export default function CriarAnuncio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    subcategoria: "",
    preco: "",
    imagens: []
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      // Removido: verificações que impediam a criação de anúncios
      // baseadas em completion de perfil, status de pagamento ou aprovação.
    } catch (error) {
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  };

  const formatPrice = (value) => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue) return '';
    
    // Converte para número e divide por 100 para ter os centavos
    // Using parseInt and then dividing by 100 to handle integer-based cents to avoid float precision issues with direct float arithmetic
    const numberValue = parseInt(numericValue, 10) / 100;
    
    // Formata como moeda brasileira
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parsePriceToNumber = (formattedPrice) => {
    if (!formattedPrice) return 0;
    // Remove pontos (milhares) e substitui vírgula por ponto (decimal) para conversão
    const cleanPrice = formattedPrice.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanPrice);
  };

  const handleInputChange = (field, value) => {
    if (field === 'preco') {
      const formatted = formatPrice(value);
      setFormData(prev => ({
        ...prev,
        [field]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setError("");
  };

  const handleImageUpload = async (files) => {
    if (files.length + formData.imagens.length > 5) {
      setError("Máximo de 5 imagens permitidas.");
      return;
    }

    setUploadingImages(true);
    try {
      // Adicionado o parâmetro is_public: true
      const uploadPromises = Array.from(files).map(file => UploadFile({ file, is_public: true }));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.file_url);
      
      setFormData(prev => ({
        ...prev,
        imagens: [...prev.imagens, ...imageUrls]
      }));
    } catch (error) {
      setError("Erro ao fazer upload das imagens.");
    }
    setUploadingImages(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!formData.titulo || !formData.descricao || !formData.categoria || !formData.subcategoria || !formData.preco) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }

      if (formData.imagens.length === 0) {
        throw new Error("É necessário adicionar pelo menos uma imagem ao anúncio.");
      }
      
      // Verificação básica apenas para campos essenciais
      if (!user.full_name) {
        throw new Error("Seu nome precisa estar preenchido no perfil para criar anúncios.");
      }

      let dataExpiracao = null;
      if (user.user_type === 'visitante') {
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 30);
        dataExpiracao = expiration.toISOString().split('T')[0];
      }

      console.log("Criando anúncio com user_type:", user.user_type); // Debug

      await Anuncio.create({
        ...formData,
        preco: parsePriceToNumber(formData.preco), // Converte o preço formatado de volta para número
        user_type: user.user_type || 'visitante', // Garantir que sempre tenha um valor
        data_expiracao: dataExpiracao,
        nome_anunciante: user.full_name,
        nickname: user.nickname || user.full_name.split(' ')[0], // Usar primeiro nome se não tiver nickname
        whatsapp: user.phone || "Não informado", // Permitir sem telefone
        anunciante_foto_url: user.profile_picture_url || user.picture
      });

      setSuccess("Anúncio publicado com sucesso!");
      
      setTimeout(() => {
        navigate(createPageUrl("Anuncios"));
      }, 2000);

    } catch (error) {
      setError(error.message);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Criar Novo Anúncio
          </h1>
          <p className="text-gray-600">
            Preencha as informações abaixo para criar seu anúncio
          </p>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Informações do Anúncio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Ex: iPhone 12 Pro Max 128GB"
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    placeholder="Descreva detalhadamente seu produto ou serviço..."
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          categoria: value,
                          subcategoria: ""
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subcategoria">Subcategoria *</Label>
                    <Select
                      value={formData.subcategoria}
                      onValueChange={(value) => handleInputChange('subcategoria', value)}
                      disabled={!formData.categoria}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.categoria && categories[formData.categoria]?.map(subcat => (
                          <SelectItem key={subcat} value={subcat}>
                            {subcategoryLabels[subcat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="preco">Preço (R$) *</Label>
                  <Input
                    id="preco"
                    value={formData.preco}
                    onChange={(e) => handleInputChange('preco', e.target.value)}
                    placeholder="0,00"
                    className="text-right font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Digite apenas números. Ex: "15000" para R$ 150,00
                  </p>
                </div>

                <div>
                  <Label>Imagens (máximo 5) *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                    {formData.imagens.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {formData.imagens.length < 5 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {uploadingImages ? (
                          <span className="flex items-center justify-center text-gray-600">
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-2"></span>
                            Fazendo upload...
                          </span>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">
                              Clique para adicionar imagens
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(createPageUrl("Anuncios"))}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || uploadingImages}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? "Criando..." : "Criar Anúncio"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
