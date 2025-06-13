/**
 * Schema validation utilities for checking if objects conform to expected structures
 * Supports nested objects, arrays, and comprehensive validation rules
 */

/**
 * Type representing a schema field definition
 */
export interface SchemaField {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    value?: any; // Default value for the field
    fields?: Record<string, SchemaField>; // For nested objects
    items?: SchemaField; // For array item validation
    minLength?: number; // For arrays and strings
    maxLength?: number; // For arrays and strings
}

/**
 * Schema definition interface
 */
export interface Schema {
    [key: string]: SchemaField;
}

/**
 * Validation result interface with detailed error reporting
 */
export interface ValidationResult {
    isValid: boolean;
    missingFields: string[];
    invalidFields: string[];
    extraFields: string[];
    errorDetails?: string[];
    schemaExample?: any;
}

/**
 * Checks if a value matches the expected type and constraints
 * @param value - The value to validate
 * @param fieldSchema - The schema definition for the field
 * @returns boolean indicating if the value is valid
 */
function isValidType(value: any, fieldSchema: SchemaField): boolean {
    const { type, items, minLength, maxLength } = fieldSchema;

    switch (type) {
        case 'string':
            if (typeof value !== 'string') return false;
            if (minLength !== undefined && value.length < minLength) return false;
            if (maxLength !== undefined && value.length > maxLength) return false;
            return true;

        case 'number':
            return typeof value === 'number' && !isNaN(value) && isFinite(value);

        case 'boolean':
            return typeof value === 'boolean';

        case 'object':
            return typeof value === 'object' && value !== null && !Array.isArray(value);

        case 'array':
            if (!Array.isArray(value)) return false;
            if (minLength !== undefined && value.length < minLength) return false;
            if (maxLength !== undefined && value.length > maxLength) return false;

            // Validate array items if schema is provided
            if (items) {
                return value.every(item => isValidType(item, items));
            }
            return true;

        default:
            return false;
    }
}

/**
 * Validates nested objects recursively with support for arrays of objects
 * @param obj - The object to validate
 * @param schema - The schema definition
 * @param path - Current validation path for error reporting
 * @returns Validation results with missing and invalid fields
 */
function validateNestedObject(
    obj: any,
    schema: Record<string, SchemaField>,
    path: string = ''
): {
    missingFields: string[];
    invalidFields: string[];
    errorDetails: string[];
} {
    const missingFields: string[] = [];
    const invalidFields: string[] = [];
    const errorDetails: string[] = [];

    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
        const fieldPath = path ? `${path}.${fieldName}` : fieldName;
        const fieldValue = obj[fieldName];

        // Check if required field is missing
        if (fieldSchema.required !== false && (fieldValue === undefined || fieldValue === null)) {
            missingFields.push(fieldPath);
            errorDetails.push(`Required field '${fieldPath}' is missing`);
            continue;
        }

        // Skip validation if field is not present and not required
        if (fieldValue === undefined || fieldValue === null) {
            continue;
        }

        // Validate field type and constraints
        if (!isValidType(fieldValue, fieldSchema)) {
            invalidFields.push(fieldPath);

            // Add detailed error message
            if (fieldSchema.type === 'string' && typeof fieldValue === 'string') {
                if (fieldSchema.minLength && fieldValue.length < fieldSchema.minLength) {
                    errorDetails.push(`Field '${fieldPath}' must be at least ${fieldSchema.minLength} characters long`);
                }
                if (fieldSchema.maxLength && fieldValue.length > fieldSchema.maxLength) {
                    errorDetails.push(`Field '${fieldPath}' must be at most ${fieldSchema.maxLength} characters long`);
                }
            } else if (fieldSchema.type === 'array' && Array.isArray(fieldValue)) {
                if (fieldSchema.minLength && fieldValue.length < fieldSchema.minLength) {
                    errorDetails.push(`Array '${fieldPath}' must have at least ${fieldSchema.minLength} items`);
                }
                if (fieldSchema.maxLength && fieldValue.length > fieldSchema.maxLength) {
                    errorDetails.push(`Array '${fieldPath}' must have at most ${fieldSchema.maxLength} items`);
                }
            } else {
                errorDetails.push(`Field '${fieldPath}' must be of type '${fieldSchema.type}'`);
            }
            continue;
        }

        // Validate nested object
        if (fieldSchema.type === 'object' && fieldSchema.fields) {
            const nestedValidation = validateNestedObject(fieldValue, fieldSchema.fields, fieldPath);
            missingFields.push(...nestedValidation.missingFields);
            invalidFields.push(...nestedValidation.invalidFields);
            errorDetails.push(...nestedValidation.errorDetails);
        }

        // Validate array of objects
        if (fieldSchema.type === 'array' && fieldSchema.items?.type === 'object' && fieldSchema.items.fields) {
            if (Array.isArray(fieldValue)) {
                fieldValue.forEach((item, index) => {
                    const itemPath = `${fieldPath}[${index}]`;
                    const itemValidation = validateNestedObject(item, fieldSchema.items!.fields!, itemPath);
                    missingFields.push(...itemValidation.missingFields);
                    invalidFields.push(...itemValidation.invalidFields);
                    errorDetails.push(...itemValidation.errorDetails);
                });
            }
        }
    }

    return { missingFields, invalidFields, errorDetails };
}

/**
 * Utility function to validate email format
 * @param email - Email string to validate
 * @returns boolean indicating if email format is valid
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Utility function to validate phone number format (basic validation)
 * @param phone - Phone number string to validate
 * @returns boolean indicating if phone format is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
}

/**
 * Generates a dummy value based on the field type
 * @param fieldSchema - The schema field definition
 * @returns A dummy value matching the expected type
 */
function generateDummyValue(fieldSchema: SchemaField): any {
    const { type, items, fields, value } = fieldSchema;

    if (value !== undefined) {
        return value; // Return default value if provided
    }

    switch (type) {
        case 'string':
            return "String";

        case 'number':
            return 0;

        case 'boolean':
            return false;

        case 'object':
            if (fields) {
                const dummyObject: any = {};
                for (const [key, nestedField] of Object.entries(fields)) {
                    dummyObject[key] = generateDummyValue(nestedField);
                }
                return dummyObject;
            }
            return {};

        case 'array':
            if (items) {
                // Return array with one dummy item
                return [generateDummyValue(items)];
            }
            return [];

        default:
            return null;
    }
}

/**
 * Generates a schema example object with dummy values
 * Shows the expected structure and types for API documentation
 * @param schema - The schema definition
 * @param includeOptional - Whether to include optional fields (default: true)
 * @returns Object with dummy values matching the schema structure
 */
export function generateSchemaExample(schema: Schema, includeOptional: boolean = true): any {
    const example: any = {};

    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
        // Skip optional fields if includeOptional is false
        if (!includeOptional && fieldSchema.required === false) {
            continue;
        }

        example[fieldName] = generateDummyValue(fieldSchema);
    }

    return example;
}

/**
 * STRICT VALIDATION: Object must have exactly the same fields as the schema
 * All required fields must be present and no extra fields are allowed
 * @param obj - The object to validate
 * @param schema - The schema definition
 * @returns Detailed validation result
 */
export function validateObjectStrict(obj: any, schema: Schema): ValidationResult {
    if (!obj || typeof obj !== 'object') {
        return {
            isValid: false,
            missingFields: Object.keys(schema).filter(key => schema[key].required !== false),
            invalidFields: ['Invalid or missing object'],
            extraFields: [],
            errorDetails: ['Expected an object but received invalid input']
        };
    }

    const objKeys = Object.keys(obj);
    const schemaKeys = Object.keys(schema);

    // Find extra fields (present in object but not in schema)
    const extraFields = objKeys.filter(key => !schemaKeys.includes(key));

    // Validate fields according to schema
    const { missingFields, invalidFields, errorDetails } = validateNestedObject(obj, schema);

    // Add error details for extra fields
    const allErrorDetails = [...errorDetails];
    if (extraFields.length > 0) {
        allErrorDetails.push(`Extra fields not allowed: ${extraFields.join(', ')}`);
    }

    const isValid = missingFields.length === 0 && invalidFields.length === 0 && extraFields.length === 0;

    return {
        isValid,
        missingFields,
        invalidFields,
        extraFields,
        errorDetails: allErrorDetails,
        schemaExample: generateSchemaExample(schema),
    };
}

/**
 * Helper function to create schema definitions more easily
 * Provides sensible defaults for schema field properties
 * @param schemaDefinition - Partial schema definition with defaults applied
 * @returns Complete schema object
 */
export function createSchema(schemaDefinition: Record<string, Partial<SchemaField>>): Schema {
    const schema: Schema = {};

    for (const [key, field] of Object.entries(schemaDefinition)) {
        schema[key] = {
            type: field.type || 'string',
            required: field.required !== false, // Default to required unless explicitly set to false
            fields: field.fields,
            items: field.items,
            minLength: field.minLength,
            maxLength: field.maxLength
        };
    }

    return schema;
}
