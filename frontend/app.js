// Restaurant Menu Manager - Main Application Logic

// ============================================
// Configuration
// ============================================
let API_CONFIG = {
  BASE_URL: null,
  
  // API Endpoints
  ENDPOINTS: {
      GET_ALL_ITEMS: '/api/menu',
      GET_ITEM: '/api/menu',         // Append /{id} when calling
      CREATE_ITEM: '/api/menu',
      UPDATE_ITEM: '/api/menu',      // Append /{id} when calling
      DELETE_ITEM: '/api/menu'       // Append /{id} when calling
  }
};

// Load configuration from server
async function loadConfig() {
  try {
      const response = await fetch('/api/config');
      if (response.ok) {
          const config = await response.json();
          API_CONFIG.BASE_URL = config.backendApiUrl;
          console.log('Backend API configured:', API_CONFIG.BASE_URL);
      }
  } catch (error) {
      console.warn('Failed to load config from server:', error);
  }
}

// Helper function to build full URL
function getApiUrl(endpoint, id = null) {
  const baseUrl = API_CONFIG.BASE_URL;
  if (!baseUrl) {
      throw new Error('Backend API URL is not configured');
  }
  const path = API_CONFIG.ENDPOINTS[endpoint];
  
  if (id) {
      return `${baseUrl}${path}/${id}`;
  }
  
  return `${baseUrl}${path}`;
}

// ============================================
// Application State
// ============================================
let currentItems = [];
let editingItemId = null;

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Load configuration first
  await loadConfig();

  // Load items on page load
  loadMenuItems();
  
  // Form submission
  document.getElementById('item-form').addEventListener('submit', handleFormSubmit);
  
  // Refresh button
  document.getElementById('refresh-btn').addEventListener('click', loadMenuItems);
  
  // Cancel edit button
  document.getElementById('cancel-btn').addEventListener('click', cancelEdit);
});

// Load all menu items from API
async function loadMenuItems() {
  showLoading(true);
  hideError();
  
  try {
      const response = await fetch(getApiUrl('GET_ALL_ITEMS'));
      
      if (!response.ok) {
          throw new Error(`Failed to load items: ${response.status} ${response.statusText}`);
      }
      
      const items = await response.json();
      currentItems = items;
      
      displayMenuItems(items);
      showLoading(false);
      
  } catch (error) {
      console.error('Error loading items:', error);
      showError(`Failed to load menu items. ${error.message}`);
      showLoading(false);
  }
}

// Display menu items in table
function displayMenuItems(items) {
  const tableBody = document.getElementById('items-table-body');
  const tableContainer = document.getElementById('items-table-container');
  const emptyState = document.getElementById('empty-state');
  
  // Clear existing items
  tableBody.innerHTML = '';
  
  if (items.length === 0) {
      tableContainer.classList.add('d-none');
      emptyState.classList.remove('d-none');
      return;
  }
  
  emptyState.classList.add('d-none');
  tableContainer.classList.remove('d-none');
  
  items.forEach(item => {
      const row = createTableRow(item);
      tableBody.appendChild(row);
  });
}

// Create table row for an item
function createTableRow(item) {
  const row = document.createElement('tr');
  
  const statusClass = item.available ? 'status-available' : 'status-unavailable';
  const statusText = item.available ? 'Available' : 'Unavailable';
  
  row.innerHTML = `
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td>${escapeHtml(item.category)}</td>
      <td>${escapeHtml(item.description)}</td>
      <td class="price-display">$${parseFloat(item.price).toFixed(2)}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td>
          <button class="btn btn-sm btn-success btn-action" onclick="editItem('${item.id}')">
              Edit
          </button>
          <button class="btn btn-sm btn-danger btn-action" onclick="deleteItem('${item.id}')">
              Delete
          </button>
      </td>
  `;
  
  return row;
}

// Handle form submission (Create or Update)
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const itemData = {
      name: document.getElementById('item-name').value.trim(),
      category: document.getElementById('item-category').value,
      description: document.getElementById('item-description').value.trim(),
      price: parseFloat(document.getElementById('item-price').value),
      available: document.getElementById('item-available').checked
  };
  
  const isEditing = editingItemId !== null;
  
  showSubmitLoading(true);
  
  try {
      let response;
      
      if (isEditing) {
          // Update existing item
          response = await fetch(getApiUrl('UPDATE_ITEM', editingItemId), {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(itemData)
          });
      } else {
          // Create new item
          response = await fetch(getApiUrl('CREATE_ITEM'), {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(itemData)
          });
      }
      
      if (!response.ok) {
          throw new Error(`Failed to ${isEditing ? 'update' : 'create'} item: ${response.status}`);
      }
      
      // Reset form and reload items
      resetForm();
      await loadMenuItems();
      
      showSuccess(`Item ${isEditing ? 'updated' : 'created'} successfully!`);
      showSubmitLoading(false);
      
  } catch (error) {
      console.error('Error saving item:', error);
      showError(`Failed to ${isEditing ? 'update' : 'create'} item. ${error.message}`);
      showSubmitLoading(false);
  }
}

// Edit item
function editItem(itemId) {
  const item = currentItems.find(i => i.id === itemId);
  
  if (!item) {
      showError('Item not found');
      return;
  }
  
  // Populate form with item data
  editingItemId = itemId;
  document.getElementById('item-id').value = item.id;
  document.getElementById('item-name').value = item.name;
  document.getElementById('item-category').value = item.category;
  document.getElementById('item-description').value = item.description;
  document.getElementById('item-price').value = item.price;
  document.getElementById('item-available').checked = item.available;
  
  // Update form UI
  document.getElementById('form-title').textContent = 'Edit Menu Item';
  document.getElementById('submit-btn').textContent = 'Update Item';
  document.getElementById('cancel-btn').classList.remove('d-none');
  
  // Scroll to form
  document.getElementById('item-form').scrollIntoView({ behavior: 'smooth' });
}

// Delete item
async function deleteItem(itemId) {
  if (!confirm('Are you sure you want to delete this item?')) {
      return;
  }
  
  try {
      const response = await fetch(getApiUrl('DELETE_ITEM', itemId), {
          method: 'DELETE'
      });
      
      if (!response.ok) {
          throw new Error(`Failed to delete item: ${response.status}`);
      }
      
      await loadMenuItems();
      showSuccess('Item deleted successfully!');
      
  } catch (error) {
      console.error('Error deleting item:', error);
      showError(`Failed to delete item. ${error.message}`);
  }
}

// Cancel edit mode
function cancelEdit() {
  resetForm();
}

// Reset form to initial state
function resetForm() {
  editingItemId = null;
  document.getElementById('item-form').reset();
  document.getElementById('form-title').textContent = 'Add New Menu Item';
  document.getElementById('submit-btn').textContent = 'Add Item';
  document.getElementById('cancel-btn').classList.add('d-none');
  document.getElementById('item-available').checked = true;
  
  // Ensure button is enabled and spinner is hidden
  const submitBtn = document.getElementById('submit-btn');
  const spinner = document.getElementById('submit-spinner');
  if (submitBtn) submitBtn.disabled = false;
  if (spinner) spinner.classList.add('d-none');
}

// UI Helper Functions
function showLoading(show) {
  const loadingState = document.getElementById('loading-state');
  const refreshSpinner = document.getElementById('refresh-spinner');
  
  if (!loadingState || !refreshSpinner) return;
  
  if (show) {
      loadingState.classList.remove('d-none');
      refreshSpinner.classList.remove('d-none');
  } else {
      loadingState.classList.add('d-none');
      refreshSpinner.classList.add('d-none');
  }
}

function showSubmitLoading(show) {
  const spinner = document.getElementById('submit-spinner');
  const submitBtn = document.getElementById('submit-btn');
  
  if (!spinner || !submitBtn) return;
  
  if (show) {
      spinner.classList.remove('d-none');
      submitBtn.disabled = true;
  } else {
      spinner.classList.add('d-none');
      submitBtn.disabled = false;
  }
}

function showError(message) {
  const errorState = document.getElementById('error-state');
  const errorMessage = document.getElementById('error-message');
  
  if (!errorState || !errorMessage) return;
  
  errorMessage.textContent = message;
  errorState.classList.remove('d-none');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
      hideError();
  }, 5000);
}

function hideError() {
  const errorState = document.getElementById('error-state');
  if (errorState) {
      errorState.classList.add('d-none');
  }
}

function showSuccess(message) {
  // Create success alert if it doesn't exist
  let successState = document.getElementById('success-state');
  
  if (!successState) {
      successState = document.createElement('div');
      successState.id = 'success-state';
      successState.className = 'alert alert-success';
      const errorState = document.getElementById('error-state');
      errorState.parentNode.insertBefore(successState, errorState);
  }
  
  successState.innerHTML = `<strong>Success:</strong> ${message}`;
  successState.classList.remove('d-none');
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
      successState.classList.add('d-none');
  }, 3000);
}

// Utility Functions
function escapeHtml(text) {
  const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Export functions for inline onclick handlers
window.editItem = editItem;
window.deleteItem = deleteItem;