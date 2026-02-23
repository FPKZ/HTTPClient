import { motion } from "framer-motion";
import { Github, Heart, Code2, Zap } from "lucide-react";
import VoltLogo from "./VoltLogo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <VoltLogo size="text-xl" />
            </div>

            <p className="text-slate-500 text-sm">
              Ferramenta desktop ultrarrápida para simplificar requisições HTTP
              e testes de API.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#hero"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Início
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Funcionalidades
                </a>
              </li>
              <li>
                <a
                  href="#screenshots"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Screenshots
                </a>
              </li>
              <li>
                <a
                  href="#donation"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Apoiar
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-white mb-4">Comunidade</h3>
            <div className="flex space-x-4">
              <motion.a
                href="https://github.com/FPKZ/HTTPClient"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Github size={20} />
              </motion.a>
              <motion.a
                href="https://github.com/FPKZ"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-lg glass-effect flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Code2 size={20} />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-slate-500 text-sm">
            © {currentYear} VOLT. Desenvolvido com{" "}
            <Heart className="inline w-4 h-4 text-primary-500" /> por{" "}
            <a
              href="https://github.com/FPKZ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
            >
              FPKZ
            </a>
          </p>

          <p className="text-slate-400 text-sm">
            Open Source • Gratuito • Sempre
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
