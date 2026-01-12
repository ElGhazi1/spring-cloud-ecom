import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAlert } from '../contexts/AlertContext';

export const useOrders = (keycloak, apiBase, products, hasRole) => {
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [newOrder, setNewOrder] = useState({
        productId: '',
        productName: '',
        quantity: '1',
        totalPrice: '',
        status: 'PENDING'
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const alert = useAlert();

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            await keycloak.updateToken(30);
            console.log('[DEBUG] fetchOrders: roles=', keycloak.tokenParsed?.realm_access?.roles);
            const resp = await axios.get(`${apiBase}/orders`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            console.log('[DEBUG] fetchOrders response status=', resp.status);
            setOrders(Array.isArray(resp.data) ? resp.data : (resp.data?.content || []));
        } catch (e) {
            console.error('Erreur fetchOrders', e);
            const status = e?.response?.status;
            const server = e?.response?.data || e?.response?.statusText || e?.message;
            alert.error('Error', `Failed to fetch orders (${status}): ${typeof server === 'object' ? JSON.stringify(server) : server}`);
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleProductSelection = (e) => {
        const productId = e.target.value;
        const product = products.find(p => p.id === parseInt(productId));

        if (product) {
            setSelectedProduct(product);
            setNewOrder({
                ...newOrder,
                productId: productId,
                productName: product.name,
                totalPrice: (product.price * (newOrder.quantity || 1)).toFixed(2)
            });
        } else {
            setSelectedProduct(null);
            setNewOrder({
                ...newOrder,
                productId: '',
                productName: '',
                quantity: '1',
                totalPrice: '',
                status: 'PENDING'
            });
        }
    };

    const handleQuantityChange = (e) => {
        const quantity = e.target.value;
        const totalPrice = selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '';
        setNewOrder({
            ...newOrder,
            quantity: quantity,
            totalPrice: totalPrice
        });
    };

    const handleStatusChange = (e) => {
        setNewOrder({
            ...newOrder,
            status: e.target.value
        });
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            await keycloak.updateToken(30);

            if (editingOrderId) {
                // For update, send quantity and status (UpdateOrderRequestDTO)
                const updatePayload = {
                    quantity: parseInt(newOrder.quantity, 10),
                    status: newOrder.status || 'PENDING'
                };

                await axios.put(`${apiBase}/orders/${editingOrderId}`, updatePayload, {
                    headers: { Authorization: `Bearer ${keycloak.token}` }
                });
                alert.success('Success', 'Order updated successfully!');
                setEditingOrderId(null);
            } else {
                // For create, send CreateOrderRequestDTO (clientId extracted from JWT by backend)
                const createPayload = {
                    productId: newOrder.productId,
                    quantity: parseInt(newOrder.quantity, 10)
                };

                await axios.post(`${apiBase}/orders`, createPayload, {
                    headers: { Authorization: `Bearer ${keycloak.token}` }
                });
                alert.success('Success', 'Order created successfully!');
            }

            setNewOrder({ productId: '', productName: '', quantity: '1', totalPrice: '', status: 'PENDING' });
            setSelectedProduct(null);
            fetchOrders();
        } catch (e) {
            console.error('Erreur createOrder', e);
            const server = e?.response?.data || e?.response?.statusText || e?.message;
            const serverStr = typeof server === 'object' ? JSON.stringify(server) : server;
            alert.error('Error', `Failed to save order: ${serverStr}`);
        }
    };

    const editOrder = (o) => {
        const product = products.find(p => p.id === parseInt(o.productId));
        const unitPrice = product ? product.price : 0;
        const totalPrice = (unitPrice * o.quantity).toFixed(2);

        setSelectedProduct(product || null);
        setNewOrder({
            productId: o.productId,
            productName: product ? product.name : '',
            quantity: o.quantity,
            totalPrice: totalPrice,
            status: o.status || 'PENDING'
        });
        setEditingOrderId(o.id);
    };

    const handleDeleteOrder = async (id) => {
        try {
            await keycloak.updateToken(30);
            await axios.delete(`${apiBase}/orders/${id}`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            alert.success('Success', 'Order deleted successfully!');
            fetchOrders();
        } catch (e) {
            console.error('Erreur deleteOrder', e);
            alert.error('Error', 'Failed to delete order. Please try again.');
        }
    };

    const cancelOrderEdit = () => {
        setEditingOrderId(null);
        setNewOrder({ productId: '', productName: '', quantity: '1', totalPrice: '', status: 'PENDING' });
        setSelectedProduct(null);
    };

    useEffect(() => {
        const roles = keycloak.tokenParsed?.realm_access?.roles || [];
        if (keycloak.authenticated && (roles.includes('CLIENT') || roles.includes('ADMIN'))) {
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keycloak.authenticated, keycloak.tokenParsed?.realm_access?.roles?.length]);

    return {
        orders,
        loadingOrders,
        newOrder,
        selectedProduct,
        editingOrderId,
        handleProductSelection,
        handleQuantityChange,
        handleStatusChange,
        handleCreateOrder,
        editOrder,
        handleDeleteOrder,
        cancelOrderEdit,
        fetchOrders
    };
};

