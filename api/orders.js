// Order Management API
// This file provides functions to handle purchase orders using JSON file storage

const ORDERS_FILE = '../data/purchase-orders.json';

// Load orders from JSON file
async function loadOrders() {
    try {
        // For local development, we'll use localStorage as primary storage
        // The JSON file will be used for server-side deployment
        if (typeof(Storage) !== "undefined") {
            const localStorageOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
            
            // If localStorage is empty, try to initialize with sample data
            if (localStorageOrders.length === 0) {
                // Try to fetch initial data from JSON file
                try {
                    const response = await fetch(ORDERS_FILE);
                    if (response.ok) {
                        const fileOrders = await response.json();
                        if (fileOrders.length > 0) {
                            localStorage.setItem('purchaseOrders', JSON.stringify(fileOrders));
                            return fileOrders;
                        }
                    }
                } catch (fileError) {
                    console.log('Could not load from file, using empty localStorage');
                }
            }
            
            return localStorageOrders;
        }
        
        return [];
    } catch (error) {
        console.error('Error loading orders:', error);
        return [];
    }
}

// Save order to localStorage (fallback for client-side only)
function saveOrderToLocalStorage(order) {
    if (typeof(Storage) !== "undefined") {
        let orders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
        orders.push(order);
        localStorage.setItem('purchaseOrders', JSON.stringify(orders));
        return true;
    }
    return false;
}

// Save order to JSON file (requires server-side handler)
async function saveOrder(order) {
    try {
        // For client-side only, we'll use localStorage as fallback
        // In a real server environment, this would make a POST request
        saveOrderToLocalStorage(order);
        
        // Also try to save to JSON file if server endpoint exists
        const response = await fetch('../api/save-order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order)
        });
        
        if (response.ok) {
            return { success: true, message: 'Order saved successfully' };
        }
    } catch (error) {
        console.log('Server save failed, using localStorage only:', error);
    }
    
    return { success: true, message: 'Order saved to localStorage' };
}

// Get all orders for admin dashboard
async function getAllOrders() {
    try {
        // Use the improved loadOrders function
        const orders = await loadOrders();
        return orders;
    } catch (error) {
        console.error('Error getting orders:', error);
        
        // Final fallback to localStorage
        if (typeof(Storage) !== "undefined") {
            return JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
        }
        
        return [];
    }
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        let orders = await getAllOrders();
        const orderIndex = orders.findIndex(order => order.orderId === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            
            // Update localStorage
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem('purchaseOrders', JSON.stringify(orders));
            }
            
            // Try to update JSON file if server endpoint exists
            try {
                const response = await fetch('../api/update-order.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderId, status, orders })
                });
                
                if (response.ok) {
                    return { success: true, message: 'Order status updated' };
                }
            } catch (serverError) {
                console.log('Server update failed, localStorage updated:', serverError);
            }
            
            return { success: true, message: 'Order status updated in localStorage' };
        }
        
        return { success: false, message: 'Order not found' };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, message: 'Failed to update order status' };
    }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadOrders,
        saveOrder,
        getAllOrders,
        updateOrderStatus
    };
}
