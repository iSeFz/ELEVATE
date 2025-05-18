import { admin } from '../config/firebase.js';
import { CartItem, Customer } from '../types/models/customer.js';
import { Product } from '../types/models/product.js';

const firestore = admin.firestore();
const customerCollection = 'customer';

// Cart-related functions
export const getCart = async (customerId: string) => {
    if (!customerId) {
        throw new Error('Please provide a customer ID');
    }

    try {
        const customerDoc = await firestore.collection(customerCollection).doc(customerId).get();

        if (!customerDoc.exists) {
            throw new Error('Customer not found');
        }

        const customerData = customerDoc.data() as Customer;
        return customerData.cart || { items: [], subtotal: 0, updatedAt: admin.firestore.Timestamp.now() };
    } catch (error: any) {
        throw new Error(`Failed to get cart: ${error.message}`);
    }
};

const generateCartItemtId = (): string => {
    return `cartItem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

export const addToCart = async (customerId: string, item: Partial<CartItem>) => {
    if (!customerId) {
        throw new Error('Please provide a customer ID');
    }

    if (!item.productId || !item.variantId) {
        throw new Error('Product ID and variant ID are required');
    }

    try {
        // Get customer document to access the current cart
        const customerRef = firestore.collection(customerCollection).doc(customerId);
        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
            throw new Error('Customer not found');
        }

        const customerData = customerDoc.data() as Customer;
        const currentCart = customerData.cart || { items: [], subtotal: 0, updatedAt: admin.firestore.Timestamp.now() };

        // Fetch product details to ensure it exists and to get current price
        const productRef = firestore.collection('product').doc(item.productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            throw new Error('Product not found, product ID: ' + item.productId);
        }

        const product = productDoc.data() as Product;

        // Find the variant
        const variant = product.variants.find((v: any) => v.id === item.variantId);
        if (!variant) {
            throw new Error('Product variant not found, variant ID: ' + item.variantId);
        }

        // Check if stock is available
        if (variant.stock < (item.quantity ?? 1)) {
            throw new Error('Not enough stock available' + ', product name: ' + product.name + ', available stock: ' + variant.stock + ', requested quantity: ' + (item.quantity ?? 1));
        }

        // Check if the selected color is valid
        if (item.color && !variant.colors.includes(item.color)) {
            throw new Error(`Selected color (${item.color}) is not available for this variant, product name: ${product.name}, available colors: ${variant.colors.join(', ')}`);
        }

        // Check if the item is already in the cart
        const existingItemIndex = currentCart.items.findIndex(
            cartItem => cartItem.productId === item.productId && cartItem.variantId === item.variantId && cartItem.color === (item.color ?? variant.colors[0])
        );

        const updatedItems = [...currentCart.items];

        if (existingItemIndex >= 0) {
            // Update existing item
            const newQuantity = updatedItems[existingItemIndex].quantity + (item.quantity ?? 1);

            // Verify stock again with combined quantity
            if (variant.stock < newQuantity) {
                throw new Error('Not enough stock available for the requested quantity' + ', product name: ' + product.name + ', available stock: ' + variant.stock + ', requested quantity: ' + newQuantity);
            }

            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: newQuantity
            };
        } else {
            // Add new item
            const selectedColor = item.color ?? variant.colors[0];
            const productImage = variant.images && variant.images.length > 0 ? variant.images[0] : '';

            updatedItems.unshift({
                id: generateCartItemtId(),
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity ?? 1,
                brandName: product.brandName,
                productName: product.name,
                size: variant.size,
                color: selectedColor,
                price: variant.price,
                imageURL: productImage
            });
        }

        // Calculate subtotal
        const subtotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Update cart
        const updatedCart = {
            items: updatedItems,
            subtotal,
            updatedAt: admin.firestore.Timestamp.now()
        };

        // Update customer document
        await customerRef.update({
            cart: updatedCart,
            updatedAt: admin.firestore.Timestamp.now()
        });

        return updatedCart;
    } catch (error: any) {
        throw new Error(`Failed to add item to cart: ${error.message}`);
    }
};

export const updateCartItem = async (
    customerId: string,
    cartItemId: string,
    updates: { quantity?: number; color?: string }
) => {
    if (!customerId) {
        throw new Error('Please provide a customer ID');
    }

    if (!cartItemId) {
        throw new Error('Cart item ID is required');
    }

    if (updates.quantity !== undefined && updates.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
    }

    if (updates.quantity === undefined && updates.color === undefined) {
        throw new Error('At least one of quantity or color must be provided');
    }

    try {
        // Get customer document to access the current cart
        const customerRef = firestore.collection(customerCollection).doc(customerId);
        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
            throw new Error('Customer not found');
        }

        const customerData = customerDoc.data() as Customer;
        const currentCart = customerData.cart || { items: [], subtotal: 0, updatedAt: admin.firestore.Timestamp.now() };

        // Find the item in the cart
        let itemIndex = currentCart.items.findIndex(item => item.id === cartItemId);

        if (itemIndex === -1) {
            throw new Error(`Item not found in cart, item ID: ${cartItemId}`);
        }

        const currentItem = currentCart.items[itemIndex];

        // Verify product and variant exist and check stock
        const productRef = firestore.collection('product').doc(currentItem.productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            throw new Error(`Product of this cart item not found, product name: ${currentItem.productName}, product ID: ${currentItem.productId}`);
        }

        const product = productDoc.data() as Product;

        // Find the variant
        const variant = product.variants.find((v: any) => v.id === currentItem.variantId);
        if (!variant) {
            throw new Error(`Product variant not found, variant ID: ${currentItem.variantId}`);
        }

        // If color is being updated, check if it's valid
        let newColor = currentItem.color;
        if (updates.color) {
            if (!variant.colors.includes(updates.color)) {
                throw new Error(`Selected color (${updates.color}) is not available for this variant, product name: ${product.name}, available colors: ${variant.colors.join(', ')}`);
            }
            newColor = updates.color;
        }

        // If color is changed, check if another cart item with same product, variant, and color exists
        let updatedItems = [...currentCart.items];
        let newQuantity = updates.quantity ?? currentItem.quantity;

        if (updates.color && updates.color !== currentItem.color) {
            const duplicateIndex = updatedItems.findIndex(
                (item, idx) =>
                    idx !== itemIndex &&
                    item.productId === currentItem.productId &&
                    item.variantId === currentItem.variantId &&
                    item.color === updates.color
            );
            if (duplicateIndex !== -1) {
                // Merge quantities
                newQuantity += updatedItems[duplicateIndex].quantity;
                // Remove the duplicate item
                updatedItems.splice(duplicateIndex, 1);
                // Adjust itemIndex if needed
                if (duplicateIndex < itemIndex) itemIndex--;
            }
        }

        // Check stock for the new quantity
        if (variant.stock < newQuantity) {
            throw new Error('Not enough stock available, product name: ' + product.name + ', available stock: ' + variant.stock + ', requested quantity: ' + newQuantity);
        }

        // Update item
        updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: newQuantity,
            color: newColor
        };

        // Calculate subtotal
        const subtotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Update cart
        const updatedCart = {
            items: updatedItems,
            subtotal,
            updatedAt: admin.firestore.Timestamp.now()
        };

        // Update customer document
        await customerRef.update({
            cart: updatedCart,
            updatedAt: admin.firestore.Timestamp.now()
        });

        return updatedCart;
    } catch (error: any) {
        throw new Error(`Failed to update cart item: ${error.message}`);
    }
};

export const removeFromCart = async (customerId: string, cartItemId: string) => {
    if (!customerId) {
        throw new Error('Please provide a customer ID');
    }

    if (!cartItemId) {
        throw new Error('Cart item ID is required');
    }

    try {
        // Get customer document to access the current cart
        const customerRef = firestore.collection(customerCollection).doc(customerId);
        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
            throw new Error('Customer not found');
        }

        const customerData = customerDoc.data() as Customer;
        const currentCart = customerData.cart || { items: [], subtotal: 0, updatedAt: admin.firestore.Timestamp.now() };

        // Find the item in the cart
        const itemIndex = currentCart.items.findIndex(item => item.id === cartItemId);

        if (itemIndex === -1) {
            throw new Error(`Item not found in cart, item ID: ${cartItemId}`);
        }

        // Remove item
        const updatedItems = currentCart.items.filter((_, index) => index !== itemIndex);

        // Calculate subtotal
        const subtotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Update cart
        const updatedCart = {
            items: updatedItems,
            subtotal,
            updatedAt: admin.firestore.Timestamp.now()
        };

        // Update customer document
        await customerRef.update({
            cart: updatedCart,
            updatedAt: admin.firestore.Timestamp.now()
        });

        return updatedCart;
    } catch (error: any) {
        throw new Error(`Failed to remove item from cart: ${error.message}`);
    }
};

export const clearCart = async (customerId: string) => {
    if (!customerId) {
        throw new Error('Please provide a customer ID');
    }

    try {
        const customerRef = firestore.collection(customerCollection).doc(customerId);
        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
            throw new Error('Customer not found');
        }

        // Create empty cart
        const emptyCart = {
            items: [],
            subtotal: 0,
            updatedAt: admin.firestore.Timestamp.now()
        };

        // Update customer document
        await customerRef.update({
            cart: emptyCart,
            updatedAt: admin.firestore.Timestamp.now()
        });

        return emptyCart;
    } catch (error: any) {
        throw new Error(`Failed to clear cart: ${error.message}`);
    }
};
