import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/api';

const Inventory = () => {
  const { user, token } = useAuth();
  


  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [showOutwardModal, setShowOutwardModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [modalData, setModalData] = useState({ quantity: '', reason: '' });
  const [filterData, setFilterData] = useState({
    name: '',
    category: '',
    locationBin: '',
    minQty: '',
    maxQty: ''
  });
  const [componentData, setComponentData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    partNumber: '',
    description: '',
    quantity: 0,
    locationBin: '',
    unitPrice: 0,
    datasheetLink: '',
    criticalThreshold: 0
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState({ lowStock: [], oldStock: [] });
  const [alertsLoading, setAlertsLoading] = useState(false);
  const notificationRef = useRef();

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_ENDPOINTS.COMPONENTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setComponents(data);
    } catch (error) {
      toast.error('Error fetching components');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchComponents(filterData);
  };

  const handleFilterReset = () => {
    setFilterData({
      name: '',
      category: '',
      locationBin: '',
      minQty: '',
      maxQty: ''
    });
    setLoading(true);
    fetchComponents();
  };

  const handleAddComponent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.COMPONENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(componentData)
      });

      if (response.ok) {
        setShowAddModal(false);
        setComponentData({
          name: '',
          category: '',
          manufacturer: '',
          partNumber: '',
          description: '',
          quantity: 0,
          locationBin: '',
          unitPrice: 0,
          datasheetLink: '',
          criticalThreshold: 0
        });
        fetchComponents();
        toast.success('Component added successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add component');
      }
    } catch (error) {
      toast.error('Error adding component');
    }
  };

  const handleEditComponent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.COMPONENT_BY_ID(selectedComponent._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(componentData)
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedComponent(null);
        setComponentData({
          name: '',
          category: '',
          manufacturer: '',
          partNumber: '',
          description: '',
          quantity: 0,
          locationBin: '',
          unitPrice: 0,
          datasheetLink: '',
          criticalThreshold: 0
        });
        fetchComponents();
        toast.success('Component updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update component');
      }
    } catch (error) {
      toast.error('Error updating component');
    }
  };

  const handleInward = async (e) => {
    e.preventDefault();
    try {
      // Ensure quantity is converted to number
      const numericQuantity = parseInt(modalData.quantity);
      if (!numericQuantity || numericQuantity <= 0) {
        toast.error('Please enter a valid positive quantity');
        return;
      }

      const response = await fetch(API_ENDPOINTS.INWARD_LOG(selectedComponent._id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...modalData,
          quantity: numericQuantity
        })
      });

      if (response.ok) {
        setShowInwardModal(false);
        setModalData({ quantity: '', reason: '' });
        setSelectedComponent(null);
        fetchComponents();
        toast.success('Inward logged successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to log inward');
      }
    } catch (error) {
      toast.error('Error logging inward');
    }
  };

  const handleOutward = async (e) => {
    e.preventDefault();
    try {
      // Ensure quantity is converted to number
      const numericQuantity = parseInt(modalData.quantity);
      if (!numericQuantity || numericQuantity <= 0) {
        toast.error('Please enter a valid positive quantity');
        return;
      }

      // Check if available quantity is sufficient
      if (numericQuantity > selectedComponent.quantity) {
        toast.error(`Not enough stock available. Current stock: ${selectedComponent.quantity}`);
        return;
      }

      const response = await fetch(API_ENDPOINTS.OUTWARD_LOG(selectedComponent._id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...modalData,
          quantity: numericQuantity
        })
      });

      if (response.ok) {
        setShowOutwardModal(false);
        setModalData({ quantity: '', reason: '' });
        setSelectedComponent(null);
        fetchComponents();
        toast.success('Outward logged successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to log outward');
      }
    } catch (error) {
      toast.error('Error logging outward');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this component?')) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.COMPONENT_BY_ID(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchComponents();
        toast.success('Component deleted successfully!');
      } else {
        toast.error('Failed to delete component');
      }
    } catch (error) {
      toast.error('Error deleting component');
    }
  };

  const openEditModal = (component) => {
    setSelectedComponent(component);
    setComponentData({
      name: component.name,
      category: component.category,
      manufacturer: component.manufacturer || '',
      partNumber: component.partNumber || '',
      description: component.description || '',
      quantity: component.quantity,
      locationBin: component.locationBin || '',
      unitPrice: component.unitPrice || 0,
      datasheetLink: component.datasheetLink || '',
      criticalThreshold: component.criticalThreshold
    });
    setShowEditModal(true);
  };

  const fetchAlerts = async () => {
    setAlertsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.ALERTS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAlerts({
        lowStock: data.lowStock || [],
        oldStock: data.staleStock || [],
      });
    } catch (error) {
      setAlerts({ lowStock: [], oldStock: [] });
    } finally {
      setAlertsLoading(false);
    }
  };

  // Close popup on outside click
  useEffect(() => {
    if (!showNotifications) return;
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleNotificationClick = () => {
    setShowNotifications((prev) => {
      if (!prev) fetchAlerts();
      return !prev;
    });
  };

  // Add a loading spinner overlay
  return (
    <AppLayout>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500 border-solid"></div>
        </div>
      )}
      <div className="p-6 w-full">
        <div className="max-w-7xl mx-auto w-full">


          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={handleNotificationClick}
                  className="relative focus:outline-none"
                  aria-label="Show notifications"
                >
                  <span className="text-2xl">🔔</span>
                  {(alerts.lowStock.length > 0 || alerts.oldStock.length > 0) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1.5 text-xs font-bold">
                      {alerts.lowStock.length + alerts.oldStock.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg z-50 border border-gray-200">
                    <div className="p-4 border-b font-semibold text-gray-900 flex items-center">
                      <span className="mr-2">Notifications</span>
                      <span className="ml-auto text-xs text-gray-400 cursor-pointer" onClick={() => setShowNotifications(false)}>✖</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {alertsLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                      ) : (
                        <>
                          <div className="p-4 border-b">
                            <div className="font-bold text-red-600 mb-2 flex items-center">
                              <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                              Low Stock Components
                            </div>
                            {alerts.lowStock.length === 0 ? (
                              <div className="text-gray-500 text-sm">No low stock components.</div>
                            ) : (
                              <ul>
                                {alerts.lowStock.map((comp) => (
                                  <li key={comp._id} className="flex items-center mb-1">
                                    <span className="font-semibold text-gray-800 mr-2">{comp.name}</span>
                                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold mr-2">Qty: {comp.quantity}</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">Threshold: {comp.criticalThreshold}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="font-bold text-yellow-700 mb-2 flex items-center">
                              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
                              No Movement in 3 Months
                            </div>
                            {alerts.oldStock.length === 0 ? (
                              <div className="text-gray-500 text-sm">No old stock components.</div>
                            ) : (
                              <ul>
                                {alerts.oldStock.map((comp) => (
                                  <li key={comp._id} className="flex items-center mb-1">
                                    <span className="font-semibold text-gray-800 mr-2">{comp.name}</span>
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold mr-2">Last Out: {comp.lastOutwardedAt ? new Date(comp.lastOutwardedAt).toLocaleDateString() : 'Never'}</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">Qty: {comp.quantity}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {(user?.role === 'Admin' || user?.role === 'LabTechnician') && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Component
                </button>
              )}
            </div>
          </div>

          {/* Filter Form */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Components</h2>
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={filterData.name}
                  onChange={(e) => setFilterData({ ...filterData, name: e.target.value })}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filterData.category}
                  onChange={(e) => setFilterData({ ...filterData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="Passive">Passive</option>
                  <option value="Active">Active</option>
                  <option value="Semiconductor">Semiconductor</option>
                  <option value="Connector">Connector</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={filterData.locationBin}
                  onChange={(e) => setFilterData({ ...filterData, locationBin: e.target.value })}
                  placeholder="Search by location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={filterData.minQty}
                  onChange={(e) => setFilterData({ ...filterData, minQty: e.target.value })}
                  placeholder="Min qty..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={filterData.maxQty}
                  onChange={(e) => setFilterData({ ...filterData, maxQty: e.target.value })}
                  placeholder="Max qty..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={handleFilterReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                onClick={handleFilterSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {components.map((component) => (
                    <tr
                      key={component._id}
                      className={`${
                        component.quantity < component.criticalThreshold
                          ? 'bg-red-50 border-l-4 border-red-400'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {component.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {component.manufacturer && `by ${component.manufacturer}`}
                          </div>
                          {component.partNumber && (
                            <div className="text-xs text-gray-400">
                              Part: {component.partNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {component.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                              component.quantity < component.criticalThreshold
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {component.quantity}
                          </span>
                          {component.quantity < component.criticalThreshold && (
                            <span className="ml-2 text-xs text-red-600 font-medium">
                              Low Stock!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {component.locationBin || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(user?.role === 'Admin' || user?.role === 'LabTechnician') && (
                            <button
                              onClick={() => {
                                setSelectedComponent(component);
                                setShowInwardModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              📥 Inward
                            </button>
                          )}
                          {(user?.role === 'Admin' || user?.role === 'LabTechnician') && (
                            <button
                              onClick={() => {
                                setSelectedComponent(component);
                                setShowOutwardModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              📤 Outward
                            </button>
                          )}
                          {(user?.role === 'Admin' || user?.role === 'LabTechnician') && (
                            <>
                              <button 
                                onClick={() => openEditModal(component)}
                                className="text-yellow-600 hover:text-yellow-900 font-medium"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(component._id)}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                🗑️ Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Component Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Component</h3>
              <form onSubmit={handleAddComponent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={componentData.name}
                      onChange={(e) => setComponentData({ ...componentData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <input
                      type="text"
                      required
                      value={componentData.category}
                      onChange={(e) => setComponentData({ ...componentData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                    <input
                      type="text"
                      value={componentData.manufacturer}
                      onChange={(e) => setComponentData({ ...componentData, manufacturer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                    <input
                      type="text"
                      value={componentData.partNumber}
                      onChange={(e) => setComponentData({ ...componentData, partNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={componentData.quantity}
                      onChange={(e) => setComponentData({ ...componentData, quantity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Critical Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={componentData.criticalThreshold}
                      onChange={(e) => setComponentData({ ...componentData, criticalThreshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location Bin</label>
                    <input
                      type="text"
                      value={componentData.locationBin}
                      onChange={(e) => setComponentData({ ...componentData, locationBin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={componentData.unitPrice}
                      onChange={(e) => setComponentData({ ...componentData, unitPrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={componentData.description}
                    onChange={(e) => setComponentData({ ...componentData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Datasheet Link</label>
                  <input
                    type="url"
                    value={componentData.datasheetLink}
                    onChange={(e) => setComponentData({ ...componentData, datasheetLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setComponentData({
                        name: '',
                        category: '',
                        manufacturer: '',
                        partNumber: '',
                        description: '',
                        quantity: 0,
                        locationBin: '',
                        unitPrice: 0,
                        datasheetLink: '',
                        criticalThreshold: 0
                      });
                    }}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Add Component
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Component Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Component</h3>
              <form onSubmit={handleEditComponent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={componentData.name}
                      onChange={(e) => setComponentData({ ...componentData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <input
                      type="text"
                      required
                      value={componentData.category}
                      onChange={(e) => setComponentData({ ...componentData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                    <input
                      type="text"
                      value={componentData.manufacturer}
                      onChange={(e) => setComponentData({ ...componentData, manufacturer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                    <input
                      type="text"
                      value={componentData.partNumber}
                      onChange={(e) => setComponentData({ ...componentData, partNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={componentData.quantity}
                      onChange={(e) => setComponentData({ ...componentData, quantity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Critical Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={componentData.criticalThreshold}
                      onChange={(e) => setComponentData({ ...componentData, criticalThreshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location Bin</label>
                    <input
                      type="text"
                      value={componentData.locationBin}
                      onChange={(e) => setComponentData({ ...componentData, locationBin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={componentData.unitPrice}
                      onChange={(e) => setComponentData({ ...componentData, unitPrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={componentData.description}
                    onChange={(e) => setComponentData({ ...componentData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Datasheet Link</label>
                  <input
                    type="url"
                    value={componentData.datasheetLink}
                    onChange={(e) => setComponentData({ ...componentData, datasheetLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedComponent(null);
                      setComponentData({
                        name: '',
                        category: '',
                        manufacturer: '',
                        partNumber: '',
                        description: '',
                        quantity: 0,
                        locationBin: '',
                        unitPrice: 0,
                        datasheetLink: '',
                        criticalThreshold: 0
                      });
                    }}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Update Component
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Inward Modal */}
      {showInwardModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Log Inward</h3>
              <p className="text-sm text-gray-600 mb-4">Component: {selectedComponent?.name}</p>
              <form onSubmit={handleInward}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={modalData.quantity}
                    onChange={(e) => setModalData({ ...modalData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={modalData.reason}
                    onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="e.g., Restock, New shipment, etc."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInwardModal(false);
                      setModalData({ quantity: '', reason: '' });
                      setSelectedComponent(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Log Inward
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Outward Modal */}
      {showOutwardModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Log Outward</h3>
              <p className="text-sm text-gray-600 mb-4">Component: {selectedComponent?.name}</p>
              <p className="text-xs text-gray-500 mb-4">Available: {selectedComponent?.quantity} units</p>
              <form onSubmit={handleOutward}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedComponent?.quantity}
                    value={modalData.quantity}
                    onChange={(e) => setModalData({ ...modalData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={modalData.reason}
                    onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="e.g., Used for project, Issued to team, etc."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOutwardModal(false);
                      setModalData({ quantity: '', reason: '' });
                      setSelectedComponent(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Log Outward
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Inventory; 