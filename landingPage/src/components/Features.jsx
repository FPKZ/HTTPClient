import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Zap,
  Layers,
  Code2,
  Activity,
  FolderTree,
  Shield,
  Sparkles,
  Gauge,
} from "lucide-react";

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Zap,
      title: "Interface Ultra-Responsiva",
      description:
        "Construído com React 19, Vite e Electron para latência zero. Painéis redimensionáveis e menus nativos.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Layers,
      title: "Gerenciamento de Sessões",
      description:
        "Sistema de abas inteligente e isolado para múltiplos contextos de trabalho simultâneos.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Code2,
      title: "Editor Profissional",
      description:
        "Integração com Monaco Editor para JSON, scripts e visualização de respostas (HTML/Text/JSON).",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Activity,
      title: "Action Logs Detalhados",
      description:
        "Rastreamento granular de alterações em variáveis e ambiente com debounce inteligente.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: FolderTree,
      title: "Gestão de Collections",
      description:
        "Organização hierárquica completa com suporte a pastas, rotas e ambientes.",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: Shield,
      title: "Segurança e Conformidade",
      description:
        "Monitoramento em tempo real de payloads e cabeçalhos para garantir conformidade.",
      gradient: "from-red-500 to-rose-500",
    },
    {
      icon: Sparkles,
      title: "UI Moderna",
      description:
        "Design premium com Tailwind CSS, glassmorphism e animações suaves.",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Gauge,
      title: "Alta Performance",
      description:
        "Otimizado para velocidade com Zustand para gerenciamento de estado eficiente.",
      gradient: "from-teal-500 to-cyan-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="features" className="section-container" ref={ref}>
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Funcionalidades Poderosas</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Tudo que você precisa para trabalhar com APIs de forma profissional
            e eficiente
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card group"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tech Stack Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-20 text-center"
      >
        <h3 className="text-2xl font-display font-bold mb-8 text-white">
          Construído com Tecnologias Modernas
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {[
            "React 19",
            "Electron",
            "Tailwind CSS 4.0",
            "Zustand",
            "Axios",
            "Monaco Editor",
            "Radix UI",
            "Vite",
          ].map((tech, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className="glass-effect px-6 py-3 rounded-full text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Features;
