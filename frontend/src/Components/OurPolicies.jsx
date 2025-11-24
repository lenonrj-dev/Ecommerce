import { assets } from '../assets/assets';
import { motion as Motion } from 'framer-motion';

const policies = [
  {
    icon: assets.exchange_icon,
    title: 'Política de Troca Fácil',
    desc: 'Oferecemos uma política de troca sem complicações',
  },
  {
    icon: assets.quality_icon,
    title: 'Política de Devolução em 7 Dias',
    desc: 'Oferecemos uma política de devolução de 7 dias',
  },
  {
    icon: assets.support_img,
    title: 'Melhor Suporte ao Cliente',
    desc: 'Oferecemos suporte ao cliente 24/7',
  },
];

const OurPolicies = () => {
  return (
    <div className="px-4 sm:px-8 lg:px-20 py-16 bg-white">
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Nossas Políticas
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Segurança, qualidade e suporte em primeiro lugar.
        </p>
      </Motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-center">
        {policies.map((item, index) => (
          <Motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-gray-50 hover:bg-gray-100 transition-colors duration-300 p-6 rounded-xl shadow-sm hover:shadow-md"
          >
            <Motion.img
              src={item.icon}
              alt={item.title}
              className="w-12 h-12 mx-auto mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
              {item.title}
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm">{item.desc}</p>
          </Motion.div>
        ))}
      </div>
    </div>
  );
};

export default OurPolicies;
