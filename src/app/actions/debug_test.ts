'use server'

export async function debugTestPing() {
    console.log("Serverside debug ping detected");
    return { success: true, message: "Server is alive", timestamp: new Date().toISOString() };
}
