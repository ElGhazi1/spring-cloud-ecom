import React, { useState, useEffect } from 'react';
import { useProducts } from './hooks/useProducts';
import { useOrders } from './hooks/useOrders';
import ProductsTable from './components/ProductsTable';
import OrdersTable from './components/OrdersTable';
import ProductFormDialog from './components/ProductFormDialog';
import OrderFormDialog from './components/OrderFormDialog';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Edit, User, Mail, Shield, Package, ShoppingCart, LogOut } from 'lucide-react';

function App({ keycloak }) {
    const apiBase = process.env.API_BASE_URL || "http://localhost:8085";
    const hasRole = (role) => keycloak.tokenParsed?.realm_access?.roles?.includes(role);

    // Tab navigation state with URL hash support
    const [activeTab, setActiveTab] = useState('profile');

    // Initialize tab from URL hash on mount
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['profile', 'products', 'orders'].includes(hash)) {
            setActiveTab(hash);
        }
    }, []);

    // Update URL hash when tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        window.location.hash = tab;
    };

    // Use custom hooks
    const {
        products,
        loading,
        form,
        editingId,
        setForm,
        submitForm,
        editProduct,
        deleteProduct,
        cancelEdit
    } = useProducts(keycloak, apiBase);

    const {
        orders,
        loadingOrders,
        newOrder,
        selectedProduct,
        editingOrderId,
        handleProductSelection,
        handleQuantityChange,
        handleCreateOrder,
        editOrder,
        handleDeleteOrder,
        cancelOrderEdit
    } = useOrders(keycloak, apiBase, products, hasRole);

    // Handle ordering directly from product table
    const handleOrderFromProduct = (product) => {
        // Set the product for the order
        const event = { target: { value: product.id.toString() } };
        handleProductSelection(event);

        // Switch to orders tab
        handleTabChange('orders');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
                                    E-Commerce Platform
                                </h1>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => keycloak.logout()}
                                className="w-full md:w-auto"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="profile">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="products">
                            <Package className="w-4 h-4 mr-2" />
                            Products
                        </TabsTrigger>
                        {(hasRole('CLIENT') || hasRole('ADMIN')) && (
                            <TabsTrigger value="orders">
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Orders
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4">
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                                        <User className="w-5 h-5 text-purple-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Username</p>
                                            <p className="text-lg font-semibold">{keycloak.idTokenParsed?.preferred_username}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                                        <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                                            <p className="text-lg font-semibold">{keycloak.idTokenParsed?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                                        <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Roles</p>
                                            <div className="flex flex-wrap gap-2">
                                                {keycloak.tokenParsed?.realm_access?.roles?.map(role => (
                                                    <Badge key={role} variant="default" className="text-sm">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Products Tab */}
                    <TabsContent value="products">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-semibold">Products</h2>
                                {hasRole('ADMIN') && (
                                    <ProductFormDialog
                                        form={form}
                                        editingId={editingId}
                                        onSubmit={submitForm}
                                        onChange={setForm}
                                        onCancel={cancelEdit}
                                        trigger={
                                            editingId ? (
                                                <Button variant="outline">
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Product
                                                </Button>
                                            ) : null
                                        }
                                    />
                                )}
                            </div>

                            <ProductsTable
                                products={products}
                                loading={loading}
                                hasRole={hasRole}
                                onEdit={editProduct}
                                onDelete={deleteProduct}
                                onOrder={handleOrderFromProduct}
                            />

                            {/* Order dialog for ordering from Products tab */}
                            {(hasRole('CLIENT') || hasRole('ADMIN')) && (
                                <OrderFormDialog
                                    newOrder={newOrder}
                                    editingOrderId={null}
                                    products={products}
                                    selectedProduct={selectedProduct}
                                    onSubmit={handleCreateOrder}
                                    onProductSelect={handleProductSelection}
                                    onQuantityChange={handleQuantityChange}
                                    onCancel={cancelOrderEdit}
                                    trigger={<div style={{ display: 'none' }} />}
                                />
                            )}
                        </div>
                    </TabsContent>

                    {/* Orders Tab */}
                    {(hasRole('CLIENT') || hasRole('ADMIN')) && (
                        <TabsContent value="orders">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-semibold">Orders</h2>
                                    {hasRole('CLIENT') && !editingOrderId && (
                                        <OrderFormDialog
                                            newOrder={newOrder}
                                            editingOrderId={editingOrderId}
                                            products={products}
                                            selectedProduct={selectedProduct}
                                            onSubmit={handleCreateOrder}
                                            onProductSelect={handleProductSelection}
                                            onQuantityChange={handleQuantityChange}
                                            onCancel={cancelOrderEdit}
                                        />
                                    )}
                                </div>

                                <OrdersTable
                                    orders={orders}
                                    loading={loadingOrders}
                                    hasRole={hasRole}
                                    onEdit={editOrder}
                                    onDelete={handleDeleteOrder}
                                    products={products}
                                />

                                {/* Hidden dialog for editing orders (opens when editOrder is called) */}
                                {editingOrderId && (
                                    <OrderFormDialog
                                        newOrder={newOrder}
                                        editingOrderId={editingOrderId}
                                        products={products}
                                        selectedProduct={selectedProduct}
                                        onSubmit={handleCreateOrder}
                                        onProductSelect={handleProductSelection}
                                        onQuantityChange={handleQuantityChange}
                                        onCancel={cancelOrderEdit}
                                        trigger={<div style={{ display: 'none' }} />}
                                    />
                                )}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}

export default App;

