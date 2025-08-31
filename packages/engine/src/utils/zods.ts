import jsonSchemaToZod from "json-schema-to-zod";
import { z, ZodObject, ZodType } from "zod";

export class zods {
    private static cache = new Map<string, ZodType<any>>();

    static isZodObject(value: unknown): value is ZodObject<any> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return value instanceof z.ZodObject &&
            typeof (value as any).shape === 'object' &&
            (value as any).shape !== null;
    }

    static safeCreateZodSchema<T = any>(jsonSchema: any): ZodType<T> {
        try {
            const zodSchemaCode = jsonSchemaToZod(jsonSchema);

            // 清理可能的导入语句
            const cleanCode = zodSchemaCode
                .replace(/import.*from.*['"];?\s*/g, '')
                .replace(/export\s+(const|let|var)\s+\w+\s*=\s*/g, '')
                .replace(/export\s+default\s+/g, '');

            // 使用 Function 构造器创建 schema
            const schemaFactory = new Function('z', `
      "use strict";
      try {
        return ${cleanCode};
      } catch (error) {
        throw new Error('Failed to create Zod schema: ' + error.message);
      }
    `);

            const schema = schemaFactory(z);

            // 验证返回的是一个有效的 Zod schema
            if (!schema || typeof schema.parse !== 'function') {
                throw new Error('Generated object is not a valid Zod schema');
            }

            return schema;
        } catch (error) {
            throw new Error(`Failed to convert JSON Schema to Zod: ${error}`);
        }
    }

    static convert<T = any>(jsonSchema: any): ZodType<T> {
        const cacheKey = JSON.stringify(jsonSchema);

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        const zodSchema = this.safeCreateZodSchema<T>(jsonSchema);
        this.cache.set(cacheKey, zodSchema);

        return zodSchema;
    }
}