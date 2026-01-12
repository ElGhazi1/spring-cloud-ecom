import React, { useState } from 'react';
import { Edit, Trash2, Package, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
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

const ProductsTable = ({ products, loading, hasRole, onEdit, onDelete, onOrder }) => {
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, productId: null, productName: '' });

    const handleDeleteClick = (product) => {
        setDeleteConfirm({
            open: true,
            productId: product.id,
            productName: product.name
        });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm.productId) {
            onDelete(deleteConfirm.productId);
        }
        setDeleteConfirm({ open: false, productId: null, productName: '' });
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading products...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!products || products.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No products available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.description}</TableCell>
                                <TableCell>{product.price} MAD</TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {/* Order button for both CLIENT and ADMIN */}
                                        {(hasRole('CLIENT') || hasRole('ADMIN')) && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => onOrder(product)}
                                                disabled={product.quantity === 0}
                                            >
                                                <ShoppingCart className="w-4 h-4 mr-1" />
                                                Order
                                            </Button>
                                        )}

                                        {/* Edit and Delete buttons only for ADMIN */}
                                        {hasRole('ADMIN') && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEdit(product)}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(product)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            <ConfirmDialog
                open={deleteConfirm.open}
                onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                description={`Are you sure you want to delete "${deleteConfirm.productName}"? This action cannot be undone and will permanently remove this product from the system.`}
                confirmText="Delete Product"
                cancelText="Cancel"
            />
        </Card>
    );
};

export default ProductsTable;

