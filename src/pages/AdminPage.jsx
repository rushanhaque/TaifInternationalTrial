import React, { useState, useRef, useMemo, useEffect } from "react";
import NotFoundPage from "./NotFoundPage";

/* ---------------------------------------------------------------
   Admin · Product Management — Taif International Design System
   Fonts: var(--font-display) 'Archivo Expanded' · var(--font-body) 'Inter Tight'
   Palette: var(--chrome) · var(--graphite) · var(--brass) · var(--hair)
--------------------------------------------------------------- */

const EMPTY_PRODUCT = {
  id: null,
  image: null,
  imagePreview: null,
  name: "",
  category: "",
  subcategory: "",
  sku: "",
  material: "",
  finish: "",
};

function BoxIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path
        d="M20 5 L34 12 V28 L20 35 L6 28 V12 Z"
        stroke="var(--brass, #b0894f)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M6 12 L20 19 L34 12" stroke="var(--brass, #b0894f)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M20 19 V35" stroke="var(--brass, #b0894f)" strokeWidth="1.3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
      <path d="M11 14V3" stroke="var(--brass, #b0894f)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 7.5 11 3l4.5 4.5" stroke="var(--brass, #b0894f)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v2.2c0 1 .8 1.8 1.8 1.8h10.4c1 0 1.8-.8 1.8-1.8V15" stroke="var(--brass, #b0894f)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brass, #b0894f)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="pm-overlay" onMouseDown={onClose}>
      <div
        className={`pm-modal ${wide ? "pm-modal--wide" : ""}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pm-modal-head">
          <h2>{title}</h2>
          <button className="pm-icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const isAuthorized = typeof window !== 'undefined' && localStorage.getItem('taif_admin_device_authorized') === 'true';

  if (!isAuthorized) {
    return <NotFoundPage />;
  }

  return <AdminPageContent />;
}

function AdminPageContent() {
  const [products, setProducts] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [subForm, setSubForm] = useState({ category: "", subcategory: "" });

  // Toast notifications state
  const [toast, setToast] = useState(null);

  const triggerToast = (msg) => {
    setToast(msg);
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Dynamically derived list of categories added by user
  const availableCategories = useMemo(() => {
    const set = new Set(customCategories);
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [customCategories, products]);

  // Category filter chips starting with only "All"
  const categoryChips = useMemo(() => {
    return ["All", ...availableCategories];
  }, [availableCategories]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      return activeCategory === "All" || p.category === activeCategory;
    });
  }, [products, activeCategory]);

  const resetProductForm = () => {
    setProductForm(EMPTY_PRODUCT);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setProductForm((f) => ({ ...f, image: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    const trimmedCategory = productForm.category.trim();
    if (trimmedCategory && !customCategories.includes(trimmedCategory)) {
      setCustomCategories((prev) => [...prev, trimmedCategory]);
    }

    if (productForm.id) {
      // Edit existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productForm.id
            ? { ...productForm, category: trimmedCategory, imagePreview }
            : p
        )
      );
      triggerToast(`Updated "${productForm.name}" successfully`);
    } else {
      // Create new product
      const newProd = {
        ...productForm,
        category: trimmedCategory,
        id: Date.now(),
        imagePreview,
      };
      setProducts((prev) => [newProd, ...prev]);
      triggerToast(`Added "${newProd.name}" to products`);
    }

    resetProductForm();
    setShowAddProduct(false);
  };

  const handleEditProduct = (prod) => {
    setProductForm(prod);
    setImagePreview(prod.imagePreview || null);
    setShowAddProduct(true);
  };

  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      triggerToast(`Deleted "${name}"`);
    }
  };

  const handleCreateSub = (e) => {
    e.preventDefault();
    const trimmedCat = subForm.category.trim();
    const trimmedSub = subForm.subcategory.trim();
    if (!trimmedCat || !trimmedSub) return;

    if (!customCategories.includes(trimmedCat)) {
      setCustomCategories((prev) => [...prev, trimmedCat]);
    }

    setSubForm({ category: "", subcategory: "" });
    setShowAddSub(false);
    triggerToast(`Created subcategory "${trimmedSub}" under ${trimmedCat}`);
  };

  return (
    <div className="pm-root">
      <style>{CSS}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="pm-toast">
          <CheckIcon />
          <span>{toast}</span>
        </div>
      )}

      <div className="pm-container">
        {/* Fixed Top Section */}
        <div className="pm-top-section">
          <header className="pm-header">
            <h1 className="pm-title">Product Management</h1>
            <p className="lede" style={{ marginTop: ".4rem", fontSize: "1rem" }}>
              Add, edit, sub-categorize, and organize product items across the catalogue.
            </p>
          </header>

          {/* Category chips bar */}
          <div className="pm-chips-bar">
            <div className="pm-chips">
              {categoryChips.map((cat) => {
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    className={`pm-chip ${activeCategory === cat ? "pm-chip--active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    <span>{cat}</span>
                    {count > 0 && <span className="pm-chip-count">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Datalist for existing categories in forms */}
        <datalist id="pm-category-list">
          {availableCategories.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>

        {/* Scrollable Products Content Area */}
        <div className="pm-scrollable-content">
          {filteredProducts.length === 0 ? (
            <div className="pm-empty">
              <div className="pm-empty-icon">
                <BoxIcon />
              </div>
              <h3>No products found</h3>
              <p>
                {activeCategory === "All"
                  ? "Start by adding your first product using the button below."
                  : `No products in "${activeCategory}" category yet.`}
              </p>
            </div>
          ) : (
            <div className="pm-grid">
              {filteredProducts.map((p) => (
                <div className="pm-card" key={p.id}>
                  <div className="pm-card-image">
                    {p.imagePreview ? (
                      <img src={p.imagePreview} alt={p.name} />
                    ) : (
                      <div className="pm-card-placeholder">
                        <BoxIcon />
                      </div>
                    )}
                  </div>

                  <div className="pm-card-body">
                    <div className="pm-card-top">
                      <h4>{p.name}</h4>
                      {p.sku && <span className="pm-sku">SKU: {p.sku}</span>}
                    </div>

                    <p className="pm-card-meta">
                      {p.category}
                      {p.subcategory ? ` · ${p.subcategory}` : ""}
                    </p>

                    {(p.material || p.finish) && (
                      <div className="pm-card-tags">
                        {p.material && <span className="pm-tag">{p.material}</span>}
                        {p.finish && <span className="pm-tag">{p.finish}</span>}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pm-card-actions">
                    <button
                      className="pm-card-btn pm-card-btn--edit"
                      onClick={() => handleEditProduct(p)}
                      title="Edit Product"
                      aria-label="Edit product"
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="pm-card-btn pm-card-btn--delete"
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      title="Delete Product"
                      aria-label="Delete product"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="pm-bottom-bar">
          <div className="pm-bottom-actions">
            <button
              className="pm-btn pm-btn--primary"
              onClick={() => {
                resetProductForm();
                setShowAddProduct(true);
              }}
            >
              <span className="pm-plus">+</span> Add Product
            </button>
            <button className="pm-btn pm-btn--outline" onClick={() => setShowAddSub(true)}>
              <span className="pm-plus">+</span> Add Subcategory
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddProduct && (
        <Modal
          title={productForm.id ? "Edit Product" : "Add Product"}
          onClose={() => {
            setShowAddProduct(false);
            resetProductForm();
          }}
          wide
        >
          <form className="pm-form" onSubmit={handleSaveProduct}>
            <label className="pm-upload" htmlFor="pm-file-input">
              {imagePreview ? (
                <div className="pm-upload-preview-container">
                  <img src={imagePreview} alt="Preview" className="pm-upload-preview" />
                  <span className="pm-upload-change">Change Image</span>
                </div>
              ) : (
                <>
                  <UploadIcon />
                  <span>Upload Product Image</span>
                  <small className="pm-upload-hint">PNG, JPG up to 10MB</small>
                </>
              )}
            </label>
            <input
              id="pm-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />

            <div className="pm-field">
              <label>PRODUCT NAME *</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Brass Memorial Urn"
                required
              />
            </div>

            <div className="pm-field-row">
              <div className="pm-field">
                <label>CATEGORY *</label>
                <input
                  type="text"
                  list="pm-category-list"
                  value={productForm.category}
                  onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Lighting"
                  required
                />
              </div>
              <div className="pm-field">
                <label>SUBCATEGORY</label>
                <input
                  type="text"
                  value={productForm.subcategory}
                  onChange={(e) => setProductForm((f) => ({ ...f, subcategory: e.target.value }))}
                  placeholder="e.g. Pendant Lights"
                />
              </div>
            </div>

            <div className="pm-field-row">
              <div className="pm-field">
                <label>SKU</label>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) => setProductForm((f) => ({ ...f, sku: e.target.value }))}
                  placeholder="e.g. FN-0182"
                />
              </div>
              <div className="pm-field">
                <label>MATERIAL</label>
                <input
                  type="text"
                  value={productForm.material}
                  onChange={(e) => setProductForm((f) => ({ ...f, material: e.target.value }))}
                  placeholder="e.g. Brass"
                />
              </div>
            </div>

            <div className="pm-field">
              <label>FINISH</label>
              <input
                type="text"
                value={productForm.finish}
                onChange={(e) => setProductForm((f) => ({ ...f, finish: e.target.value }))}
                placeholder="e.g. Matte, Polished"
              />
            </div>

            <div className="pm-modal-actions">
              <button
                type="button"
                className="pm-btn pm-btn--ghost"
                onClick={() => {
                  setShowAddProduct(false);
                  resetProductForm();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="pm-btn pm-btn--primary">
                {productForm.id ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Subcategory Modal */}
      {showAddSub && (
        <Modal title="Add Subcategory" onClose={() => setShowAddSub(false)}>
          <form className="pm-form" onSubmit={handleCreateSub}>
            <div className="pm-field">
              <label>CATEGORY NAME *</label>
              <input
                type="text"
                list="pm-category-list"
                value={subForm.category}
                onChange={(e) => setSubForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Lighting"
                required
              />
            </div>

            <div className="pm-field">
              <label>SUBCATEGORY NAME *</label>
              <input
                type="text"
                value={subForm.subcategory}
                onChange={(e) => setSubForm((f) => ({ ...f, subcategory: e.target.value }))}
                placeholder="e.g. Pendant Lights"
                required
              />
            </div>

            <div className="pm-modal-actions">
              <button
                type="button"
                className="pm-btn pm-btn--ghost"
                onClick={() => setShowAddSub(false)}
              >
                Cancel
              </button>
              <button type="submit" className="pm-btn pm-btn--primary">
                Create Subcategory
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const CSS = `
:root {
  --pm-bg: var(--chrome, #faf7f2);
  --pm-card: var(--white, #ffffff);
  --pm-brass: var(--brass, #b0894f);
  --pm-brass-dark: var(--brass-dk, #8a6733);
  --pm-brass-tint: rgba(176, 137, 79, 0.12);
  --pm-border: var(--chrome-3, #e3d9c9);
  --pm-border-hair: var(--hair, rgba(36, 28, 20, 0.11));
  --pm-text: var(--graphite, #241c14);
  --pm-text-secondary: var(--graphite-2, #5a4632);
  --pm-tint-deep: var(--tint-deep, #8a5a20);
}

.pm-root {
  background: var(--pm-bg);
  min-height: 100vh;
  width: 100%;
  padding-top: 110px;
  padding-bottom: 60px;
  font-family: var(--font-body, 'Inter Tight', system-ui, sans-serif);
  color: var(--pm-text);
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}
.pm-root *, .pm-root *::before, .pm-root *::after { box-sizing: border-box; }

/* Toast Notification */
.pm-toast {
  position: fixed;
  top: 100px;
  right: 24px;
  background: var(--white, #ffffff);
  border: 1px solid var(--pm-border);
  border-left: 4px solid var(--pm-brass);
  border-radius: var(--r-sm, 12px);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 12px 32px rgba(36, 28, 20, 0.12);
  z-index: 1100;
  animation: pmToastSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-size: 14px;
  font-weight: 500;
  color: var(--pm-text);
}
@keyframes pmToastSlide {
  from { opacity: 0; transform: translateY(-12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* App Viewport Container */
.pm-container {
  max-width: 1080px;
  margin: 0 auto;
  min-height: calc(100vh - 160px);
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 24px 20px;
  box-sizing: border-box;
}

/* Fixed Top Section */
.pm-top-section {
  flex-shrink: 0;
}

/* Header & Meta */
.pm-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 24px;
}
.pm-admin-tag {
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--pm-tint-deep);
}
.pm-count-badge {
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 600;
  background: var(--chrome-2, #f1ebe1);
  color: var(--pm-text-secondary);
  padding: 2px 10px;
  border-radius: 999px;
}
.pm-title {
  font-family: var(--font-display, 'Archivo Expanded', 'Archivo', system-ui, sans-serif);
  font-stretch: 125%;
  font-weight: 700;
  font-size: clamp(2.2rem, 4.2vw, 3.4rem);
  letter-spacing: -0.04em;
  line-height: 0.96;
  margin: 0;
  color: var(--pm-text);
}

/* Buttons */
.pm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-size: 0.92rem;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: var(--r-pill, 999px);
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.25s var(--ease-surge, ease), background 0.18s ease, border-color 0.18s ease;
  white-space: nowrap;
}
.pm-btn:active { transform: scale(0.96); }
.pm-plus { font-size: 16px; line-height: 1; }

.pm-btn--primary {
  background: var(--pm-text);
  color: var(--white, #ffffff);
  box-shadow: 0 4px 14px -4px rgba(36, 28, 20, 0.24);
}
.pm-btn--primary:hover {
  background: var(--pm-brass-dark);
  color: #ffffff;
  transform: translateY(-1px);
}

.pm-btn--outline {
  background: var(--white, #ffffff);
  color: var(--pm-text);
  border: 1px solid var(--pm-border-hair);
}
.pm-btn--outline:hover {
  border-color: var(--pm-border);
  background: var(--pm-brass-tint);
  transform: translateY(-1px);
}

.pm-btn--ghost {
  background: var(--white, #ffffff);
  color: var(--pm-text-secondary);
  border: 1px solid var(--pm-border-hair);
}
.pm-btn--ghost:hover {
  background: var(--chrome-2, #f1ebe1);
  color: var(--pm-text);
}

/* Chips Bar */
.pm-chips-bar {
  border-top: 1px solid var(--pm-border-hair);
  border-bottom: 1px solid var(--pm-border-hair);
  padding: 12px 0;
  margin-bottom: 24px;
}
.pm-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.pm-chips::-webkit-scrollbar { display: none; }

.pm-chip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: var(--r-pill, 999px);
  border: 1px solid var(--pm-border-hair);
  background: var(--white, #ffffff);
  color: var(--pm-text-secondary);
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
}
.pm-chip:hover {
  border-color: var(--pm-border);
  color: var(--pm-text);
  transform: scale(1.02);
}
.pm-chip--active {
  background: var(--pm-text);
  border-color: var(--pm-text);
  color: var(--white, #ffffff);
}
.pm-chip--active:hover { color: var(--white, #ffffff); }

.pm-chip-count {
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  font-weight: 700;
  background: rgba(36, 28, 20, 0.08);
  padding: 1px 7px;
  border-radius: 999px;
}
.pm-chip--active .pm-chip-count {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

/* Scrollable Content Section */
.pm-scrollable-content {
  flex: 1;
  min-height: 280px;
  padding-right: 4px;
  padding-bottom: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(176, 137, 79, 0.25) transparent;
}
.pm-scrollable-content::-webkit-scrollbar {
  width: 6px;
}
.pm-scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(176, 137, 79, 0.25);
  border-radius: 999px;
}
.pm-scrollable-content::-webkit-scrollbar-thumb:hover {
  background: var(--pm-brass);
}

/* Empty State */
.pm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 260px;
  padding: 40px 24px;
  background: var(--pm-card);
  border: 1.5px dashed var(--pm-border);
  border-radius: var(--r-md, 22px);
  box-shadow: 0 1px 3px rgba(36, 28, 20, 0.04);
}
.pm-empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--pm-brass-tint);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.pm-empty h3 {
  font-family: var(--font-display, 'Archivo Expanded', sans-serif);
  font-stretch: 125%;
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--pm-text);
}
.pm-empty p {
  margin: 0;
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-size: 14px;
  color: var(--pm-text-secondary);
  max-width: 360px;
  line-height: 1.5;
}

/* Product Grid */
.pm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
.pm-card {
  background: var(--pm-card);
  border: 1px solid var(--pm-border-hair);
  border-radius: var(--r-md, 20px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  position: relative;
}
.pm-card:hover {
  border-color: var(--pm-border);
  box-shadow: 0 8px 24px -4px rgba(176, 137, 79, 0.12), 0 4px 12px rgba(36, 28, 20, 0.04);
  transform: translateY(-2px);
}

.pm-card-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--chrome-2, #f1ebe1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.pm-card-image img { width: 100%; height: 100%; object-fit: cover; }
.pm-card-placeholder { opacity: 0.45; }

/* Card Actions Overlay */
.pm-card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
}
.pm-card:hover .pm-card-actions {
  opacity: 1;
}

.pm-card-btn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--pm-text-secondary);
  box-shadow: 0 2px 8px rgba(36, 28, 20, 0.12);
  transition: background 0.16s ease, color 0.16s ease;
}
.pm-card-btn--edit:hover { color: var(--pm-brass-dark); background: #FFFFFF; }
.pm-card-btn--delete:hover { color: #9e3324; background: #FFFFFF; }

.pm-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.pm-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.pm-card-body h4 {
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--pm-text);
  line-height: 1.3;
  letter-spacing: -0.01em;
}
.pm-card-meta {
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--pm-text-secondary);
  font-weight: 500;
}

.pm-sku {
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-variant-numeric: tabular-nums;
  font-size: 10px;
  font-weight: 600;
  color: var(--pm-tint-deep);
  background: var(--pm-brass-tint);
  padding: 2px 7px;
  border-radius: 6px;
  white-space: nowrap;
}

.pm-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}
.pm-tag {
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-size: 11px;
  color: var(--pm-text-secondary);
  background: var(--chrome-2, #f1ebe1);
  border: 1px solid var(--pm-border-hair);
  padding: 3px 8px;
  border-radius: 999px;
}

/* Fixed Bottom Action Bar */
.pm-bottom-bar {
  flex-shrink: 0;
  padding-top: 16px;
  border-top: 1px solid var(--pm-border-hair);
  display: flex;
  justify-content: center;
  background: var(--pm-bg);
}
.pm-bottom-actions {
  display: flex;
  gap: 14px;
  width: 100%;
  max-width: 480px;
}
.pm-bottom-actions .pm-btn { flex: 1; }

/* Modal & Window Form UI Improvements */
.pm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(36, 28, 20, 0.45);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  animation: pmFadeIn 0.2s ease;
}
.pm-modal {
  background: var(--white, #ffffff);
  border-radius: var(--r-md, 22px);
  width: 100%;
  max-width: 520px;
  max-height: 88vh;
  overflow-y: auto;
  padding: 32px;
  box-shadow: 0 24px 64px rgba(36, 28, 20, 0.22);
  animation: pmScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.pm-modal--wide { max-width: 560px; }

@keyframes pmFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pmScaleIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.pm-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--pm-border-hair);
}
.pm-modal-head h2 {
  font-family: var(--font-display, 'Archivo Expanded', 'Archivo', system-ui, sans-serif);
  font-stretch: 125%;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--pm-text);
}
.pm-icon-btn {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: var(--pm-text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s ease, color 0.15s ease;
}
.pm-icon-btn:hover { background: var(--chrome-2, #f1ebe1); color: var(--pm-text); }

/* Form Fields & Textboxes */
.pm-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.pm-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1.5px dashed var(--pm-border);
  border-radius: var(--r-sm, 14px);
  padding: 24px 16px;
  cursor: pointer;
  color: var(--pm-tint-deep);
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-size: 13px;
  font-weight: 600;
  transition: border-color 0.18s ease, background 0.18s ease;
  overflow: hidden;
  position: relative;
  background: var(--pm-bg);
}
.pm-upload:hover { border-color: var(--pm-brass); background: var(--pm-brass-tint); }
.pm-upload-hint { font-weight: 400; color: var(--pm-text-secondary); font-size: 11px; }

.pm-upload-preview-container {
  width: 100%;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}
.pm-upload-preview {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}
.pm-upload-change {
  position: absolute;
  inset: 0;
  background: rgba(36, 28, 20, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  font-size: 13px;
  font-weight: 600;
}
.pm-upload-preview-container:hover .pm-upload-change { opacity: 1; }

.pm-field-row {
  display: flex;
  gap: 16px;
  width: 100%;
}

.pm-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
  width: 100%;
}

.pm-field label {
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-size: 11px;
  font-weight: 600;
  color: var(--pm-text-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pm-field input,
.pm-field select {
  width: 100%;
  box-sizing: border-box;
  height: 44px;
  border: 1px solid var(--pm-border-hair);
  border-radius: var(--r-sm, 10px);
  padding: 0 14px;
  font-family: var(--font-body, 'Inter Tight', sans-serif);
  font-size: 14px;
  font-weight: 400;
  color: var(--pm-text);
  outline: none;
  background: var(--white, #ffffff);
  transition: all 0.18s ease;
}

.pm-field input:hover,
.pm-field select:hover {
  border-color: var(--pm-border);
}

.pm-field input:focus,
.pm-field select:focus {
  border-color: var(--tint, #a9762f);
  box-shadow: 0 0 0 3px rgba(169, 118, 47, 0.15);
}

.pm-field input::placeholder {
  color: rgba(36, 28, 20, 0.38);
}

.pm-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--pm-border-hair);
}

/* Mobile UI Optimization */
@media (max-width: 640px) {
  .pm-root {
    padding-top: 90px;
  }
  .pm-container {
    padding: 0 16px 16px;
  }
  .pm-title {
    font-size: 26px;
  }

  /* List View Format on Mobile UI */
  .pm-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pm-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px;
    gap: 14px;
    border-radius: var(--r-sm, 16px);
    background: var(--white, #ffffff);
    box-shadow: 0 2px 8px rgba(36, 28, 20, 0.04);
  }

  .pm-card-image {
    width: 80px;
    height: 80px;
    min-width: 80px;
    aspect-ratio: 1 / 1;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .pm-card-body {
    padding: 0;
    flex: 1;
    min-width: 0;
    justify-content: center;
  }

  .pm-card-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    margin-bottom: 3px;
  }

  .pm-card-body h4 {
    font-size: 15px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .pm-card-meta {
    margin-bottom: 6px;
    font-size: 12px;
  }

  .pm-card-actions {
    position: static;
    opacity: 1;
    flex-direction: column;
    gap: 6px;
    margin-left: auto;
    flex-shrink: 0;
  }

  .pm-card-btn {
    width: 36px;
    height: 36px;
    box-shadow: 0 1px 4px rgba(36, 28, 20, 0.08);
    border: 1px solid var(--pm-border-hair);
  }

  .pm-field-row {
    flex-direction: column;
    gap: 18px;
  }

  .pm-overlay {
    padding: 16px;
    align-items: center;
    justify-content: center;
  }
  .pm-modal {
    max-width: 100%;
    width: 100%;
    max-height: 86vh;
    padding: 24px 20px 28px;
    border-radius: var(--r-md, 20px);
    animation: pmScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pm-bottom-bar {
    padding-top: 12px;
  }
  .pm-bottom-actions {
    max-width: 100%;
    gap: 10px;
  }
  .pm-bottom-actions .pm-btn {
    padding: 13px 12px;
    font-size: 13px;
  }
}
`;