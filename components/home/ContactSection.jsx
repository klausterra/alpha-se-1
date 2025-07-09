
import React, { useState } from "react";
import { sendNotificationEmail } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Phone, Mail, Send, CheckCircle, MessageCircle, AlertCircle } from "lucide-react";

export default function ContactSection() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        
        try {
            await sendNotificationEmail({
                to: "contato@alpha-se.com.br",
                from_email: formData.email,
                from_name: formData.name,
                subject: `Nova Mensagem de Contato: ${formData.name}`,
                body: `
                    Você recebeu uma nova mensagem do formulário de contato do site Alpha-se.<br/><br/>
                    <b>Nome:</b> ${formData.name}<br/>
                    <b>Email:</b> ${formData.email}<br/>
                    <b>Mensagem:</b><br/>
                    <p>${formData.message.replace(/\n/g, '<br/>')}</p>
                `
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError("Não foi possível enviar sua mensagem. Tente novamente mais tarde.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Entre em Contato
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Tem alguma dúvida ou sugestão? Fale conosco!
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">WhatsApp</h3>
                                <p className="text-gray-600">Fale diretamente com nossa equipe.</p>
                                <a 
                                    href="https://wa.me/5531995557007?text=Ol%C3%A1%2C%20vim%20pelo%20site%20Alpha-se%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es."
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-2 mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    (31) 99555-7007
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Mail className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Email</h3>
                                <p className="text-gray-600">
                                    Envie um email para <a href="mailto:contato@alpha-se.com.br" className="text-green-600 font-medium hover:underline">contato@alpha-se.com.br</a> ou use o formulário.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        {submitted ? (
                            <Alert className="border-green-200 bg-green-50 text-green-800 h-full flex flex-col items-center justify-center text-center p-8">
                                <CheckCircle className="h-10 w-10 mb-4" />
                                <AlertDescription className="text-lg font-medium">
                                    Obrigado! Sua mensagem foi enviada com sucesso.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Erro</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <div>
                                    <Label htmlFor="name">Nome</Label>
                                    <Input id="name" placeholder="Seu nome" required value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="seu@email.com" required value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <Label htmlFor="message">Mensagem</Label>
                                    <Textarea id="message" placeholder="Escreva sua mensagem aqui..." required value={formData.message} onChange={handleInputChange} />
                                </div>
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={submitting}>
                                    {submitting ? (
                                        "Enviando..."
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" /> Enviar Mensagem
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
