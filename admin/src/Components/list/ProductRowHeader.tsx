// src/components/list/ProductRowHeader.jsx
import { motion as Motion } from "framer-motion";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const ProductRowHeader = ({
  product,
  coverSrc,
  isExpanded,
  onToggleExpanded,
  editId,
  editData,
  setEditId,
  setEditData,
  salvarEdicaoBasica,
  toggleVisibility,
  removerProduto,
}) => {
  const isEditing = editId === product._id;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 py-4 text-sm sm:text-base text-gray-700 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_0.8fr_1.2fr]">
      {/* Imagem de capa */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border shadow-sm overflow-hidden bg-gray-50">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={`Imagem do produto ${product.name}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
            Sem imagem
          </div>
        )}
      </div>

      {/* Nome */}
      {isEditing ? (
        <input
          value={editData.name}
          onChange={(e) =>
            setEditData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="px-2 py-1 border rounded w-full"
        />
      ) : (
        <button
          className="truncate font-medium text-gray-900 text-left hover:underline"
          onClick={onToggleExpanded}
          title="Abrir mini-dashboard"
        >
          {product.name}
        </button>
      )}

      {/* Categoria */}
      {isEditing ? (
        <input
          value={editData.category}
          onChange={(e) =>
            setEditData((prev) => ({ ...prev, category: e.target.value }))
          }
          className="px-2 py-1 border rounded w-full"
        />
      ) : (
        <p className="text-gray-600">{product.category}</p>
      )}

      {/* Subcategoria */}
      {isEditing ? (
        <select
          value={editData.subCategory}
          onChange={(e) =>
            setEditData((prev) => ({ ...prev, subCategory: e.target.value }))
          }
          className="px-2 py-1 border rounded w-full"
        >
          <option value="Topwear">Parte Superior</option>
          <option value="Bottomwear">Parte Inferior</option>
        </select>
      ) : (
        <p className="text-gray-600">{product.subCategory}</p>
      )}

      {/* Preços */}
      {isEditing ? (
        <input
          type="number"
          value={editData.price}
          onChange={(e) =>
            setEditData((prev) => ({ ...prev, price: e.target.value }))
          }
          className="px-2 py-1 border rounded w-full"
        />
      ) : (
        <div className="text-sm leading-tight">
          <div className="text-xs text-gray-500 line-through">
            {formatCurrency(product.price)}
          </div>
          <div className="text-base font-semibold text-emerald-600">
            {formatCurrency(
              typeof product.pixPrice === "number" && product.pixPrice >= 0
                ? product.pixPrice
                : product.price
            )}
          </div>
          <div className="text-[11px] text-gray-500">
            {(product.installments?.quantity || 12)}x de{" "}
            {formatCurrency(
              typeof product.priceCard12x === "number" && product.priceCard12x >= 0
                ? product.priceCard12x
                : product.installments?.value || product.price
            )}
            {" "}no cartão
          </div>
        </div>
      )}

      {/* Visível / oculto */}
      <Motion.button
        onClick={() => toggleVisibility(product._id, !product.visible)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className={`w-5 h-5 rounded-full mx-auto transition-colors duration-200 ${
          product.visible
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gray-400 hover:bg-gray-500"
        }`}
        aria-label={
          product.visible
            ? "Produto visível no catálogo"
            : "Produto oculto no catálogo"
        }
      />

      {/* Ações */}
      <div className="flex justify-start sm:justify-end md:justify-center gap-2">
        {/* Salvar básicos / entrar em modo edição */}
        {isEditing ? (
          <Motion.button
            onClick={() => salvarEdicaoBasica(product._id)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-semibold transition"
            title="Salvar campos básicos"
          >
            ✔
          </Motion.button>
        ) : (
          <Motion.button
            onClick={() => {
              setEditId(product._id);
              setEditData({
                name: product.name,
                category: product.category,
                subCategory: product.subCategory || "Topwear",
                price: product.price,
                // novos campos para edição de Pix e 12x
                pricePix: product.pixPrice || "",
                priceCard12x: product.priceCard12x || "",
                installmentsQty:
                  product.installments?.quantity ||
                  product.installmentsQuantity ||
                  12,
              });
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition"
            title="Editar nome/categoria/preço"
          >
            ✎
          </Motion.button>
        )}

        {/* Remover produto */}
        <Motion.button
          onClick={() => {
            if (
              window.confirm(
                "Tem certeza que deseja remover este produto? Essa ação não poderá ser desfeita."
              )
            ) {
              removerProduto(product._id);
            }
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition"
          title="Remover produto"
        >
          ✕
        </Motion.button>

        {/* Abrir / Fechar mini-dashboard */}
        <Motion.button
          onClick={onToggleExpanded}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold transition"
          title="Abrir mini-dashboard"
        >
          {isExpanded ? "Fechar" : "Abrir"}
        </Motion.button>
      </div>
    </div>
  );
};

export default ProductRowHeader;
