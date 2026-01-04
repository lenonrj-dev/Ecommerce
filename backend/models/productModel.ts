// models/productModel.js
import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true }, // ex.: P, M, G
    sku: { type: String, default: "", trim: true },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const InstallmentSchema = new mongoose.Schema(
  {
    quantity: { type: Number, default: 1, min: 1 }, // ex.: 10x
    value: { type: Number, default: 0, min: 0 }, // valor de cada parcela
  },
  { _id: false }
);

const MeasurementSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    value: { type: String, trim: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    description: { type: String, default: "" },

    // preço cheio do produto
    price: { type: Number, required: true, min: 0 },

    // preço com desconto à vista (ex.: PIX)
    pixPrice: { type: Number, default: 0, min: 0 },

    // informações de parcelamento exibidas no front
    installments: { type: InstallmentSchema, default: () => ({}) },

    // campos de categorização
    category: { type: String, default: "", trim: true },
    subCategory: { type: String, default: "", trim: true },

    // tamanhos "lógicos" do produto (P/M/G etc.)
    sizes: { type: [String], default: ["P", "M", "G"] },

    // variantes controladas no painel (estoque, sku, ativo)
    variants: { type: [VariantSchema], default: [] },

    // imagens
    image: { type: [String], default: [] },

    // destaque
    bestseller: { type: Boolean, default: false },

    // pagamento Yampi (legado - 1 link p/ todos)
    yampiLink: { type: String, default: "" },

    // NOVO: links por tamanho (ex.: { P: "https://...", M: "..." })
    yampiLinks: {
      type: Map,
      of: String,
      default: {},
    },

    // avaliações agregadas
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },

    // visibilidade de catálogo
    visible: { type: Boolean, default: true },

    // infos adicionais de PDP
    measurements: { type: [MeasurementSchema], default: [] },
    availabilityNote: { type: String, default: "" },
    combineWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // soft delete opcional
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ProductSchema.index({ slug: 1 }, { unique: true, sparse: true });

export default mongoose.model("Product", ProductSchema);
