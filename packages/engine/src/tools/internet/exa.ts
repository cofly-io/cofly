export async function exa(query: string) {
    try {
        return await (await fetch("https://api.exa.ai/search", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "x-api-key": process.env.EXA_API_KEY || "",
            },
            body: JSON.stringify({
                query: query,
                text: true
            }),
        })).json();
    } catch (error) {
        console.error(error);
        return {
            error: "failed to search internet"
        }
    }
}