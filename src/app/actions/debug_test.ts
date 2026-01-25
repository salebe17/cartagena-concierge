'use server'

export const runtime = 'nodejs';

export async function debugTestPing() {
    console.log("Serverside debug ping detected");
    return { success: true, message: "Server is alive (NodeJS Runtime)", timestamp: new Date().toISOString() };
}
