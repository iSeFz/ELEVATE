export function validateObjectStructure(obj: any, schema: any, method: "fully" | "partially" = "fully"): boolean {
    if (!obj) return false;

    // Compare keys at the current level
    const objKeys = new Set(Object.keys(obj));
    const schemaKeys = new Set(Object.keys(schema));

    // Check missing keys for "fully" method
    if (method === "fully" && objKeys.size !== schemaKeys.size) return false;
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
            if (!validateObjectStructure(objValue, schemaValue)) return false;
        }
    }

    return true;
}
