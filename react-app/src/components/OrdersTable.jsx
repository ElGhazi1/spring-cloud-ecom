import React, { useState } from 'react';
import { Edit, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import ConfirmDialog from './ConfirmDialog';

const OrdersTable = ({ orders, loading, hasRole, onEdit, onDelete, products = [] }) => {
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, orderId: null, orderDetails: '' });

    // Helper function to get product details
    const getProductName = (productId) => {
        const product = products.find(p => p.id === parseInt(productId));
        return product ? product.name : productId;
    };

    const getProductPrice = (productId) => {
        const product = products.find(p => p.id === parseInt(productId));
        return product ? product.price : 0;
    };

    const calculateTotal = (order) => {
        const unitPrice = getProductPrice(order.productId);
        return (unitPrice * order.quantity).toFixed(2);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (status) => {
        if (!status) return <Badge variant="secondary">UNKNOWN</Badge>;

        const statusUpper = status.toUpperCase();
        const variants = {
            'PENDING': { variant: 'secondary', text: 'PENDING' },
            'PROCESSING': { variant: 'default', text: 'PROCESSING' },
            'CONFIRMED': { variant: 'default', text: 'CONFIRMED' },
            'SHIPPED': { variant: 'default', text: 'SHIPPED' },
            'DELIVERED': { variant: 'success', text: 'DELIVERED' },
            'CANCELLED': { variant: 'destructive', text: 'CANCELLED' },
            'COMPLETED': { variant: 'success', text: 'COMPLETED' },
        };

        const config = variants[statusUpper] || { variant: 'secondary', text: status };
        return <Badge variant={config.variant}>{config.text}</Badge>;
    };

    const handleDeleteClick = (order) => {
        const productName = getProductName(order.productId);
        const orderDetails = `Order #${order.id} - ${productName} (Qty: ${order.quantity})`;
        setDeleteConfirm({
            open: true,
            orderId: order.id,
            orderDetails: orderDetails
        });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm.orderId) {
            onDelete(deleteConfirm.orderId);
        }
        setDeleteConfirm({ open: false, orderId: null, orderDetails: '' });
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading orders...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No orders available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Total Price</TableHead>
                            <TableHead>Status</TableHead>
                            {hasRole('ADMIN') && <TableHead>User</TableHead>}
                            <TableHead>Created At</TableHead>
                            <TableHead>Updated At</TableHead>
                            {hasRole('ADMIN') && <TableHead>Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell className="font-medium">{getProductName(order.productId)}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell>{calculateTotal(order)} MAD</TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                {hasRole('ADMIN') && <TableCell>{order.clientId}</TableCell>}
                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                <TableCell>{formatDate(order.updatedAt)}</TableCell>
                                {hasRole('ADMIN') && (
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEdit(order)}
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteClick(order)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            <ConfirmDialog
                open={deleteConfirm.open}
                onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
                onConfirm={handleConfirmDelete}
                title="Delete Order"
                description={`Are you sure you want to delete ${deleteConfirm.orderDetails}? This action cannot be undone and will permanently remove this order from the system.`}
                confirmText="Delete Order"
                cancelText="Cancel"
            />
        </Card>
    );
};

export default OrdersTable;

