import { Type, type Static } from '@sinclair/typebox';

export const AmapWeatherOptionsSchema = Type.Object({
    apiKey: Type.String(),
    cityCode: Type.String(),
    extensions: Type.String()
});

export type AmapWeatherOptions = Static<typeof AmapWeatherOptionsSchema>;
