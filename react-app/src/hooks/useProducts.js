import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAlert } from '../contexts/AlertContext';

export const useProducts = (keycloak, apiBase) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', price: '', quantity: '' });
    const [editingId, setEditingId] = useState(null);
    const alert = useAlert();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            await keycloak.updateToken(30);
            const response = await axios.get(`${apiBase}/products`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            const data = response.data;
            if (Array.isArray(data)) {
                setProducts(data);
            } else if (data && Array.isArray(data.content)) {
                setProducts(data.content);
            } else {
                console.warn('Unexpected products response shape:', data);
                setProducts([]);
            }
        } catch (e) {
            console.error(e);
            alert.error('Error', 'Failed to fetch products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            await keycloak.updateToken(30);
            const payload = {
                name: form.name,
                description: form.description,
                price: parseFloat(form.price),
                quantity: parseInt(form.quantity, 10)
            };

            if (editingId) {
                await axios.put(`${apiBase}/products/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${keycloak.token}` }
                });
                alert.success('Success', 'Product updated successfully!');
                setEditingId(null);
            } else {
                await axios.post(`${apiBase}/products`, payload, {
                    headers: { Authorization: `Bearer ${keycloak.token}` }
                });
                alert.success('Success', 'Product created successfully!');
            }

            setForm({ name: '', description: '', price: '', quantity: '' });
            fetchProducts();
        } catch (e) {
            console.error(e);
            const server = e?.response?.data || e?.response?.statusText || e?.message;
            const serverStr = typeof server === 'object' ? JSON.stringify(server) : server;
            alert.error('Error', `Failed to save product: ${serverStr}`);
        }
    };

    const editProduct = (p) => {
        setForm({ name: p.name, description: p.description, price: p.price, quantity: p.quantity });
        setEditingId(p.id);
    };

    const deleteProduct = async (id) => {
        try {
            await keycloak.updateToken(30);
            await axios.delete(`${apiBase}/products/${id}`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            alert.success('Success', 'Product deleted successfully!');
            fetchProducts();
        } catch (e) {
            console.error(e);
            alert.error('Error', 'Failed to delete product. Please try again.');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({ name: '', description: '', price: '', quantity: '' });
    };

    useEffect(() => {
        if (keycloak.authenticated) {
            fetchProducts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keycloak.authenticated]);

    return {
        products,
        loading,
        form,
        editingId,
        setForm,
        submitForm,
        editProduct,
        deleteProduct,
        cancelEdit,
        fetchProducts
    };
};

