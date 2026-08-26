import { useState, useEffect } from "react"
import { Search, Trash2, Package, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "react-toastify"
import api from "../../api"
import "./Products.css"

const Products = () => {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page, limit: 10 })
        if (search) params.append("search", search)

        const res = await api.get(`/api/admin/products?${params}`)
        setProducts(res.data.products)
        setTotalPages(res.data.totalPages)
      } catch {
        toast.error("Failed to fetch products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [page, search])

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleDelete = async (productId) => {
    try {
      await api.delete(`/api/admin/products/${productId}`)
      toast.success("Product deleted successfully")
      setDeleteConfirm(null)
      setPage(p => p)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product")
    }
  }

  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

  return (
    <div className="admin-products-page animate-fadeIn">
      <div className="admin-page-header">
        <h1>Products</h1>
        <p>Manage all products on the platform</p>
      </div>

      <div className="admin-filters">
        <div className="admin-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-products-grid">
        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner large"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty-grid">No products found</div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="admin-product-card glass-card">
              <div className="admin-product-image">
                {product.images && product.images.length > 0 ? (
                  <img src={`${VITE_BACKEND_URL}/uploads/${product.images[0]}`} alt={product.name} />
                ) : (
                  <div className="admin-product-no-image">
                    <Package size={32} />
                  </div>
                )}
              </div>
              <div className="admin-product-info">
                <h4>{product.name}</h4>
                <p className="admin-product-category">{product.category}</p>
                <div className="admin-product-meta">
                  <span className="admin-product-price">₹{product.price.toLocaleString()}</span>
                  <span className="admin-product-stock">Stock: {product.stock}</span>
                </div>
                <p className="admin-product-vendor">
                  by {product.vendor?.username || "Unknown"}
                </p>
              </div>
              <div className="admin-product-actions">
                {deleteConfirm === product._id ? (
                  <div className="admin-delete-confirm">
                    <span>Delete?</span>
                    <button className="confirm-yes" onClick={() => handleDelete(product._id)}>Yes</button>
                    <button className="confirm-no" onClick={() => setDeleteConfirm(null)}>No</button>
                  </div>
                ) : (
                  <button className="admin-action-btn danger" onClick={() => setDeleteConfirm(product._id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

export default Products
