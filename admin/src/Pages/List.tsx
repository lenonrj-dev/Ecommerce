// src/pages/List.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";

import {
  isHttp,
  isValidUrl,
  normalizeImageUrl,
  keyOf,
} from "../utils/productUtils";
import ProductRowHeader from "../components/list/ProductRowHeader";
import ProductMiniDashboard from "../components/list/ProductMiniDashboard";

const DEFAULT_INSTALLMENTS_QTY = 12;

/* ---------- Componente principal ---------- */
const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    category: "",
    subCategory: "",
    price: "",
    // novos campos para Pix e 12x
    pricePix: "",
    priceCard12x: "",
    installmentsQty: "",
  });

  // Descrição
  const [descDraft, setDescDraft] = useState({});

  // Variantes
  const [rowEdit, setRowEdit] = useState({});
  const [newVarForm, setNewVarForm] = useState({});

  // Links por tamanho
  const [linkEdits, setLinkEdits] = useState({});
  const [linkRowEdit, setLinkRowEdit] = useState({});

  // Imagens
  const [imageBoards, setImageBoards] = useState({});
  const filePickersRef = useRef({});
  const MAX_IMAGES = 4;

  const authHeaders = useMemo(() => {
    const headers = {};
    if (token) {
      headers.token = token;
      headers.Authorization = `Bearer ${token}`;
    }
    return { headers };
  }, [token]);

  const normalizeProduct = useCallback((product) => {
    const price = Number(product.price) || 0;
    const pix = Number(product.pixPrice);
    const qty = Number(product.installments?.quantity);
    const val = Number(product.installments?.value);

    const installmentsQuantity =
      Number.isFinite(qty) && qty > 0 ? qty : DEFAULT_INSTALLMENTS_QTY;
    const installmentsValue =
      Number.isFinite(val) && val >= 0
        ? val
        : installmentsQuantity > 0
        ? price / installmentsQuantity
        : price;

    return {
      ...product,
      price,
      pixPrice: Number.isFinite(pix) && pix >= 0 ? pix : price,
      installments: {
        quantity: installmentsQuantity,
        value: installmentsValue,
      },
      installmentsQuantity,
      priceCard12x: installmentsValue,
    };
  }, []);

  const buscarLista = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/product/list`,
        authHeaders
      );
      if (data?.success) {
        const products = (data.products || []).map(normalizeProduct);
        setList(products);

        const nextDesc = {};
        const nextBoards = {};
        const nextLinks = {};

        for (const p of products) {
          nextDesc[p._id] = p.description || "";

          const imgs = (p.image || [])
            .map((img) => normalizeImageUrl(img, backendUrl))
            .filter(Boolean)
            .slice(0, MAX_IMAGES);

          nextBoards[p._id] = imgs.map((src, idx) => ({
            id: `${p._id}:${idx}`,
            src,
            isNew: false,
          }));

          const rawLinks =
            p && typeof p.yampiLinks === "object" && p.yampiLinks !== null
              ? p.yampiLinks
              : {};
          nextLinks[p._id] = { ...rawLinks };
        }

        setDescDraft(nextDesc);
        setImageBoards(nextBoards);
        setLinkEdits(nextLinks);
      } else {
        toast.error(data?.message || "Falha ao carregar produtos.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao buscar produtos."
      );
    }
  };

  useEffect(() => {
    buscarLista();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Básico ---------- */
  const toNumber = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const salvarEdicaoBasica = async (id) => {
    try {
      const current = list.find((p) => p._id === id) || {};
      const requestedQty =
        editData.installmentsQty !== ""
          ? Number(editData.installmentsQty)
          : current.installmentsQuantity || current.installments?.quantity;
      const installmentsQuantity =
        Number.isFinite(requestedQty) && requestedQty > 0
          ? requestedQty
          : current.installmentsQuantity || current.installments?.quantity || DEFAULT_INSTALLMENTS_QTY;

      const safePrice = toNumber(
        editData.price !== "" ? editData.price : current.price,
        current.price || 0
      );
      const safePixPrice = toNumber(
        editData.pricePix !== "" ? editData.pricePix : current.pixPrice,
        current.pixPrice || safePrice
      );
      const safeCardValue = toNumber(
        editData.priceCard12x !== "" ? editData.priceCard12x : current.priceCard12x,
        installmentsQuantity > 0 ? safePrice / installmentsQuantity : safePrice
      );

      const payload = {
        name: editData.name || current.name,
        category: editData.category || current.category,
        subCategory: editData.subCategory || current.subCategory,
        price: safePrice,
        pixPrice: safePixPrice,
        installmentsQuantity,
        installmentsValue: safeCardValue,
      };

      const { data } = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        payload,
        authHeaders
      );
      if (data?.success) {
        toast.success("Produto atualizado!");
        setEditId(null);
        buscarLista();
      } else {
        toast.error(data?.message || "Não foi possível atualizar.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao atualizar produto."
      );
    }
  };

  const toggleVisibility = async (id, visible) => {
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/product/toggle-visibility`,
        { id, visible },
        authHeaders
      );
      if (data?.success) {
        buscarLista();
      } else {
        toast.error(
          data?.message || "Não foi possível alterar visibilidade."
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao alterar visibilidade."
      );
    }
  };

  const removerProduto = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        authHeaders
      );
      if (data?.success) {
        toast.success(data?.message || "Produto removido!");
        buscarLista();
      } else {
        toast.error(data?.message || "Não foi possível remover.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao remover produto."
      );
    }
  };

  /* ---------- Descrição ---------- */
  const salvarDescricao = async (id) => {
    const description = descDraft[id] ?? "";
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        { description },
        authHeaders
      );
      if (data?.success) {
        toast.success("Descrição salva!");
        buscarLista();
      } else {
        toast.error(
          data?.message || "Não foi possível salvar a descrição."
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao salvar descrição."
      );
    }
  };

  /* ---------- Links (Yampi) ---------- */
  const handleLinkChange = (productId, size, url) => {
    setLinkEdits((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [size]: url },
    }));
  };

  const salvarLinks = async (productId) => {
    try {
      const raw = linkEdits[productId] || {};
      const cleaned = {};

      for (const s of Object.keys(raw)) {
        const url = String(raw[s] || "").trim();
        if (url) {
          if (!isValidUrl(url)) {
            toast.error(`URL inválida para o tamanho ${s}.`);
            return;
          }
          cleaned[s] = url;
        }
      }

      const { data } = await axios.put(
        `${backendUrl}/api/product/update/${productId}`,
        { yampiLinks: cleaned },
        authHeaders
      );

      if (data?.success) {
        setLinkEdits((prev) => ({ ...prev, [productId]: cleaned }));
        toast.success("Links salvos!");
      } else {
        toast.error(data?.message || "Não foi possível salvar os links.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao salvar links.");
    }
  };

  const startLinkRowEdit = (pid, size) => {
    const key = keyOf(pid, size);
    const current = (linkEdits[pid] || {})[size] || "";
    setLinkRowEdit((prev) => ({ ...prev, [key]: current }));
  };

  const cancelLinkRowEdit = (pid, size) => {
    const key = keyOf(pid, size);
    setLinkRowEdit((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  const saveLinkRowEdit = async (pid, size) => {
    const key = keyOf(pid, size);
    const url = String(linkRowEdit[key] || "").trim();

    if (url && !isValidUrl(url)) {
      toast.error(`URL inválida para o tamanho ${size}.`);
      return;
    }

    const current = linkEdits[pid] || {};
    const next = { ...current };
    if (url) next[size] = url;
    else delete next[size];

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/product/update/${pid}`,
        { yampiLinks: next },
        authHeaders
      );
      if (data?.success) {
        setLinkEdits((prev) => ({ ...prev, [pid]: next }));
        cancelLinkRowEdit(pid, size);
        toast.success("Link salvo!");
      } else {
        toast.error(data?.message || "Falha ao salvar link.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao salvar link.");
    }
  };

  /* ---------- Variantes (size/SKU/ativo) ---------- */
  const startRowEdit = (productId, v) => {
    setRowEdit((prev) => ({
      ...prev,
      [keyOf(productId, v.size)]: {
        size: v.size,
        sku: v.sku || "",
        isActive: !!v.isActive,
      },
    }));
  };

  const cancelRowEdit = (productId, size) => {
    setRowEdit((prev) => {
      const next = { ...prev };
      delete next[keyOf(productId, size)];
      return next;
    });
  };

  const handleRowEditChange = (productId, size, field, value) => {
    const k = keyOf(productId, size);
    setRowEdit((prev) => ({
      ...prev,
      [k]: { ...(prev[k] || {}), [field]: value },
    }));
  };

  const saveRowEdit = async (productId, originalSize) => {
    const k = keyOf(productId, originalSize);
    const dataRow = rowEdit[k];
    if (!dataRow) return;

    const payload = {
      originalSize,
      size: (dataRow.size || "").trim(),
      sku: (dataRow.sku || "").trim(),
      isActive: !!dataRow.isActive,
    };

    if (!payload.size) {
      toast.error("O tamanho não pode ficar vazio.");
      return;
    }

    try {
      await axios.put(
        `${backendUrl}/api/product/${productId}/variant/upsert`,
        payload,
        authHeaders
      );
      toast.success("Tamanho/SKU atualizado!");
      cancelRowEdit(productId, originalSize);
      buscarLista();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao atualizar tamanho."
      );
    }
  };

  const toggleVariantActive = async (productId, size, isActive) => {
    try {
      await axios.patch(
        `${backendUrl}/api/product/${productId}/variant/toggle`,
        { size, isActive },
        authHeaders
      );
      buscarLista();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Erro ao alterar disponibilidade do tamanho."
      );
    }
  };

  const createVariant = async (productId) => {
    const form = newVarForm[productId] || {};
    const size = (form.size || "").trim();
    const sku = (form.sku || "").trim();
    const isActive = !!form.isActive;

    if (!size) return toast.error("Informe o tamanho (ex.: P, M, G).");

    try {
      await axios.put(
        `${backendUrl}/api/product/${productId}/variant/upsert`,
        { size, sku, isActive },
        authHeaders
      );
      toast.success("Tamanho adicionado/atualizado!");
      setNewVarForm((prev) => ({
        ...prev,
        [productId]: { size: "", sku: "", isActive: true },
      }));
      buscarLista();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao salvar tamanho."
      );
    }
  };

  const deleteVariant = async (productId, size) => {
    if (!window.confirm(`Remover o tamanho "${size}" deste produto?`)) return;
    try {
      await axios.delete(`${backendUrl}/api/product/${productId}/variant`, {
        data: { size },
        ...authHeaders,
      });
      toast.success("Tamanho removido!");
      buscarLista();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao remover tamanho."
      );
    }
  };

  /* ---------- Imagens ---------- */
  const openFilePicker = (pid) => {
    if (!filePickersRef.current[pid]) return;
    filePickersRef.current[pid].click();
  };

  const revokePreview = (url) => {
    try {
      if (url) URL.revokeObjectURL(url);
    } catch {
      /* noop */
    }
  };

  const persistImages = async (pid, board) => {
    try {
      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const filesBoard = board || imageBoards[pid] || [];
      if (!filesBoard.length) {
        const fd = new FormData();
        fd.append("keepImages", JSON.stringify([]));
        const { data } = await axios.put(
          `${backendUrl}/api/product/update/${pid}`,
          fd,
          {
            headers: { token, "Content-Type": "multipart/form-data" },
          }
        );
        if (data?.success) {
          toast.success("Imagens atualizadas!");
          cleanupPreviews(filesBoard);
          buscarLista();
        } else {
          toast.error(data?.message || "Falha ao atualizar imagens.");
        }
        return;
      }

      const keepImages = [];
      const newFiles = [];
      for (const item of filesBoard) {
        if (item.isNew && item.file) newFiles.push(item.file);
        else if (item.src && isHttp(item.src)) keepImages.push(item.src);
      }

      const fd = new FormData();
      fd.append("keepImages", JSON.stringify(keepImages));
      newFiles.forEach((file, idx) => {
        fd.append(`image${idx + 1}`, file);
      });

      const { data } = await axios.put(
        `${backendUrl}/api/product/update/${pid}`,
        fd,
        {
          headers: { token, "Content-Type": "multipart/form-data" },
        }
      );

      if (data?.success) {
        toast.success("Imagens atualizadas!");
        cleanupPreviews(filesBoard);
        buscarLista();
      } else {
        toast.error(data?.message || "Falha ao atualizar imagens.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao atualizar imagens."
      );
    }
  };

  const cleanupPreviews = (board = []) => {
    board.forEach((item) => revokePreview(item.preview));
  };

  const handleAddImages = (pid, files) => {
    if (!files?.length) return;
    setImageBoards((prev) => {
      const current = prev[pid] || [];
      const remainingSlots = MAX_IMAGES - current.length;
      const selected = Array.from(files).slice(
        0,
        Math.max(0, remainingSlots)
      );
      const toAdd = selected.map((file, idx) => ({
        id: `${pid}:new:${Date.now()}:${idx}`,
        file,
        isNew: true,
        preview: URL.createObjectURL(file),
      }));
      const nextBoard = [...current, ...toAdd];
      // dispara upload imediato para Cloudinary (mesma lógica do Add)
      persistImages(pid, nextBoard);
      return { ...prev, [pid]: nextBoard };
    });
  };

  const removeImage = (pid, id) => {
    setImageBoards((prev) => {
      const next = (prev[pid] || []).filter((img) => {
        const keep = img.id !== id;
        if (!keep) revokePreview(img.preview);
        return keep;
      });
      return { ...prev, [pid]: next };
    });
  };

  const moveToFirst = (pid, id) => {
    setImageBoards((prev) => {
      const arr = [...(prev[pid] || [])];
      const idx = arr.findIndex((i) => i.id === id);
      if (idx > -1) {
        const [item] = arr.splice(idx, 1);
        arr.unshift(item);
      }
      return { ...prev, [pid]: arr };
    });
  };

  const moveToLast = (pid, id) => {
    setImageBoards((prev) => {
      const arr = [...(prev[pid] || [])];
      const idx = arr.findIndex((i) => i.id === id);
      if (idx > -1) {
        const [item] = arr.splice(idx, 1);
        arr.push(item);
      }
      return { ...prev, [pid]: arr };
    });
  };

  const onReorder = (pid, newOrder) => {
    setImageBoards((prev) => ({ ...prev, [pid]: newOrder }));
  };

  const salvarImagens = async (pid) => {
    const board = imageBoards[pid] || [];
    await persistImages(pid, board);
  };

  /* ---------- UI ---------- */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, ease: "easeOut" },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <section
      className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto"
      aria-labelledby="product-list-title"
    >
      <Motion.h1
        id="product-list-title"
        className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Catálogo • Mini-Dashboard por Produto
      </Motion.h1>

      <p className="text-gray-600 mb-6">
        Gerencie{" "}
        <strong>conteúdo, imagens, descrição, tamanhos, links e preços</strong>{" "}
        de cada produto — tudo em um só lugar.
      </p>

      <Motion.div
        className="flex flex-col gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Cabeçalho da lista */}
        <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_0.8fr_1.2fr] items-center py-3 px-4 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Imagem</span>
          <span>Nome</span>
          <span>Categoria</span>
          <span>Subcategoria</span>
          <span>Preço</span>
          <span>Visível</span>
          <span className="text-center">Ações</span>
        </div>

        {list.map((product) => {
          const isExpanded = !!expanded[product._id];
          const coverSrc = normalizeImageUrl(
            product.image?.[0],
            backendUrl
          );

          const onToggleExpanded = () =>
            setExpanded((prev) => ({
              ...prev,
              [product._id]: !isExpanded,
            }));

          return (
            <Motion.div
              key={product._id}
              variants={itemVariants}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* Linha compacta (header) */}
              <ProductRowHeader
                product={product}
                coverSrc={coverSrc}
                isExpanded={isExpanded}
                onToggleExpanded={onToggleExpanded}
                editId={editId}
                editData={editData}
                setEditId={setEditId}
                setEditData={setEditData}
                salvarEdicaoBasica={salvarEdicaoBasica}
                toggleVisibility={toggleVisibility}
                removerProduto={removerProduto}
              />

              {/* Mini-dashboard (detalhes do produto) */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <ProductMiniDashboard
                    product={product}
                    editId={editId}
                    editData={editData}
                    setEditId={setEditId}
                    setEditData={setEditData}
                    salvarEdicaoBasica={salvarEdicaoBasica}
                    descDraft={descDraft}
                    setDescDraft={setDescDraft}
                    salvarDescricao={salvarDescricao}
                    imageBoards={imageBoards}
                    filePickersRef={filePickersRef}
                    MAX_IMAGES={MAX_IMAGES}
                    handleAddImages={handleAddImages}
                    openFilePicker={openFilePicker}
                    salvarImagens={salvarImagens}
                    moveToFirst={moveToFirst}
                    moveToLast={moveToLast}
                    removeImage={removeImage}
                  onReorder={onReorder}
                  rowEdit={rowEdit}
                  startRowEdit={startRowEdit}
                  cancelRowEdit={cancelRowEdit}
                  handleRowEditChange={handleRowEditChange}
                  saveRowEdit={saveRowEdit}
                  toggleVariantActive={toggleVariantActive}
                  newVarForm={newVarForm}
                  setNewVarForm={setNewVarForm}
                  createVariant={createVariant}
                  deleteVariant={deleteVariant}
                  linkEdits={linkEdits}
                  linkRowEdit={linkRowEdit}
                  setLinkRowEdit={setLinkRowEdit}
                  handleLinkChange={handleLinkChange}
                  startLinkRowEdit={startLinkRowEdit}
                    cancelLinkRowEdit={cancelLinkRowEdit}
                    saveLinkRowEdit={saveLinkRowEdit}
                    salvarLinks={salvarLinks}
                  />
                )}
              </AnimatePresence>
            </Motion.div>
          );
        })}
      </Motion.div>
    </section>
  );
};

export default List;
