import { motion } from "framer-motion";
import { Download, Github, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-primary-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-accent-500/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="section-container relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 glass-effect px-4 py-2 rounded-full mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            <span className="text-sm font-medium">
              Em desenvolvimento ativo
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 text-shadow"
          >
            <span className="gradient-text">HTTPClient</span>
            <br />
            <span className="text-white">Requisições API Simplificadas</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Uma solução desktop de alta performance para simplificar seu
            workflow de requisições HTTP, testes de API e automação corporativa.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#donation"
              className="btn-primary flex items-center space-x-2 group"
            >
              <Download size={20} />
              <span>Apoiar o Projeto</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            <a
              href="https://github.com/FPKZ/HTTPClient"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
            >
              <Github size={20} />
              <span>Ver no GitHub</span>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { label: "Versão", value: "1.0.41" },
              { label: "Plataformas", value: "Win/Linux" },
              { label: "Open Source", value: "100%" },
              { label: "Gratuito", value: "Sempre" },
            ].map((stat, index) => (
              <div key={index} className="glass-effect rounded-xl p-4">
                <div className="text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
