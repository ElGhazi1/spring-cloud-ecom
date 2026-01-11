import axios from "axios";
import {useEffect, useState} from "react";

function App({ keycloak }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', price: '', quantity: '' });
    const [editingId, setEditingId] = useState(null);

    const apiBase = process.env.API_BASE_URL || "http://localhost:8085";

    async function fetchProducts() {
        setLoading(true);
        try {
            await keycloak.updateToken(30);
            const response = await axios.get(`${apiBase}/products`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            const data = response.data;
            // Normalize response to an array to avoid runtime errors
            if (Array.isArray(data)) {
                setProducts(data);
            } else if (data && Array.isArray(data.content)) { // handle pageable responses
                setProducts(data.content);
            } else {
                console.warn('Unexpected products response shape:', data);
                setProducts([]);
            }
        } catch (e) {
            console.error(e);
            alert('Erreur lors de la récupération des produits');
        } finally {
            setLoading(false);
        }
    }

    // Orders state and operations
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [newOrder, setNewOrder] = useState({ productName: '', quantity: '', totalPrice: '' });
    const [editingOrderId, setEditingOrderId] = useState(null);
    const hasRole = (role) => keycloak.tokenParsed?.realm_access?.roles?.includes(role);

    async function fetchOrders() {
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
            alert(`Erreur lors de la récupération des commandes (${status}): ${JSON.stringify(server)}`);
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    }

    useEffect(() => {
        fetchProducts();
        const roles = keycloak.tokenParsed?.realm_access?.roles || [];
        if (keycloak.authenticated && (roles.includes('CLIENT') || roles.includes('ADMIN'))) {
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keycloak.authenticated, keycloak.tokenParsed?.realm_access?.roles?.length]);

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            await keycloak.updateToken(30);
            const payload = {
                name: form.name,
                description: form.description,
                // convert to numeric types to match backend model
                price: parseFloat(form.price),
                quantity: parseInt(form.quantity, 10)
            };

            if (editingId) {
                await axios.put(`${apiBase}/products/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${keycloak.token}` }
                });
                setEditingId(null);
            } else {
                await axios.post(`${apiBase}/products`, payload, {
                    headers: { Authorization: `Bearer ${keycloak.token}` }
                });
            }

            setForm({ name: '', description: '', price: '', quantity: '' });
            fetchProducts();
        } catch (e) {
            console.error(e);
            const server = e?.response?.data || e?.response?.statusText || e?.message;
            const serverStr = typeof server === 'object' ? JSON.stringify(server) : server;
            alert(`Erreur lors de l'enregistrement: ${serverStr}`);
        }
    };

    const editProduct = (p) => {
        setForm({ name: p.name, description: p.description, price: p.price, quantity: p.quantity });
        setEditingId(p.id);
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Supprimer ce produit ?')) return;
        try {
            await keycloak.updateToken(30);
            await axios.delete(`${apiBase}/products/${id}`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            fetchProducts();
        } catch (e) {
            console.error(e);
            alert('Erreur lors de la suppression');
        }
    };

    // Orders handlers
    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            await keycloak.updateToken(30);
            const payload = {
                productName: newOrder.productName,
                quantity: parseInt(newOrder.quantity, 10),
                // backend expects `price`; frontend collects `totalPrice`
                price: parseFloat(newOrder.totalPrice)
            };

            if (editingOrderId) {
                await axios.put(`${apiBase}/orders/${editingOrderId}`, payload, {
                    headers: { Authorization: `Bearer ${keycloak.token}` }
                });
                setEditingOrderId(null);
            } else {
                await axios.post(`${apiBase}/orders`, payload, {
                    headers: { Authorization: `Bearer ${keycloak.token}` }
                });
            }

            setNewOrder({ productName: '', quantity: '', totalPrice: '' });
            fetchOrders();
        } catch (e) {
            console.error('Erreur createOrder', e);
            const server = e?.response?.data || e?.response?.statusText || e?.message;
            const serverStr = typeof server === 'object' ? JSON.stringify(server) : server;
            alert(`Erreur lors de l'enregistrement: ${serverStr}`);
        }
    };

    const editOrder = (o) => {
        setNewOrder({ productName: o.productName, quantity: o.quantity, totalPrice: o.price });
        setEditingOrderId(o.id);
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm('Supprimer cette commande ?')) return;
        try {
            await keycloak.updateToken(30);
            await axios.delete(`${apiBase}/orders/${id}`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            fetchOrders();
        } catch (e) {
            console.error('Erreur deleteOrder', e);
            alert('Erreur lors de la suppression');
        }
    };

    return (
        <div style={{ padding: "30px", fontFamily: "Arial" }}>
            <h2>React + Keycloak + API Gateway</h2>

            <p>
                Utilisateur : <b>{keycloak.idTokenParsed?.preferred_username}</b>
            </p>
            <p>
                Email : <b>{keycloak.idTokenParsed?.email}</b>
            </p>
            <p>
                Rôles : <b> {keycloak.tokenParsed?.realm_access?.roles?.join(", ")}</b>
            </p>

            <div style={{ marginTop: 20 }}>
                <h3>Produits</h3>
                {loading ? <div>Chargement...</div> : (
                    <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse' }}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Description</th>
                            <th>Prix</th>
                            <th>Quantité</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(products) ? products.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.name}</td>
                                <td>{p.description}</td>
                                <td>{p.price}</td>
                                <td>{p.quantity}</td>
                                <td>
                                    {keycloak.tokenParsed?.realm_access?.roles?.includes('ADMIN') && (
                                        <>
                                            <button onClick={() => editProduct(p)}>Edit</button>
                                            <button onClick={() => deleteProduct(p.id)} style={{ marginLeft: 8 }}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : <tr><td colSpan={6}>Aucun produit</td></tr>}
                        </tbody>
                    </table>
                )}

                {keycloak.tokenParsed?.realm_access?.roles?.includes('ADMIN') && (
                    <>
                        <h4 style={{ marginTop: 20 }}>{editingId ? 'Modifier produit' : 'Créer produit'}</h4>
                        <form onSubmit={submitForm} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
                            <input placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                            <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                            <input placeholder="Prix" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                            <input placeholder="Quantité" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
                            <div>
                                <button type="submit">{editingId ? 'Enregistrer' : 'Créer'}</button>
                                {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', description: '', price: '', quantity: '' }); }} style={{ marginLeft: 8 }}>Annuler</button>}
                            </div>
                        </form>
                    </>
                )}
            </div>

            <div className="section" style={{ marginTop: 20 }}>
                <h3>Commandes</h3>
                {loadingOrders ? <div>Chargement...</div> : (
                    <table className="data-table" border={1} cellPadding={8} style={{ borderCollapse: 'collapse' }}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Prix Total</th>
                            {hasRole('ADMIN') && <th>Utilisateur</th>}
                            <th>Date</th>
                            {hasRole('ADMIN') && <th>Actions</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(orders) && orders.length > 0 ? orders.map(o => (
                            <tr key={o.id}>
                                <td>{o.id}</td>
                                <td>{o.productName}</td>
                                <td>{o.quantity}</td>
                                <td>{o.price}</td>
                                {hasRole('ADMIN') && <td>{o.username}</td>}
                                <td>{o.createdAt || '-'}</td>
                                <td>
                                    {hasRole('ADMIN') ? (
                                        <>
                                            <button className="btn-primary" onClick={() => editOrder(o)}>Edit</button>
                                            <button className="btn-danger" onClick={() => handleDeleteOrder(o.id)} style={{ marginLeft: 8 }}>Delete</button>
                                        </>
                                    ) : '-'}
                                </td>
                            </tr>
                        )) : <tr><td colSpan={hasRole('ADMIN') ? 7 : 5}>Aucune commande</td></tr>}
                        </tbody>
                    </table>
                )}

                {hasRole('CLIENT') && (
                    <>
                        <h4 style={{ marginTop: 20 }}>{editingOrderId ? 'Modifier commande' : 'Créer commande'}</h4>
                        <form onSubmit={handleCreateOrder} className="form" style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
                            <input className="input" placeholder="Produit" value={newOrder.productName} onChange={e => setNewOrder({...newOrder, productName: e.target.value})} required />
                            <input className="input" placeholder="Quantité" type="number" value={newOrder.quantity} onChange={e => setNewOrder({...newOrder, quantity: e.target.value})} required />
                            <input className="input" placeholder="Prix Total" value={newOrder.totalPrice} onChange={e => setNewOrder({...newOrder, totalPrice: e.target.value})} required />
                            <div>
                                <button type="submit" className="btn-primary">{editingOrderId ? 'Enregistrer' : 'Créer'}</button>
                                {editingOrderId && <button type="button" onClick={() => { setEditingOrderId(null); setNewOrder({ productName: '', quantity: '', totalPrice: '' }); }} className="btn-primary" style={{ marginLeft: 8 }}>Annuler</button>}
                            </div>
                        </form>
                    </>
                )}
            </div>

            <br />
            <button onClick={() => keycloak.logout()}>
                Se déconnecter
            </button>
        </div>
    );
}

export default App;
