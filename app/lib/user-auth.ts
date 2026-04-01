const USER_AUTH_URL = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp/user-auth';

export async function callUserAuthApi(body: Record<string, unknown>) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
        const response = await fetch(USER_AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        clearTimeout(timeout);

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.status}`);
        }
        return data;
    } catch (error) {
        clearTimeout(timeout);
        throw error;
    }
}
