import React, { useState } from 'react';
import { Plus } from 'lucide-react';
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

const ProductFormDialog = ({ form, editingId, onSubmit, onChange, onCancel, trigger }) => {
    const [open, setOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
        setOpen(false);
    };

    const handleCancel = () => {
        onCancel();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Product
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Edit Product' : 'Create New Product'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingId
                                ? 'Update the product details below.'
                                : 'Fill in the details to create a new product.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter product name"
                                value={form.name}
                                onChange={e => onChange({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Enter description"
                                value={form.description}
                                onChange={e => onChange({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price (MAD)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={form.price}
                                    onChange={e => onChange({ ...form, price: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    placeholder="0"
                                    value={form.quantity}
                                    onChange={e => onChange({ ...form, quantity: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingId ? 'Save Changes' : 'Create Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductFormDialog;

