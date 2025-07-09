
import React, { useState, useEffect } from "react";
import { EmailTemplate } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, Edit, Save, Plus, Eye, AlertCircle, CheckCircle, Copy, Info, 
  Sparkles, Palette, Type, Image, Users, Heart, FileText
} from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await EmailTemplate.list("-updated_date");
      setTemplates(data);
      
      const welcomeTemplate = data.find(t => t.nome === "boas_vindas");
      if (!welcomeTemplate) {
        await createDefaultWelcomeTemplate();
        await loadTemplates();
        return;
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      setMessage({ type: "error", text: "Erro ao carregar templates de email." });
    }
    setLoading(false);
  };

  const createDefaultWelcomeTemplate = async () => {
    const defaultTemplate = {
      nome: "boas_vindas",
      assunto: "🏠 Bem-vindo ao Alpha-se - Sua nova comunidade digital!",
      descricao: "Email automático de boas-vindas para novos usuários",
      ativo: true,
      conteudo_html: getDefaultWelcomeHTML()
    };
    try {
      await EmailTemplate.create(defaultTemplate);
    } catch (error) {
      console.error("Erro ao criar template padrão:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      if (!editingTemplate.nome || !editingTemplate.assunto || !editingTemplate.conteudo_html) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }
      if (editingTemplate.id) {
        await EmailTemplate.update(editingTemplate.id, editingTemplate);
      } else {
        await EmailTemplate.create(editingTemplate);
      }
      setMessage({ type: "success", text: "✅ Template salvo com sucesso!" });
      setEditingTemplate(null);
      await loadTemplates();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
    setSaving(false);
  };

  const handleEdit = (template) => {
    setEditingTemplate({ ...template });
    setPreviewMode(false);
    setMessage({ type: "", text: "" });
  };

  const handleNew = () => {
    setEditingTemplate({
      nome: "",
      assunto: "",
      descricao: "",
      conteudo_html: getBlankTemplate(),
      ativo: true
    });
    setPreviewMode(false);
    setMessage({ type: "", text: "" });
    setSelectedPreset("");
  };
  
  const handleCopyVariable = (variable) => {
    navigator.clipboard.writeText(variable);
    setMessage({ type: "success", text: `✅ Variável ${variable} copiada para a área de transferência!` });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const insertContentBlock = (blockType) => {
    const blocks = {
      header: `
        <div style="text-align: center; background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 20px; margin-bottom: 30px;">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4f8d08c82_Alphase.png" alt="Alpha-se Logo" style="width: 80px; height: 80px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Bem-vindo ao Alpha-se!</h1>
          <p style="color: #dcfce7; margin: 10px 0 0 0; font-size: 18px;">Seu vizinho tem!</p>
        </div>
      `,
      greeting: `
        <div style="background: #f9fafb; padding: 30px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 24px;">Olá, {{nome}}!</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0; font-size: 16px;">
            Ficamos muito felizes em ter você conosco na plataforma Alpha-se, 
            a rede social exclusiva dos condomínios Alphaville Lagoa dos Ingleses.
          </p>
        </div>
      `,
      morador_info: `
        <div style="background: #ecfdf5; border: 2px solid #22c55e; padding: 25px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #16a34a; margin: 0 0 15px 0; font-size: 20px;">📍 Você se cadastrou como MORADOR</h3>
          <p style="color: #166534; line-height: 1.6; margin: 0 0 15px 0;">
            Como morador dos condomínios Alphaville, você tem acesso completo à plataforma:
          </p>
          <ul style="color: #166534; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>✅ Criar anúncios ilimitados</li>
            <li>✅ Comprar e vender com vizinhos</li>
            <li>✅ Contratar e oferecer serviços</li>
            <li>✅ Acesso permanente à plataforma</li>
          </ul>
        </div>
      `,
      visitante_info: `
        <div style="background: #f3e8ff; border: 2px solid #8b5cf6; padding: 25px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 20px;">👋 Você se cadastrou como VISITANTE</h3>
          <p style="color: #6b46c1; line-height: 1.6; margin: 0 0 15px 0;">
            Como visitante, você pode anunciar na nossa plataforma por uma taxa simbólica:
          </p>
          <ul style="color: #6b46c1; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>✅ Criar anúncios por 30 dias</li>
            <li>✅ Vender produtos e serviços</li>
            <li>✅ Conectar-se com moradores</li>
            <li>💳 Taxa: R$ 9,99 por 30 dias</li>
          </ul>
        </div>
      `,
      cta_button: `
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://alpha-se.com.br" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            🚀 Acessar Plataforma
          </a>
        </div>
      `,
      contact_footer: `
        <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 40px; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0 0 15px 0; font-weight: bold; color: #6b7280;">Precisa de ajuda? Entre em contato:</p>
          <p style="margin: 5px 0;">📱 WhatsApp: (31) 99555-7007</p>
          <p style="margin: 5px 0;">📧 Email: contato@alpha-se.com.br</p>
          <p style="margin: 5px 0;">📸 Instagram: @alphase.oficial</p>
          <p style="margin: 20px 0 0 0; font-size: 12px;">© 2024 Alpha-se. Todos os direitos reservados.</p>
        </div>
      `
    };

    const currentContent = editingTemplate.conteudo_html || "";
    const newContent = currentContent + blocks[blockType];
    setEditingTemplate({ ...editingTemplate, conteudo_html: newContent });
    setMessage({ type: "success", text: "✅ Bloco adicionado ao template!" });
    setTimeout(() => setMessage({ type: "", text: "" }), 2000);
  };

  const applyPreset = (presetType) => {
    const presets = {
      welcome_complete: {
        assunto: "🏠 Bem-vindo ao Alpha-se - Sua nova comunidade digital!",
        conteudo_html: getDefaultWelcomeHTML()
      },
      simple_welcome: {
        assunto: "Bem-vindo ao Alpha-se!",
        conteudo_html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Olá, {{nome}}!</h1>
            <p>Bem-vindo ao Alpha-se! Estamos felizes em tê-lo conosco.</p>
            <p>Aproveite nossa plataforma para conectar-se com sua comunidade.</p>
            <p>Atenciosamente,<br>Equipe Alpha-se</p>
          </div>
        `
      },
    };

    if (presets[presetType]) {
      setEditingTemplate({
        ...editingTemplate,
        ...presets[presetType]
      });
      setSelectedPreset(presetType);
      setMessage({ type: "success", text: "✅ Template aplicado com sucesso!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 2000);
    }
  };

  const toggleActive = async (template) => {
    try {
      await EmailTemplate.update(template.id, { ativo: !template.ativo });
      await loadTemplates();
      setMessage({ type: "success", text: `✅ Template ${template.ativo ? 'desativado' : 'ativado'} com sucesso!` });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Erro ao alterar status do template." });
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      [{ 'align': [] }],
      ['clean']
    ],
  };
  
  const availableVariables = [
    { name: "{{nome}}", description: "Nome completo do usuário", icon: Users },
    { name: "{{user_type}}", description: "Tipo: 'morador' ou 'visitante'", icon: Badge }
  ];

  const contentBlocks = [
    { name: "Cabeçalho", key: "header", icon: Image, description: "Logo e título principal" },
    { name: "Saudação", key: "greeting", icon: Heart, description: "Mensagem de boas-vindas personalizada" },
    { name: "Info Morador", key: "morador_info", icon: Users, description: "Informações para moradores" },
    { name: "Info Visitante", key: "visitante_info", icon: FileText, description: "Informações para visitantes" },
    { name: "Botão de Ação", key: "cta_button", icon: Sparkles, description: "Botão para acessar plataforma" },
    { name: "Rodapé Contato", key: "contact_footer", icon: Mail, description: "Informações de contato" }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {message.text && (
          <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
            {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">📧 Templates de Email</h2>
            <p className="text-gray-600">Gerencie os emails automáticos da plataforma</p>
          </div>
          <Button onClick={handleNew} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {editingTemplate ? (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                {editingTemplate.id ? 'Editar Template' : 'Novo Template'}
              </CardTitle>
              <CardDescription>
                Use os blocos pré-construídos e o editor visual para criar emails profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={previewMode ? "preview" : "edit"} onValueChange={(v) => setPreviewMode(v === "preview")}>
                <TabsList className="mb-6 w-full">
                  <TabsTrigger value="edit" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-6">
                  {/* Informações Básicas */}
                  <Card className="bg-gray-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">ℹ️ Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome do Template *</Label>
                          <Input
                            id="nome"
                            value={editingTemplate.nome}
                            onChange={(e) => setEditingTemplate({...editingTemplate, nome: e.target.value})}
                            placeholder="Ex: boas_vindas"
                          />
                        </div>
                        <div>
                          <Label htmlFor="assunto">Assunto do Email *</Label>
                          <Input
                            id="assunto"
                            value={editingTemplate.assunto}
                            onChange={(e) => setEditingTemplate({...editingTemplate, assunto: e.target.value})}
                            placeholder="Ex: Bem-vindo ao Alpha-se!"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input
                          id="descricao"
                          value={editingTemplate.descricao}
                          onChange={(e) => setEditingTemplate({...editingTemplate, descricao: e.target.value})}
                          placeholder="Descreva o que este template faz"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingTemplate.ativo}
                          onCheckedChange={(checked) => setEditingTemplate({...editingTemplate, ativo: checked})}
                        />
                        <Label>Template Ativo</Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Templates Prontos */}
                  <Card className="bg-blue-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">✨ Templates Prontos</CardTitle>
                      <CardDescription>Comece com um template pré-construído</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Button 
                          variant={selectedPreset === "welcome_complete" ? "default" : "outline"}
                          onClick={() => applyPreset("welcome_complete")}
                          className="justify-start h-auto p-4"
                        >
                          <div className="text-left">
                            <div className="font-semibold">Email Completo de Boas-vindas</div>
                            <div className="text-sm opacity-70">Com todas as informações para moradores e visitantes</div>
                          </div>
                        </Button>
                        <Button 
                          variant={selectedPreset === "simple_welcome" ? "default" : "outline"}
                          onClick={() => applyPreset("simple_welcome")}
                          className="justify-start h-auto p-4"
                        >
                          <div className="text-left">
                            <div className="font-semibold">Email Simples</div>
                            <div className="text-sm opacity-70">Mensagem básica de boas-vindas</div>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Blocos de Conteúdo */}
                  <Card className="bg-purple-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">🧱 Blocos de Conteúdo</CardTitle>
                      <CardDescription>Adicione blocos prontos ao seu email</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-3">
                        {contentBlocks.map(block => (
                          <Tooltip key={block.key}>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                onClick={() => insertContentBlock(block.key)}
                                className="h-auto p-3 flex-col gap-2"
                              >
                                <block.icon className="w-5 h-5" />
                                <div className="text-center">
                                  <div className="font-semibold text-xs">{block.name}</div>
                                </div>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{block.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Variáveis */}
                  <Card className="bg-green-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">🔗 Variáveis Dinâmicas</CardTitle>
                      <CardDescription>Clique para copiar e cole no editor</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        {availableVariables.map(v => (
                          <Tooltip key={v.name}>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                onClick={() => handleCopyVariable(v.name)} 
                                className="justify-start h-auto p-3"
                              >
                                <v.icon className="w-4 h-4 mr-3" />
                                <div className="text-left">
                                  <div className="font-mono text-sm">{v.name}</div>
                                  <div className="text-xs opacity-70">{v.description}</div>
                                </div>
                                <Copy className="w-3 h-3 ml-auto" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Clique para copiar</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Editor Visual */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">✏️ Editor Visual</CardTitle>
                      <CardDescription>Edite o conteúdo do seu email</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded-lg border min-h-[300px]">
                        <ReactQuill
                          theme="snow"
                          value={editingTemplate.conteudo_html}
                          onChange={(content) => setEditingTemplate({ ...editingTemplate, conteudo_html: content })}
                          modules={quillModules}
                          style={{ minHeight: '250px' }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Separator />

                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Salvando..." : "Salvar Template"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gray-100 p-4 border-b">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="w-4 h-4" />
                        <span className="font-semibold">Preview do Email</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-800">
                          <span className="font-semibold">De:</span> Alpha-se Plataforma &lt;contato@alpha-se.com.br&gt;
                        </p>
                        <p className="text-gray-800">
                          <span className="font-semibold">Assunto:</span> {editingTemplate.assunto.replace(/\{\{nome\}\}/g, "João Silva")}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div 
                        className="p-6 max-h-[70vh] overflow-y-auto"
                        dangerouslySetInnerHTML={{ 
                          __html: editingTemplate.conteudo_html
                            .replace(/\{\{nome\}\}/g, "<strong style='color: #22c55e;'>João Silva</strong>")
                            .replace(/\{\{user_type\}\}/g, "<strong style='color: #22c55e;'>morador</strong>")
                        }} 
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum template encontrado</h3>
                  <p className="text-gray-600 mb-4">Crie seu primeiro template de email.</p>
                  <Button onClick={handleNew} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-xl">{template.nome}</h3>
                          <Badge variant={template.ativo ? "default" : "secondary"} className="text-xs">
                            {template.ativo ? "✅ Ativo" : "⏸️ Inativo"}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">
                          <span className="font-medium">Assunto:</span> {template.assunto}
                        </p>
                        {template.descricao && (
                          <p className="text-gray-500 text-sm">{template.descricao}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleActive(template)}
                          className={template.ativo ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                        >
                          {template.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function getBlankTemplate() {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p>Comece a escrever seu email aqui...</p>
      <p>Use os blocos pré-construídos acima para acelerar a criação!</p>
    </div>
  `;
}

function getDefaultWelcomeHTML() {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 20px; margin-bottom: 30px; border-radius: 12px;">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4f8d08c82_Alphase.png" alt="Alpha-se Logo" style="width: 80px; height: 80px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Bem-vindo ao Alpha-se!</h1>
        <p style="color: #dcfce7; margin: 10px 0 0 0; font-size: 18px;">Seu vizinho tem!</p>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #22c55e;">
        <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 24px;">Olá, {{nome}}!</h2>
        <p style="color: #6b7280; line-height: 1.6; margin: 0; font-size: 16px;">
            Ficamos muito felizes em ter você conosco na plataforma Alpha-se, 
            a rede social exclusiva dos condomínios Alphaville Lagoa dos Ingleses.
        </p>
    </div>

    <div style="background: #ecfdf5; border: 2px solid #22c55e; padding: 25px; border-radius: 12px; margin: 20px 0;">
        <h3 style="color: #16a34a; margin: 0 0 15px 0; font-size: 20px;">📍 Informações para {{user_type}}</h3>
        <p style="color: #166534; line-height: 1.6; margin: 0 0 15px 0;">
            Aproveite todos os recursos disponíveis na nossa plataforma.
        </p>
    </div>

    <div style="text-align: center; margin: 40px 0;">
        <a href="https://alpha-se.com.br" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            🚀 Acessar Plataforma
        </a>
    </div>

    <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 40px; color: #9ca3af; font-size: 14px;">
        <p style="margin: 0 0 15px 0; font-weight: bold; color: #6b7280;">Precisa de ajuda? Entre em contato:</p>
        <p style="margin: 5px 0;">📱 WhatsApp: (31) 99555-7007</p>
        <p style="margin: 5px 0;">📧 Email: contato@alpha-se.com.br</p>
        <p style="margin: 5px 0;">📸 Instagram: @alphase.oficial</p>
        <p style="margin: 20px 0 0 0; font-size: 12px;">© 2024 Alpha-se. Todos os direitos reservados.</p>
    </div>
</div>`;
}
