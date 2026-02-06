import { motion } from "framer-motion";
import { Menu, X, Github } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Início", href: "#hero" },
    { label: "Funcionalidades", href: "#features" },
    { label: "Screenshots", href: "#screenshots" },
    { label: "Apoiar", href: "#donation" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <img src="/icon.png" alt="HTTPClient" className="h-10 w-10" />
            <span className="text-xl font-display font-bold gradient-text">
              HTTPClient
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {item.label}
              </motion.a>
            ))}
            <motion.a
              href="https://github.com/FPKZ/HTTPClient"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 btn-secondary"
            >
              <Github size={20} />
              <span>GitHub</span>
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 space-y-3"
          >
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-slate-300 hover:text-white transition-colors duration-200 py-2"
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://github.com/FPKZ/HTTPClient"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 btn-secondary w-full justify-center"
            >
              <Github size={20} />
              <span>GitHub</span>
            </a>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
