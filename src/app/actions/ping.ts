'use server'

export async function pingAction() {
    return { success: true, message: "Pong" };
}
