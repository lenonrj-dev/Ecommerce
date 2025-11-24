import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import { motion as Motion } from 'framer-motion';

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const best = (products || []).filter((p) => p.bestseller);
    setBestSeller(best.slice(0, 5));
  }, [products]);

  return (
    <Motion.section
      className="w-full px-4 sm:px-6 lg:px-16 py-12 bg-white"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true }}
    >
      {/* Título */}
      <Motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title text1="MAIS" text2="VENDIDOS" />
        <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-gray-600">
          Amados pelos clientes, prontos para você!
        </p>
      </Motion.div>

      {/* Grid de Produtos */}
      <Motion.div
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        {bestSeller.map((product) => (
          <Motion.div
            key={product._id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <ProductItem product={product} />
          </Motion.div>
        ))}
      </Motion.div>
    </Motion.section>
  );
};

export default BestSeller;
