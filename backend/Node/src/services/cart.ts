import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { Cart, CartItem, Customer } from '../types/models/customer.js';
import { Product } from '../types/models/product.js';
import { getProduct } from './product.js';

const firestore = admin.firestore();
const customerCollection = FIREBASE_COLLECTIONS['customer'];

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

        // // Fetch product details to ensure it exists and to get current price
        const product = await getProduct(item.productId);
        if (!product) {
            throw new Error('Product not found, product ID: ' + item.productId);
        }

        // Find the variant
        const variant = product.variants.find((v: any) => v.id === item.variantId);
        if (!variant) {
            throw new Error('Product variant not found, variant ID: ' + item.variantId);
        }

        // Check if stock is available
        if (variant.stock < (item.quantity ?? 1)) {
            throw new Error('Not enough stock available' + ', product name: ' + product.name + ', available stock: ' + variant.stock + ', requested quantity: ' + (item.quantity ?? 1));
        }

        // Check if the item is already in the cart
        const existingItemIndex = currentCart.items.findIndex(
            cartItem => cartItem.productId === item.productId && cartItem.variantId === item.variantId
        );

        const updatedItems = [...currentCart.items];

        if (existingItemIndex >= 0) {
            // Update existing item
            const newQuantity = updatedItems[existingItemIndex].quantity + (item.quantity ?? 1);

            // Verify stock again with combined quantity
            if (variant.stock < newQuantity) {
                throw new Error(`Same product with same variant exists before, combinning their quantities results with no enough 
                    stock available for the combined quantities, product name: ${product.name}, 
                    available stock: ${variant.stock}, combined quantities: ${newQuantity}`);
            }

            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: newQuantity
            };
        } else {
            // Add new item
            const productImage = variant.images && variant.images.length > 0 ? variant.images[0] : product.variants[0].images[0];

            updatedItems.unshift({
                id: generateCartItemtId(),
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity ?? 1,
                brandName: product.brandName,
                productName: product.name,
                size: variant.size,
                colors: variant.colors,
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
    updates: { quantity: number }
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
        const product = await getProduct(currentItem.productId);
        if (!product) {
            throw new Error(`Product not found, product ID: ${currentItem.productId}`);
        }

        // Find the variant
        const variant = product.variants.find((v: any) => v.id === currentItem.variantId);
        if (!variant) {
            throw new Error(`Product variant not found, variant ID: ${currentItem.variantId}`);
        }

        let updatedItems = [...currentCart.items];
        // Check stock for the new quantity
        if (variant.stock < updates.quantity) {
            throw new Error('Not enough stock available, product name: ' + product.name + ', available stock: ' + variant.stock + ', requested quantity: ' + updates.quantity);
        }

        // Update item
        updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: updates.quantity,
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
        const emptyCart: Cart = {
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
