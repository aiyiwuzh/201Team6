import { useState, useEffect } from 'react';
import { getAllItems, createItem, updateItem, deleteItem, Item } from '../services/api';
import './ItemManager.css';

function ItemManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllItems();
      setItems(data);
    } catch (err: any) {
      setError('Failed to fetch items. Make sure the backend is running and connected to Supabase.');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      if (editingId) {
        // Update existing item
        await updateItem(editingId, { name, description });
      } else {
        // Create new item
        await createItem({ name, description });
      }
      
      setName('');
      setDescription('');
      setEditingId(null);
      await fetchItems();
    } catch (err: any) {
      setError(`Failed to ${editingId ? 'update' : 'create'} item: ${err.message}`);
      console.error('Error saving item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Item) => {
    setName(item.name);
    setDescription(item.description);
    setEditingId(item.id!);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    setError('');
    
    try {
      await deleteItem(id);
      await fetchItems();
    } catch (err: any) {
      setError('Failed to delete item: ' + err.message);
      console.error('Error deleting item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  return (
    <div className="item-manager">
      <h2>Database CRUD Operations</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
          <button type="button" onClick={fetchItems} className="refresh-btn" disabled={loading}>
            Refresh
          </button>
        </div>
      </form>

      <div className="items-list">
        <h3>Items ({items.length})</h3>
        {loading && <p>Loading...</p>}
        {!loading && items.length === 0 && (
          <p className="empty-state">No items yet. Create one above!</p>
        )}
        {!loading && items.length > 0 && (
          <div className="items-grid">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-content">
                  <h4>{item.name}</h4>
                  {item.description && <p>{item.description}</p>}
                  <small>ID: {item.id}</small>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleEdit(item)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id!)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemManager;

