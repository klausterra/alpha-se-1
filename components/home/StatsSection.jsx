import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Moradores Cadastrados",
      color: "text-blue-600"
    },
    {
      icon: ShoppingBag,
      value: "150+",
      label: "Anúncios Ativos",
      color: "text-green-600"
    },
    {
      icon: CheckCircle,
      value: "98%",
      label: "Satisfação dos Usuários",
      color: "text-purple-600"
    },
    {
      icon: Clock,
      value: "24h",
      label: "Suporte Disponível",
      color: "text-orange-600"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nossa Comunidade em Números
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Veja como o Alpha-se está transformando a vida no condomínio
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}