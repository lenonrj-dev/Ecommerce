import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext";

const initial = {
  fullName: "", phone: "", zip: "", street: "", number: "",
  complement: "", neighborhood: "", city: "", state: "", country: "Brasil",
};

export default function Endereco() {
  const { address, saveAddress, loadAddress } = useContext(ShopContext);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAddress(); }, [loadAddress]);
  useEffect(() => { if (address) setForm({ ...initial, ...address }); }, [address]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveAddress(form);
    setSaving(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Endereço</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Nome completo" className="border rounded-lg p-3" />
        <input name="phone" value={form.phone} onChange={onChange} placeholder="Telefone" className="border rounded-lg p-3" />
        <input name="zip" value={form.zip} onChange={onChange} placeholder="CEP" className="border rounded-lg p-3" />
        <input name="street" value={form.street} onChange={onChange} placeholder="Rua" className="border rounded-lg p-3" />
        <input name="number" value={form.number} onChange={onChange} placeholder="Número" className="border rounded-lg p-3" />
        <input name="complement" value={form.complement} onChange={onChange} placeholder="Complemento" className="border rounded-lg p-3" />
        <input name="neighborhood" value={form.neighborhood} onChange={onChange} placeholder="Bairro" className="border rounded-lg p-3" />
        <input name="city" value={form.city} onChange={onChange} placeholder="Cidade" className="border rounded-lg p-3" />
        <input name="state" value={form.state} onChange={onChange} placeholder="Estado" className="border rounded-lg p-3" />
        <input name="country" value={form.country} onChange={onChange} placeholder="País" className="border rounded-lg p-3" />
        <div className="md:col-span-2">
          <button disabled={saving} className="bg-black text-white rounded-lg px-5 py-3">
            {saving ? "Salvando..." : "Salvar endereço"}
          </button>
        </div>
      </form>
    </div>
  );
}
