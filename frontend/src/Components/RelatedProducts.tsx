import { ShopContext } from '../Context/ShopContext';
import { useContext, useEffect, useMemo, useState } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import { motion as Motion } from 'framer-motion';

const KEYWORDS = [
  { type: "SHORT", words: ["short"] },
  { type: "CALCA", words: ["calca", "calça", "pants"] },
  { type: "LEGGING", words: ["legging"] },
  { type: "MACACAO", words: ["macacao", "macacão", "jumpsuit"] },
  { type: "TOP", words: ["top", "cropped", "croped"] },
  { type: "BODY", words: ["body"] },
];

const normalize = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const detectType = (name = "") => {
  const norm = normalize(name);
  for (const entry of KEYWORDS) {
    if (entry.words.some((word) => norm.includes(word))) {
      return entry.type;
    }
  }
  return null;
};

const RelatedProducts = ({ category, subCategory, currentProductId, currentName }) => {
  const { products } = useContext(ShopContext);
  const [relatedProd, setRelatedProd] = useState([]);
  const targetType = useMemo(() => detectType(currentName), [currentName]);

  useEffect(() => {
    if (!products.length) return;

    let filtered = [];
    if (targetType) {
      filtered = products.filter(
        (product) =>
          detectType(product.name) === targetType &&
          product._id !== currentProductId
      );
    }

    if (!filtered.length) {
      filtered = products.filter(
        (product) =>
          product.category === category &&
          product.subCategory === subCategory &&
          product._id !== currentProductId
      );
    }

    if (!filtered.length) {
      filtered = products.filter((product) => product._id !== currentProductId);
    }

    setRelatedProd(filtered.slice(0, 5));
  }, [products, category, subCategory, currentProductId, targetType]);

  return (
    <div className="my-20 px-4 sm:px-8 lg:px-20">
      {/* Título */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <Title text1="PRODUTOS" text2="RELACIONADOS" />
      </Motion.div>

      {/* Grid de produtos */}
      <Motion.div
        initial="hidden"
        whileInView="visible"
        transition={{ staggerChildren: 0.1 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {relatedProd.map((item) => (
          <Motion.div
            key={item._id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4 }}
          >
            <ProductItem product={item} className="w-full" />
          </Motion.div>
        ))}
      </Motion.div>
    </div>
  );
};

export default RelatedProducts;
