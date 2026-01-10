import axios from "axios";
import {useEffect, useState} from "react";

function App({ keycloak }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', price: '', quantity: '' });
    const [editingId, setEditingId] = useState(null);

    const apiBase = "http://localhost:8085";

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

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

            <br />
            <button onClick={() => keycloak.logout()}>
                Se déconnecter
            </button>
        </div>
    );
}

export default App;
