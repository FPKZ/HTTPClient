import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, Coffee, Code2, Github, Mail } from "lucide-react";

const Donation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const donationOptions = [
    {
      icon: Coffee,
      title: "Pix",
      description: "Apoie com qualquer valor via Pix",
      action: "Copiar Chave Pix",
      gradient: "from-amber-500 to-orange-500",
      key: "seu-email@exemplo.com", // Substitua pela chave Pix real
    },
    {
      icon: Heart,
      title: "GitHub Sponsors",
      description: "Torne-se um sponsor no GitHub",
      action: "Visitar GitHub",
      gradient: "from-pink-500 to-rose-500",
      link: "https://github.com/FPKZ/HTTPClient",
    },
    {
      icon: Code2,
      title: "Contribuir com Código",
      description: "Ajude no desenvolvimento do projeto",
      action: "Ver Repositório",
      gradient: "from-blue-500 to-cyan-500",
      link: "https://github.com/FPKZ/HTTPClient",
    },
  ];

  const handleDonationClick = (option) => {
    if (option.key) {
      navigator.clipboard.writeText(option.key);
      alert(`Chave Pix copiada: ${option.key}`);
    } else if (option.link) {
      window.open(option.link, "_blank");
    }
  };

  return (
    <section id="donation" className="section-container" ref={ref}>
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Apoie o Projeto</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            O HTTPClient é gratuito e open source. Seu apoio ajuda a manter o
            desenvolvimento ativo e trazer novos recursos incríveis.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {donationOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card text-center group cursor-pointer"
              onClick={() => handleDonationClick(option)}
            >
              <div
                className={`w-16 h-16 mx-auto rounded-2xl bg-linear-to-br ${option.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                {option.title}
              </h3>
              <p className="text-slate-400 mb-6 text-sm">
                {option.description}
              </p>
              <div className="btn-secondary w-full justify-center flex items-center space-x-2">
                <span>{option.action}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Why Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16 glass-effect rounded-2xl p-8 max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-display font-bold mb-6 text-center gradient-text">
          Por que apoiar?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-primary-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                Desenvolvimento Contínuo
              </h4>
              <p className="text-sm text-slate-400">
                Novos recursos e melhorias constantes
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-accent-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                Suporte Dedicado
              </h4>
              <p className="text-sm text-slate-400">
                Ajuda e correções de bugs prioritárias
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-primary-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Sempre Gratuito</h4>
              <p className="text-sm text-slate-400">
                O projeto permanecerá open source e gratuito
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-accent-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                Comunidade Forte
              </h4>
              <p className="text-sm text-slate-400">
                Construindo juntos uma ferramenta melhor
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-slate-400 mb-4">
          Tem dúvidas ou sugestões? Entre em contato!
        </p>
        <div className="flex items-center justify-center space-x-4">
          <a
            href="https://github.com/FPKZ/HTTPClient/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center space-x-2"
          >
            <Github size={20} />
            <span>Abrir Issue</span>
          </a>
          <a
            href="mailto:seu-email@exemplo.com"
            className="btn-secondary flex items-center space-x-2"
          >
            <Mail size={20} />
            <span>Email</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default Donation;
