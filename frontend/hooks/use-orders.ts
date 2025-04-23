import { useState, useEffect } from 'react';
import { orderService, Order, OrderFilter, CreateOrderData } from '@/lib/order-service';

export function useOrders(initialFilter?: OrderFilter) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderFilter | undefined>(initialFilter);

  // Fetch orders based on current filter
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getAllOrders(filter);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders by client
  const fetchOrdersByClient = async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrdersByClient(clientId);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching client orders:', err);
      setError('Failed to fetch client orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders by status
  const fetchOrdersByStatus = async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrdersByStatus(status);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders by status:', err);
      setError('Failed to fetch orders by status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders by material
  const fetchOrdersByMaterial = async (materialType: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrdersByMaterial(materialType);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders by material:', err);
      setError('Failed to fetch orders by material. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get a single order by ID
  const getOrderById = async (orderId: string): Promise<Order | null> => {
    try {
      setLoading(true);
      setError(null);
      const order = await orderService.getOrderById(orderId);
      return order;
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to fetch order details. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new order
  const createOrder = async (orderData: CreateOrderData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await orderService.createOrder(orderData);
      // Refresh orders list after creating a new order
      await fetchOrders();
      return result;
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing order
  const updateOrder = async (orderId: string, updateData: Partial<Order>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await orderService.updateOrder(orderId, updateData);
      // Refresh orders list after updating an order
      await fetchOrders();
      return updatedOrder;
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an order
  const deleteOrder = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      await orderService.deleteOrder(orderId);
      // Refresh orders list after deleting an order
      await fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update filter and fetch orders
  const updateFilter = async (newFilter: OrderFilter) => {
    setFilter(newFilter);
    await fetchOrders();
  };

  // Fetch orders on initial load and when filter changes
  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    filter,
    fetchOrders,
    fetchOrdersByClient,
    fetchOrdersByStatus,
    fetchOrdersByMaterial,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    updateFilter,
  };
} 