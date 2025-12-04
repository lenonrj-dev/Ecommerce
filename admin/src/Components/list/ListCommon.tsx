// src/components/list/ListCommon.jsx

export const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
    {children}
  </h3>
);

export const FieldLabel = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
);

export const Pill = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 rounded-full border text-xs font-medium transition ${
      active
        ? "bg-gray-900 text-white border-gray-900"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);
