export function validateObjectStructure(obj: any, schema: any, method: "fully" | "partially" = "fully"): boolean {
    if(method === "fully") {
        return validateObjectHasMinimiumStructure(obj, schema);
    } else if(method === "partially") {
        return validateObjectFollowStructure(obj, schema);
    }
    return false;
}

/**
 * Validates if an object contains only keys defined in the schema.
 */
const validateObjectFollowStructure = (obj: any, schema: any): boolean => {
    if (!obj) return false;

    // Compare keys at the current level
    const objKeys = new Set(Object.keys(obj));
    const schemaKeys = new Set(Object.keys(schema));

    // Check for extra keys
    for (const key of objKeys) {
        if (!schemaKeys.has(key)) return false;
    }

    // Recursively check nested objects
    for (const key of objKeys) {
        const objValue = obj[key];
        const schemaValue = schema[key];

        if (typeof schemaValue === 'object' && schemaValue !== null) {
            // If schema value is an object, recursively validate
            if (typeof objValue !== 'object' || objValue === null) return false;
            if (!validateObjectFollowStructure(objValue, schemaValue)) return false;
        }
    }

    return true;
}

/**
 * Validates if an object has at least the keys defined in the schema.
 */
const validateObjectHasMinimiumStructure = (obj: any, schema: any): boolean => {
    if (!obj) return false;

    const objKeys = new Set(Object.keys(obj));
    const schemaKeys = new Set(Object.keys(schema));

    if (objKeys.size < schemaKeys.size) return false;
    for (const key of schemaKeys) {
        if (!objKeys.has(key)) return false;
    }

    // Recursively check nested objects
    for (const key of schemaKeys) {
        const objValue = obj[key];
        const schemaValue = schema[key];

        if (typeof schemaValue === 'object' && schemaValue !== null) {
            if (typeof objValue !== 'object' || objValue === null) return false;
            if (!validateObjectHasMinimiumStructure(objValue, schemaValue)) return false;
        }
    }

    return true;
}