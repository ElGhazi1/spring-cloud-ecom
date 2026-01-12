import React, { useState, useEffect } from 'react';
import { Plus, Package, DollarSign, Hash } from 'lucide-react';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Card } from './ui/card';

// Order status values from backend OrderStatus enum
const ORDER_STATUSES = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
];

const OrderFormDialog = ({
    newOrder,
    editingOrderId,
    products,
    selectedProduct,
    onSubmit,
    onProductSelect,
    onQuantityChange,
    onStatusChange,
    onCancel,
    trigger,
    hasRole
}) => {
    const [open, setOpen] = useState(false);

    // Open dialog when editingOrderId is set OR when selectedProduct is set (for direct ordering)
    useEffect(() => {
        if (editingOrderId || (selectedProduct && newOrder.productId)) {
            setOpen(true);
        }
    }, [editingOrderId, selectedProduct, newOrder.productId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
        setOpen(false);
    };

    const handleCancel = () => {
        onCancel();
        setOpen(false);
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
            // If closing, cancel the order/edit
            onCancel();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Order
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {editingOrderId ? 'Edit Order' : 'Create New Order'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingOrderId
                                ? 'Update the order details below.'
                                : 'Select a product and quantity to create a new order.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="product">Product</Label>
                            <Select
                                id="product"
                                value={newOrder.productId}
                                onChange={onProductSelect}
                                required
                                disabled={editingOrderId}
                            >
                                <option value="">-- Select a product --</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} - {product.price} MAD (Stock: {product.quantity})
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {selectedProduct && (
                            <Card className="p-4 bg-muted/50">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-primary" />
                                        <span className="font-medium">Product:</span>
                                        <span>{selectedProduct.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Description:</span>
                                        <span>{selectedProduct.description || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-primary" />
                                        <span className="font-medium">Unit Price:</span>
                                        <span>{selectedProduct.price} MAD</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-primary" />
                                        <span className="font-medium">Available Stock:</span>
                                        <span>{selectedProduct.quantity}</span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                max={selectedProduct ? selectedProduct.quantity : undefined}
                                placeholder="Enter quantity"
                                value={newOrder.quantity}
                                onChange={onQuantityChange}
                                required
                                disabled={!selectedProduct}
                            />
                        </div>

                        {/* Status dropdown - only show for ADMIN users when editing */}
                        {hasRole && hasRole('ADMIN') && editingOrderId && (
                            <div className="grid gap-2">
                                <Label htmlFor="status">Order Status</Label>
                                <Select
                                    id="status"
                                    value={newOrder.status || 'PENDING'}
                                    onChange={onStatusChange}
                                    required
                                >
                                    {ORDER_STATUSES.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}

                        <div className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total to Pay:</span>
                                <span className="text-2xl font-bold">
                                    {newOrder.totalPrice || '0.00'} MAD
                                </span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedProduct || !newOrder.quantity}
                        >
                            {editingOrderId ? 'Save Changes' : 'Create Order'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default OrderFormDialog;

