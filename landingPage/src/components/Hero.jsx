import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Github, ArrowRight, Users } from "lucide-react";
import { VoltIcon } from "./VoltLogo";

const Hero = () => {
  const [downloadCount, setDownloadCount] = useState(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/FPKZ/HTTPClient/releases",
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          let total = 0;
          data.forEach((release) => {
            if (release.assets && Array.isArray(release.assets)) {
              release.assets.forEach((asset) => {
                total += asset.download_count || 0;
              });
            }
          });
          setDownloadCount(total);
        }
      } catch (error) {
        console.error("Erro ao buscar contagem de downloads:", error);
      }
    };
    fetchDownloads();
  }, []);

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
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
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-primary-500/10 to-transparent rounded-full blur-3xl"
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
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-primary-600/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="section-container relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 glass-effect px-4 py-2 rounded-full mb-8 border-primary-500/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            <span className="text-sm font-medium text-primary-200">
              Nova Identidade Visual VOLT
            </span>
          </motion.div> */}

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl sm:text-7xl! lg:text-8xl font-display font-black pt-10 sm:pt-0! mb-6 text-shadow tracking-normal flex flex-col items-center overflow-visible"
          >
            <div className="flex items-center overflow-visible">
              <VoltIcon className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 mt-2 shrink-0" />
              <span className="gradient-text italic inline-block px-4">
                VOLT
              </span>
            </div>
            <span className="text-white mt-2 text-3xl sm:text-5xl! md:text-6xl! lg:text-7xl!">
              Potencialize suas APIs
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-md! sm:text-xl! text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Uma ferramenta desktop ultrarrápida para desenvolvedores que buscam
            performance e simplicidade em testes de API.
          </motion.p>

          {/* Download & Actions Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col items-center justify-center gap-6"
          >
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://github.com/FPKZ/HTTPClient/releases/download/v1.0.46/HTTPClient-1.0.46-win.exe"
                className="btn-primary flex items-center space-x-3 px-5 py-4 text-md"
              >
                <Download size={24} />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xs! uppercase font-bold opacity-70">
                    Download para
                  </span>
                  <span className="font-black">Windows</span>
                </div>
              </a>
              <a
                href="https://github.com/FPKZ/HTTPClient/releases/download/v1.0.46/HTTPClient-1.0.46-linux.AppImage"
                className="btn-secondary flex items-center space-x-3 px-5 py-4 text-md border-white/10 hover:border-primary-500/50"
              >
                <Download size={24} />
                <div className="flex flex-col items-start leading-none text-white">
                  <span className="text-xs! uppercase font-bold opacity-70">
                    Download para
                  </span>
                  <span className="font-black">Linux</span>
                </div>
              </a>
            </div>

            {downloadCount !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 bg-primary-500/10 px-4 py-2 rounded-full border border-primary-500/20"
              >
                <Users size={16} className="text-primary-400" />
                <span className="text-sm font-medium text-primary-200">
                  <span className="font-bold text-white">
                    {downloadCount.toLocaleString()}
                  </span>{" "}
                  downloads realizados
                </span>
              </motion.div>
            )}

            <a
              href="https://github.com/FPKZ/HTTPClient"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <Github size={20} />
              <span>Ver código fonte no GitHub</span>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 grid-cols-2 hidden sm:grid md:grid-cols-4 gap-8"
          >
            {[
              { label: "Versão", value: "1.0.41" },
              { label: "Plataformas", value: "Win/Linux" },
              { label: "Open Source", value: "100%" },
              { label: "Gratuito", value: "Sempre" },
            ].map((stat, index) => (
              <div key={index} className="glass-effect rounded-xl p-4">
                <div className="text-2xl font-bold gradient-text">
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
