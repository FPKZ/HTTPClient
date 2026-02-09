import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ZoomIn } from "lucide-react";

const Screenshots = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedImage, setSelectedImage] = useState(null);

  const screenshots = [
    {
      src: "src/assets/request.png",
      alt: "HTTPClient Interface Principal",
      title: "Interface Principal",
      description:
        "Interface moderna, intuitiva e ajustavel para gerenciar suas requisições",
    },
    {
      src: "src/assets/ambientes.png",
      alt: "HTTPClient Gerenciamento de ambientes",
      title: "Gerenciamento de ambientes",
      description: "Organize suas variáveis de forma eficiente",
    },
    {
      src: "src/assets/variablesGlobal.png",
      alt: "HTTPClient Gerenciamento de variáveis globais",
      title: "Gerenciamento de variáveis globais",
      description: "Mantenha informações importantes escondidas dos outros",
    },
    {
      src: "src/assets/export.png",
      alt: "HTTPClient Exportação de coleções",
      title: "Exportação de coleções",
      description: "Exporte e compartilhe suas coleções com facilidade",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="screenshots" className="section-container" ref={ref}>
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Veja em Ação</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Explore a interface moderna e intuitiva do HTTPClient
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {screenshots.map((screenshot, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl glass-effect p-4"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={screenshot.src}
                alt={screenshot.alt}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                <button
                  onClick={() => setSelectedImage(screenshot)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <ZoomIn size={20} />
                  <span>Ampliar</span>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                {screenshot.title}
              </h3>
              <p className="text-slate-400 text-sm">{screenshot.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal for enlarged image */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl w-full cursor-default"
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 btn-secondary"
            >
              Fechar
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Feature Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16 glass-effect rounded-2xl p-8 text-center"
      >
        <h3 className="text-2xl font-display font-bold mb-4 gradient-text">
          E muito mais por vir!
        </h3>
        <p className="text-slate-300 max-w-3xl mx-auto">
          O HTTPClient está em desenvolvimento ativo. Novos recursos como
          sincronização em nuvem, geração de código, testes automatizados e
          muito mais estão no roadmap.
        </p>
      </motion.div>
    </section>
  );
};

export default Screenshots;
