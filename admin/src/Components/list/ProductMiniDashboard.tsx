// src/components/list/ProductMiniDashboard.jsx
import { motion as Motion, Reorder } from "framer-motion";
import { SectionTitle, FieldLabel, Pill } from "./ListCommon";
import { isValidUrl, shortUrl, keyOf } from "../../utils/productUtils";
import { assets } from "../../assets/assets";

const ProductMiniDashboard = ({
  product,
  editId,
  editData,
  setEditId,
  setEditData,
  salvarEdicaoBasica,
  descDraft,
  setDescDraft,
  salvarDescricao,

  // Imagens
  imageBoards,
  filePickersRef,
  MAX_IMAGES,
  handleAddImages,
  openFilePicker,
  salvarImagens,
  moveToFirst,
  moveToLast,
  removeImage,
  onReorder,

  // Variantes
  rowEdit,
  startRowEdit,
  cancelRowEdit,
  handleRowEditChange,
  saveRowEdit,
  toggleVariantActive,
  newVarForm,
  setNewVarForm,
  createVariant,
  deleteVariant,

  // Links
  linkEdits,
  linkRowEdit,
  setLinkRowEdit,
  handleLinkChange,
  startLinkRowEdit,
  cancelLinkRowEdit,
  saveLinkRowEdit,
  salvarLinks,
}) => {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const board = imageBoards[product._id] || [];
  const linksDraft = linkEdits[product._id] || {};
  const validLinksCount = Object.values(linksDraft).filter(isValidUrl).length;
  const installmentsQty =
    (product.installments && product.installments.quantity) || 12;
  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="px-4 pb-6"
    >
      <div className="grid lg:grid-cols-12 gap-6">
        {/* COL A: Básico + Descrição */}
        <div className="lg:col-span-5 space-y-6">
          {/* Conteúdo básico */}
          <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
            <SectionTitle>Conteúdo Básico</SectionTitle>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nome */}
              <div>
                <FieldLabel htmlFor={`nm-${product._id}`}>Nome</FieldLabel>
                <input
                  id={`nm-${product._id}`}
                  className="w-full px-3 py-2 border rounded"
                  value={
                    editId === product._id ? editData.name : product.name
                  }
                  onChange={(e) =>
                    editId === product._id
                      ? setEditData((d) => ({
                          ...d,
                          name: e.target.value,
                        }))
                      : setEditId(product._id) ||
                        setEditData({
                          name: e.target.value,
                          category: product.category,
                          subCategory: product.subCategory || "Topwear",
                          price: product.price,
                          pricePix: product.pixPrice || "",
                          priceCard12x: product.priceCard12x || "",
                        })
                  }
                />
              </div>

              {/* Categoria */}
              <div>
                <FieldLabel htmlFor={`ct-${product._id}`}>
                  Categoria
                </FieldLabel>
                <input
                  id={`ct-${product._id}`}
                  className="w-full px-3 py-2 border rounded"
                  value={
                    editId === product._id
                      ? editData.category
                      : product.category
                  }
                  onChange={(e) =>
                    editId === product._id
                      ? setEditData((d) => ({
                          ...d,
                          category: e.target.value,
                        }))
                      : setEditId(product._id) ||
                        setEditData({
                          name: product.name,
                          category: e.target.value,
                          subCategory: product.subCategory || "Topwear",
                          price: product.price,
                          pricePix: product.pixPrice || "",
                          priceCard12x: product.priceCard12x || "",
                        })
                  }
                />
              </div>

              {/* Subcategoria */}
              <div>
                <FieldLabel htmlFor={`sct-${product._id}`}>
                  Subcategoria
                </FieldLabel>
                <select
                  id={`sct-${product._id}`}
                  className="w-full px-3 py-2 border rounded"
                  value={
                    editId === product._id
                      ? editData.subCategory
                      : product.subCategory || "Topwear"
                  }
                  onChange={(e) =>
                    editId === product._id
                      ? setEditData((d) => ({
                          ...d,
                          subCategory: e.target.value,
                        }))
                      : setEditId(product._id) ||
                        setEditData({
                          name: product.name,
                          category: product.category,
                          subCategory: e.target.value,
                          price: product.price,
                          pricePix: product.pixPrice || "",
                          priceCard12x: product.priceCard12x || "",
                        })
                  }
                >
                  <option value="Topwear">Parte Superior</option>
                  <option value="Bottomwear">Parte Inferior</option>
                </select>
              </div>

              {/* Preço principal */}
              <div>
                <FieldLabel htmlFor={`pr-${product._id}`}>Preço</FieldLabel>
                <input
                  id={`pr-${product._id}`}
                  type="number"
                  className="w-full px-3 py-2 border rounded"
                  value={
                    editId === product._id
                      ? editData.price
                      : product.price
                  }
                  onChange={(e) =>
                    editId === product._id
                      ? setEditData((d) => ({
                          ...d,
                          price: e.target.value,
                        }))
                      : setEditId(product._id) ||
                        setEditData({
                          name: product.name,
                          category: product.category,
                          subCategory: product.subCategory || "Topwear",
                          price: e.target.value,
                          pricePix: product.pixPrice || "",
                          priceCard12x: product.priceCard12x || "",
                          installmentsQty: product.installments?.quantity || installmentsQty,
                        })
                  }
                />
              </div>

              {/* Preço Pix (novo campo) */}
              <div>
                <FieldLabel htmlFor={`prpix-${product._id}`}>
                  Preço Pix (à vista)
                </FieldLabel>
                <input
                  id={`prpix-${product._id}`}
                  type="number"
                  className="w-full px-3 py-2 border rounded"
                  value={
                    editId === product._id
                      ? editData.pricePix
                      : product.pixPrice || ""
                  }
                  onChange={(e) =>
                    editId === product._id
                      ? setEditData((d) => ({
                          ...d,
                          pricePix: e.target.value,
                        }))
                      : setEditId(product._id) ||
                        setEditData({
                          name: product.name,
                          category: product.category,
                          subCategory: product.subCategory || "Topwear",
                          price: product.price,
                          pricePix: e.target.value,
                          priceCard12x: product.priceCard12x || "",
                          installmentsQty: product.installments?.quantity || installmentsQty,
                        })
                  }
                  placeholder="Valor à vista no Pix"
                />
              </div>

              {/* Número de parcelas */}
              <div>
                <FieldLabel htmlFor={`prqty-${product._id}`}>
                  Quantidade de parcelas
                </FieldLabel>
                <input
                  id={`prqty-${product._id}`}
                  type="number"
                  className="w-full px-3 py-2 border rounded"
                  value={
                    editId === product._id
                      ? editData.installmentsQty
                      : installmentsQty
                  }
                  min={1}
                  onChange={(e) =>
                    editId === product._id
                      ? setEditData((d) => ({
                          ...d,
                          installmentsQty: e.target.value,
                        }))
                      : setEditId(product._id) ||
                        setEditData({
                          name: product.name,
                          category: product.category,
                          subCategory: product.subCategory || "Topwear",
                          price: product.price,
                          pricePix: product.pixPrice || "",
                          priceCard12x: product.priceCard12x || "",
                          installmentsQty: e.target.value,
                        })
                  }
                  placeholder="Ex: 12"
                />
              </div>

              {/* Preço no cartão */}
              <div>
                <FieldLabel htmlFor={`pr12-${product._id}`}>
                  Valor por parcela no cartão ({installmentsQty}x)
                </FieldLabel>
                <input
                  id={`pr12-${product._id}`}
                  type="number"
                  className="w-full px-3 py-2 border rounded"
                  value={
                    editId === product._id
                      ? editData.priceCard12x
                      : product.priceCard12x || ""
                  }
                  onChange={(e) =>
                    editId === product._id
                      ? setEditData((d) => ({
                          ...d,
                          priceCard12x: e.target.value,
                        }))
                      : setEditId(product._id) ||
                        setEditData({
                          name: product.name,
                          category: product.category,
                          subCategory: product.subCategory || "Topwear",
                          price: product.price,
                          pricePix: product.pixPrice || "",
                          priceCard12x: e.target.value,
                          installmentsQty: product.installments?.quantity || installmentsQty,
                        })
                  }
                  placeholder={`Valor da parcela em ${installmentsQty}x`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Esse valor define o texto "{installmentsQty}x de{" "}
                  {formatCurrency(product.priceCard12x || 0)}" no site.
                </p>
              </div>

              {/* Botão salvar básicos */}
              <div className="flex items-end">
                <button
                  onClick={() => salvarEdicaoBasica(product._id)}
                  className="w-full sm:w-auto mt-1 px-4 py-2 rounded bg-black text-white hover:opacity-90"
                >
                  Salvar básicos
                </button>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
            <SectionTitle>Descrição</SectionTitle>
            <textarea
              className="mt-3 w-full min-h-28 px-3 py-2 border rounded resize-y"
              value={descDraft[product._id] ?? ""}
              onChange={(e) =>
                setDescDraft((prev) => ({
                  ...prev,
                  [product._id]: e.target.value,
                }))
              }
              placeholder="Texto de descrição do produto…"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Dica: descreva tecido, elasticidade, caimento e uso.
              </span>
              <button
                onClick={() => salvarDescricao(product._id)}
                className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
              >
                Salvar descrição
              </button>
            </div>
          </div>
        </div>

        {/* COL B: Imagens + Tabelas */}
        <div className="lg:col-span-7 space-y-6">
          {/* Imagens */}
          <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <SectionTitle>Imagens (ordem define a principal)</SectionTitle>
              <div className="flex items-center gap-2">
                <Pill active>
                  {board.length}/{MAX_IMAGES}
                </Pill>
                <input
                  ref={(el) => (filePickersRef.current[product._id] = el)}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    handleAddImages(product._id, e.target.files);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => openFilePicker(product._id)}
                  className="px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 text-sm"
                  disabled={board.length >= MAX_IMAGES}
                  title={
                    board.length >= MAX_IMAGES
                      ? "Limite de imagens atingido"
                      : "Adicionar imagens"
                  }
                >
                  + Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => salvarImagens(product._id)}
                  className="px-3 py-1.5 rounded-md bg-black text-white hover:opacity-90 text-sm"
                >
                  Salvar imagens
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Arraste para reordenar. Use as ações para definir{" "}
              <strong>primeira</strong> ou <strong>última</strong>, ou remover.
            </p>

            <Reorder.Group
              axis="x"
              values={board}
              onReorder={(vals) =>
                onReorder(product._id, vals.slice(0, MAX_IMAGES))
              }
              className="mt-4 flex gap-3 overflow-x-auto pb-2"
            >
              {board.map((item, idx) => (
                <Reorder.Item key={item.id} value={item}>
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border shadow-sm bg-gray-50">
                    <img
                      src={item.preview || item.src || URL.createObjectURL(item.file)}
                      alt={`Imagem ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = assets.upload_area;
                      }}
                    />

                    <div className="absolute top-1 left-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          idx === 0
                            ? "bg-emerald-600 text-white"
                            : "bg-white/90 text-gray-700 border"
                        }`}
                      >
                        {idx === 0 ? "PRINCIPAL" : `#${idx + 1}`}
                      </span>
                    </div>

                    <div className="absolute bottom-1 inset-x-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          moveToFirst(product._id, item.id)
                        }
                        className="flex-1 text-[11px] px-2 py-1 rounded bg-white/95 hover:bg-white border"
                        title="Definir como primeira"
                      >
                        1ª
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          moveToLast(product._id, item.id)
                        }
                        className="flex-1 text-[11px] px-2 py-1 rounded bg-white/95 hover:bg-white border"
                        title="Mover para última"
                      >
                        Últ.
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          removeImage(product._id, item.id)
                        }
                        className="flex-1 text-[11px] px-2 py-1 rounded bg-red-50 hover:bg-red-100 border text-red-700"
                        title="Remover"
                      >
                        Rem.
                      </button>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Tamanhos / SKU / Link (inline) */}
          <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <SectionTitle>Tamanhos, SKU & Link</SectionTitle>
              <span className="text-xs text-gray-500">
                Ative/desative, edite SKU e o link do tamanho
              </span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-2 py-2">Tamanho</th>
                    <th className="text-left px-2 py-2">SKU</th>
                    <th className="text-left px-2 py-2">Link (Yampi)</th>
                    <th className="text-center px-2 py-2">Ativo</th>
                    <th className="text-center px-2 py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-2 py-4 text-center text-gray-500"
                      >
                        Nenhum tamanho cadastrado ainda.
                      </td>
                    </tr>
                  )}

                  {variants.map((v) => {
                    const k = keyOf(product._id, v.size);
                    const isRowEditing = !!rowEdit[k];
                    const lkKey = keyOf(product._id, v.size);
                    const isLinkEditing =
                      typeof linkRowEdit[lkKey] !== "undefined";
                    const savedLink = (linksDraft || {})[v.size] || "";

                    return (
                      <tr
                        key={k}
                        className="border-b last:border-b-0"
                      >
                        {/* Tamanho */}
                        <td className="px-2 py-2">
                          {isRowEditing ? (
                            <input
                              className="px-2 py-1 border rounded w-24"
                              value={rowEdit[k].size}
                              onChange={(e) =>
                                handleRowEditChange(
                                  product._id,
                                  v.size,
                                  "size",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="font-medium text-gray-900">
                              {v.size}
                            </span>
                          )}
                        </td>

                        {/* SKU */}
                        <td className="px-2 py-2">
                          {isRowEditing ? (
                            <input
                              className="px-2 py-1 border rounded w-36"
                              placeholder="SKU (opcional)"
                              value={rowEdit[k].sku}
                              onChange={(e) =>
                                handleRowEditChange(
                                  product._id,
                                  v.size,
                                  "sku",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-gray-700">
                              {v.sku || "—"}
                            </span>
                          )}
                        </td>

                        {/* Link (inline) */}
                        <td className="px-2 py-2">
                          {isLinkEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                className="px-2 py-1 border rounded w-full min-w-60"
                                placeholder={`https://… link do ${v.size}`}
                                value={linkRowEdit[lkKey] || ""}
                                onChange={(e) =>
                                  setLinkRowEdit((prev) => ({
                                    ...prev,
                                    [lkKey]: e.target.value,
                                  }))
                                }
                              />
                              <button
                                onClick={() =>
                                  saveLinkRowEdit(product._id, v.size)
                                }
                                className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() =>
                                  cancelLinkRowEdit(product._id, v.size)
                                }
                                className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : savedLink ? (
                            <div className="flex items-center gap-2">
                              <a
                                className="text-blue-600 hover:underline break-all"
                                href={savedLink}
                                target="_blank"
                                rel="noreferrer"
                                title={savedLink}
                              >
                                {shortUrl(savedLink)}
                              </a>
                              <button
                                onClick={() =>
                                  startLinkRowEdit(product._id, v.size)
                                }
                                className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold"
                              >
                                ✎
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                startLinkRowEdit(product._id, v.size)
                              }
                              className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold"
                            >
                              + adicionar link
                            </button>
                          )}
                        </td>

                        {/* Ativo */}
                        <td className="px-2 py-2 text-center">
                          <button
                            onClick={() =>
                              toggleVariantActive(
                                product._id,
                                v.size,
                                !v.isActive
                              )
                            }
                            className={`inline-block w-5 h-5 rounded-full transition-colors ${
                              v.isActive
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-400 hover:bg-gray-500"
                            }`}
                            aria-label={
                              v.isActive ? "Tamanho ativo" : "Tamanho inativo"
                            }
                          />
                        </td>

                        {/* Ações tamanho/SKU */}
                        <td className="px-2 py-2 text-center">
                          {isRowEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  saveRowEdit(product._id, v.size)
                                }
                                className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() =>
                                  cancelRowEdit(product._id, v.size)
                                }
                                className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  startRowEdit(product._id, v)
                                }
                                className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold"
                              >
                                ✎
                              </button>
                              <button
                                onClick={() =>
                                  deleteVariant(product._id, v.size)
                                }
                                className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold"
                              >
                                Remover
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Nova variante */}
                  <tr className="bg-gray-50">
                    <td className="px-2 py-3">
                      <input
                        className="px-2 py-1 border rounded w-24"
                        placeholder="Tamanho (P/M/G)"
                        value={newVarForm[product._id]?.size || ""}
                        onChange={(e) =>
                          setNewVarForm((prev) => ({
                            ...prev,
                            [product._id]: {
                              ...(prev[product._id] || {}),
                              size: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input
                        className="px-2 py-1 border rounded w-36"
                        placeholder="SKU (opcional)"
                        value={newVarForm[product._id]?.sku || ""}
                        onChange={(e) =>
                          setNewVarForm((prev) => ({
                            ...prev,
                            [product._id]: {
                              ...(prev[product._id] || {}),
                              sku: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                    <td className="px-2 py-3 text-gray-400 text-sm">
                      (defina o link depois)
                    </td>
                    <td className="px-2 py-3 text-center">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            !!(newVarForm[product._id]?.isActive ?? true)
                          }
                          onChange={(e) =>
                            setNewVarForm((prev) => ({
                              ...prev,
                              [product._id]: {
                                ...(prev[product._id] || {}),
                                isActive: e.target.checked,
                              },
                            }))
                          }
                        />
                        <span className="text-xs text-gray-700">Ativo</span>
                      </label>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => createVariant(product._id)}
                        className="px-3 py-2 rounded bg-black text-white hover:opacity-90"
                      >
                        Adicionar tamanho
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Links (edição em massa) */}
          <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <SectionTitle>Links de compra por tamanho (Yampi)</SectionTitle>
              <Pill active>
                {validLinksCount}/{sizes.length}
              </Pill>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-2 py-2">Tamanho</th>
                    <th className="text-left px-2 py-2">Link</th>
                    <th className="text-center px-2 py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((s) => {
                    const val = linksDraft[s] || "";
                    const ok = !val || isValidUrl(val);
                    return (
                      <tr
                        key={`${product._id}-${s}`}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-2 py-2 font-medium text-gray-900">
                          {s}
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="url"
                            placeholder={`https://… link do ${s}`}
                            value={val}
                            onChange={(e) =>
                              handleLinkChange(product._id, s, e.target.value)
                            }
                            className={`w-full px-2 py-1 border rounded ${
                              ok ? "border-gray-300" : "border-red-400"
                            }`}
                          />
                          {!!val && (
                            <a
                              href={val}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-1 text-xs text-blue-600 hover:underline"
                            >
                              Abrir link
                            </a>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            onClick={() =>
                              handleLinkChange(product._id, s, "")
                            }
                            className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
                          >
                            Limpar
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* extras que existem em yampiLinks, mas não em sizes */}
                  {Object.keys(linksDraft)
                    .filter((k) => !sizes.includes(k))
                    .map((extra) => {
                      const val = linksDraft[extra] || "";
                      const ok = !val || isValidUrl(val);
                      return (
                        <tr
                          key={`${product._id}-extra-${extra}`}
                          className="border-b last:border-b-0"
                        >
                          <td className="px-2 py-2 font-medium text-gray-900">
                            {extra}
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="url"
                              value={val}
                              onChange={(e) =>
                                handleLinkChange(
                                  product._id,
                                  extra,
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1 border rounded ${
                                ok ? "border-gray-300" : "border-red-400"
                              }`}
                            />
                            {!!val && (
                              <a
                                href={val}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-1 text-xs text-blue-600 hover:underline"
                              >
                                Abrir link
                              </a>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() =>
                                handleLinkChange(product._id, extra, "")
                              }
                              className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              <div className="flex justify-end mt-3">
                <button
                  onClick={() => salvarLinks(product._id, sizes)}
                  className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
                >
                  Salvar links
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 mt-4">
        Dica: a primeira imagem é a que aparece nas vitrines.
      </p>
    </Motion.div>
  );
};

export default ProductMiniDashboard;
