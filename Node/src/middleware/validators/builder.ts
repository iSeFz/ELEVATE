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
    minValue?: number; // For numbers
    maxValue?: number; // For numbers
    patternRgx?: RegExp; // For string patterns (regex)
    patternHint?: string; // Hint for regex pattern
    in?: string[]; // For enum-like validation (allowed values)
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
    errorDetails?: string[];
    requiredFields?: string[];
    schemaExample: any;
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
            if (fieldSchema.patternRgx && !new RegExp(fieldSchema.patternRgx).test(value)) return false;
            if (fieldSchema.in && !fieldSchema.in.includes(value)) return false;
            return true;

        case 'number':
            if (typeof value !== 'number') return false;
            // Check for NaN and Infinity
            if (isNaN(value) || !isFinite(value)) return false;
            if (fieldSchema.minValue !== undefined && value < fieldSchema.minValue) return false;
            if (fieldSchema.maxValue !== undefined && value > fieldSchema.maxValue) return false;
            return true;

        case 'boolean':
            return typeof value === 'boolean';

        case 'object':
            return typeof value === 'object' && value !== null && !Array.isArray(value);

        case 'array':
            if (!Array.isArray(value)) return false;
            if (minLength !== undefined && value.length < minLength) return false;
            if (maxLength !== undefined && value.length > maxLength) return false;
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

            const constraintError = checkSchemaConstraints(fieldSchema, fieldValue, fieldPath);
            if (constraintError) {
                errorDetails.push(constraintError);
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

        if (fieldSchema.type === 'array' && fieldSchema.items && Array.isArray(fieldValue)) {
            const arrayValidation = validateArrayItems(fieldValue, fieldSchema.items, fieldPath);
            missingFields.push(...arrayValidation.missingFields);
            invalidFields.push(...arrayValidation.invalidFields);
            errorDetails.push(...arrayValidation.errorDetails);
        }
    }

    return { missingFields, invalidFields, errorDetails };
}

const checkSchemaConstraints = (schema: SchemaField, value: any, path: string) => {
    if (schema.type === 'string' && typeof value === 'string') {
        if (schema.minLength && value.length < schema.minLength) {
            return (`Field '${path}' must be at least ${schema.minLength} characters long`);
        }
        if (schema.maxLength && value.length > schema.maxLength) {
            return (`Field '${path}' must be at most ${schema.maxLength} characters long`);
        }
        if (schema.patternRgx && !new RegExp(schema.patternRgx).test(value)) {
            return (`Field '${path}' must match the pattern: ${schema.patternHint ?? schema.patternRgx}`);
        }
        if (schema.in && !schema.in.includes(value)) {
            return (`Field '${path}' must be one of: ${schema.in.join(', ')}`);
        }
    } else if (schema.type === 'number' && typeof value === 'number') {
        if (schema.minValue !== undefined && value < schema.minValue) {
            return (`Field '${path}' must be at least ${schema.minValue}`);
        }
        if (schema.maxValue !== undefined && value > schema.maxValue) {
            return (`Field '${path}' must be at most ${schema.maxValue}`);
        }
        if (!isFinite(value)) {
            return (`Field '${path}' must be a finite number`);
        }
    } else if (schema.type === 'array' && Array.isArray(value)) {
        if (schema.minLength && value.length < schema.minLength) {
            return (`Array '${path}' must have at least ${schema.minLength} items`);
        }
        if (schema.maxLength && value.length > schema.maxLength) {
            return (`Array '${path}' must have at most ${schema.maxLength} items`);
        }
    } else {
        return (`Field '${path}' must be of type '${schema.type}'`);
    }
}

/**
 * Validates array items (both primitives and objects)
 * @param arrayValue - The array to validate
 * @param itemSchema - Schema for array items
 * @param fieldPath - Current path for error reporting
 * @returns Validation results
 */
function validateArrayItems(
    arrayValue: any[],
    itemSchema: SchemaField,
    fieldPath: string
): {
    invalidFields: string[];
    errorDetails: string[];
    missingFields: string[];
} {
    const invalidFields: string[] = [];
    const errorDetails: string[] = [];
    const missingFields: string[] = [];

    arrayValue.forEach((item, index) => {
        const itemPath = `${fieldPath}[${index}]`;

        // For primitive types
        if (itemSchema.type !== 'object') {
            if (!isValidType(item, itemSchema)) {
                invalidFields.push(itemPath);
                const constraintError = checkSchemaConstraints(itemSchema, item, itemPath);
                if (constraintError) {
                    errorDetails.push(constraintError);
                } else {
                    errorDetails.push(`Array item at '${itemPath}' must be of type '${itemSchema.type}'`);
                }
            }
        }
        // For object types
        else if (itemSchema.type === 'object' && itemSchema.fields) {
            const itemValidation = validateNestedObject(item, itemSchema.fields, itemPath);
            invalidFields.push(...itemValidation.invalidFields);
            errorDetails.push(...itemValidation.errorDetails);
            missingFields.push(...itemValidation.missingFields);
        }
    });

    return { invalidFields, errorDetails, missingFields };
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
 * Extracts required fields from a schema
 * @param schema - The schema definition
 * @param prefix - Prefix for nested field paths
 * @returns Array of required field paths
 */
function extractRequiredFields(schema: Schema, prefix: string = ''): string[] {
    const requiredFields: string[] = [];
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
        const fieldPath = prefix ? `${prefix}.${fieldName}` : fieldName;

        // Add field if it's required
        if (fieldSchema.required !== false) {
            requiredFields.push(fieldPath);
        }

        // Check nested object fields
        if (fieldSchema.type === 'object' && fieldSchema.fields) {
            const nestedRequired = extractRequiredFields(fieldSchema.fields, fieldPath);
            requiredFields.push(...nestedRequired);
        }

        // Check array of objects
        if (fieldSchema.type === 'array' && fieldSchema.items?.type === 'object' && fieldSchema.items.fields) {
            const arrayItemRequired = extractRequiredFields(fieldSchema.items.fields, `${fieldPath}[*]`);
            requiredFields.push(...arrayItemRequired);
        }
    }

    return requiredFields;
}

/**
 * STRICT VALIDATION with generic type support
 * @param obj - The object to validate
 * @param schema - The schema definition
 * @returns Detailed validation result with type safety
 */
export function validateObjectStrict<T extends Record<string, any>>(
    obj: any,
    schema: Schema
): ValidationResult {
    if (!obj || typeof obj !== 'object') {
        return {
            isValid: false,
            missingFields: Object.keys(schema).filter(key => schema[key].required !== false),
            invalidFields: ['Invalid or missing object'],
            errorDetails: ['Expected an object but received invalid input'],
            requiredFields: extractRequiredFields(schema),
            schemaExample: generateSchemaExample(schema, true),
        };
    }

    // Validate fields according to schema
    const { missingFields, invalidFields, errorDetails } = validateNestedObject(obj, schema);

    // Add error details for extra fields
    const allErrorDetails = [...errorDetails];
    const isValid = missingFields.length === 0 && invalidFields.length === 0;

    const result: ValidationResult & { validatedData?: T } = {
        isValid,
        missingFields,
        invalidFields,
        errorDetails: allErrorDetails,
        requiredFields: extractRequiredFields(schema),
        schemaExample: generateSchemaExample(schema, true),
    };

    return result;
}


/**
 * Enhanced createSchema function with generic type support
 * @param schemaDefinition - Partial schema definition with defaults applied
 * @returns Complete schema object
 */
export function createSchema<T extends Record<string, any>>(
    schemaDefinition: Record<keyof T, Partial<SchemaField>>
): Schema {
    const schema: Schema = {};

    for (const [key, field] of Object.entries(schemaDefinition)) {
        schema[key as string] = {
            type: field.type ?? 'string',
            required: field.required !== false, // Default to required unless explicitly set to false
            fields: field.fields,
            items: field.items,
            minLength: field.minLength,
            maxLength: field.maxLength,
            value: field.value, // Default value for the field
            minValue: field.minValue,
            maxValue: field.maxValue,
            patternRgx: field.patternRgx, // Regex pattern for string validation
            patternHint: field.patternHint, // Hint for regex pattern
            in: field.in, // For enum-like validation
        };
    }

    return schema;
}

/**
 * Generic schema builder that ensures type safety for any TypeScript type
 */
export class SchemaBuilder<T extends Record<string, any>> {
    private schemaDefinition: Record<keyof T, Partial<SchemaField>> = {} as any;

    /**
     * Add a field to the schema
     */
    field<K extends keyof T>(
        fieldName: K,
        fieldDefinition: Partial<SchemaField>
    ): SchemaBuilder<T> {
        this.schemaDefinition[fieldName] = fieldDefinition;
        return this;
    }

    constructor(schemaBuilder: SchemaBuilder<T>) {
        this.schemaDefinition = { ...schemaBuilder.schemaDefinition };
    }

    /**
     * Build the final schema
     */
    build(): Schema {
        return createSchema<T>(this.schemaDefinition);
    }
}

/**
 * Factory function to create type-safe schema builder
 */
export function createSchemaBuilder<T extends Record<string, any>>(): SchemaBuilder<T> {
    return new SchemaBuilder<T>({} as SchemaBuilder<T>);
}

/**
 * Extracts only schema-defined fields from an object, filtering out extra fields
 * @param data - The input object (e.g., req.body)
 * @param schema - The schema definition containing field specifications
 * @returns A new object containing only the fields defined in the schema
 */
export function extractSchemaFields<T = any>(data: any, schema: Schema): T {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {} as T;
    }

    const extractedData: any = {};

    // Iterate through schema fields only
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
        if (data.hasOwnProperty(fieldName)) {
            const fieldValue = data[fieldName];

            // Handle nested objects
            if (fieldSchema.type === 'object' && fieldSchema.fields) {
                if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
                    extractedData[fieldName] = extractSchemaFields(fieldValue, fieldSchema.fields);
                } else if (fieldSchema.required) {
                    // If required but not a valid object, include null/undefined
                    extractedData[fieldName] = fieldValue;
                }
            }
            // Handle arrays of objects
            else if (fieldSchema.type === 'array' && fieldSchema.items?.type === 'object' && fieldSchema.items.fields) {
                if (Array.isArray(fieldValue)) {
                    extractedData[fieldName] = fieldValue.map(item =>
                        extractSchemaFields(item, fieldSchema.items!.fields!)
                    );
                } else if (fieldSchema.required) {
                    extractedData[fieldName] = fieldValue;
                }
            }
            // Handle primitive types and arrays of primitives
            else {
                extractedData[fieldName] = fieldValue;
            }
        } else if (fieldSchema.required) {
            // Include required fields even if missing (for validation to catch)
            extractedData[fieldName] = undefined;
        }
        // Optional fields that don't exist in data are simply omitted
    }

    return extractedData as T;
}

/**
 * Middleware helper to extract schema fields from req.body
 * @param schema - The schema definition
 * @returns Middleware function that modifies req.body to contain only schema fields
 */
export function extractSchemaFieldsMiddleware(schema: Schema) {
    return (req: any, res: any, next: any) => {
        if (req.body) {
            req.body = extractSchemaFields(req.body, schema);
        }
        next();
    };
}
