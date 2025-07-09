
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { UploadFile } from "@/api/integrations";

const categories = {
  imoveis: ["venda_casa", "venda_apto", "venda_lote", "aluguel_casa", "aluguel_apto", "aluguel_lote"],
  veiculos: ["carros", "motos", "outros"],
  para_casa: ["moveis", "eletrodomesticos", "decoracao"],
  servicos: ["reformas_reparos", "aulas_cursos", "saude_bem_estar", "eventos"],
  eletronicos: ["celulares", "computadores", "outros"],
  moda_beleza: ["roupas", "acessorios", "cosmeticos"],
};
const categoryLabels = {
    imoveis: "Imóveis", veiculos: "Veículos", para_casa: "Para sua Casa", servicos: "Serviços", eletronicos: "Eletrônicos", moda_beleza: "Moda e Beleza"
};
const subcategoryLabels = {
    venda_casa: "Venda - Casa", venda_apto: "Venda - Apartamento", venda_lote: "Venda - Lote", aluguel_casa: "Aluguel - Casa", aluguel_apto: "Aluguel - Apartamento", aluguel_lote: "Aluguel - Lote",
    carros: "Carros", motos: "Motos", outros: "Outros",
    moveis: "Móveis", eletrodomesticos: "Eletrodomésticos", decoracao: "Decoração",
    reformas_reparos: "Reformas e Reparos", aulas_cursos: "Aulas e Cursos", saude_bem_estar: "Saúde e Bem-estar", eventos: "Eventos",
    celulares: "Celulares", computadores: "Computadores",
    roupas: "Roupas", acessorios: "Acessórios", cosmeticos: "Cosméticos"
};

export default function AdEditForm({ anuncio, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    titulo: anuncio.titulo || "",
    descricao: anuncio.descricao || "",
    categoria: anuncio.categoria || "",
    subcategoria: anuncio.subcategoria || "",
    preco: anuncio.preco || "",
    imagens: anuncio.imagens || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, categoria: value, subcategoria: "" }));
  };
  
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    if (files.length + formData.imagens.length > 5) {
      alert("Você pode adicionar no máximo 5 imagens.");
      return;
    }
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.file_url);
      setFormData(prev => ({ ...prev, imagens: [...prev.imagens, ...imageUrls] }));
    } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        alert("Erro ao fazer upload da imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, imagens: prev.imagens.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Ensure preco is a number before sending
    const priceToSend = parseFloat(formData.preco);
    if (isNaN(priceToSend)) {
        alert("O preço deve ser um número válido.");
        setIsSubmitting(false);
        return;
    }

    await onUpdate(anuncio.id, { ...formData, preco: priceToSend });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Anúncio</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias no seu anúncio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" value={formData.titulo} onChange={(e) => handleInputChange('titulo', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={formData.categoria} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(categories).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subcategoria">Subcategoria</Label>
              <Select value={formData.subcategoria} onValueChange={(v) => handleInputChange('subcategoria', v)} disabled={!formData.categoria}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {formData.categoria && categories[formData.categoria] && categories[formData.categoria].map(subcat => (
                    <SelectItem key={subcat} value={subcat}>
                      {subcategoryLabels[subcat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input id="preco" type="number" step="0.01" value={formData.preco} onChange={(e) => handleInputChange('preco', e.target.value)} />
          </div>

          <div>
            <Label>Imagens ({formData.imagens.length}/5)</Label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {formData.imagens.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img} alt={`Anúncio imagem ${index + 1}`} className="w-full h-20 object-cover rounded"/>
                  <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3"/>
                  </button>
                </div>
              ))}
            </div>
            {formData.imagens.length < 5 && (
              <div className="border-2 border-dashed rounded p-4 text-center">
                <input type="file" id="image-upload-edit" multiple accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} className="hidden" disabled={isUploading}/>
                <label htmlFor="image-upload-edit" className="cursor-pointer">
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">Enviando...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                      <p className="text-sm">Adicionar Imagens</p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
