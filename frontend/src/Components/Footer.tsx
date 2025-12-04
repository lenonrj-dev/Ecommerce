import { assets } from '../assets/assets';
import { motion as Motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="mt-40 bg-gray-50 text-gray-700 px-6 sm:px-12 md:px-20 py-12">
      <Motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]"
      >
        {/* Logo e descrição */}
        <div>
          <img src={assets.logo} alt="Logo Marima" className="w-36 mb-5" />
          <p className="text-sm sm:text-base text-gray-600 max-w-md leading-relaxed">
            Compre com a <span className="font-semibold">Marima</span> e transforme sua forma de comprar online.
          </p>
        </div>

{/* Links da empresa */}
<div>
  <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Empresa</h3>
  <ul className="space-y-2 text-sm sm:text-base text-gray-600">
    {['Início', 'Sobre Nós', 'Entrega', 'Política de Privacidade'].map((item, index) => (
      <Motion.li
        key={index}
        onClick={() => {
          if (item === 'Início') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (item === 'Sobre Nós') {
            window.location.href = '/sobre';
          } else if (item === 'Entrega') {
            window.location.href = '/entrega';
          } else if (item === 'Política de Privacidade') {
            window.location.href = '/privacidade';
          }
        }}
        whileHover={{ x: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="cursor-pointer hover:text-black transition-colors"
      >
        {item}
      </Motion.li>
    ))}
  </ul>
</div>

        {/* Contato */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Suporte</h3>
          <ul className="space-y-2 text-sm sm:text-base text-gray-600">

            <li className="hover:text-black transition-colors">suporte.marima.loja@gmail.com</li>
          </ul>
        </div>
      </Motion.div>

      {/* Linha e direitos */}
      <Motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mt-10"
      >
        <hr className="border-t border-gray-300" />
        <p className="text-center text-xs sm:text-sm py-5 text-gray-500">
          © 2025 Marima — Todos os Direitos Reservados
        </p>
      </Motion.div>
    </footer>
  );
};

export default Footer;
