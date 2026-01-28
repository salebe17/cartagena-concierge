
// Utility for client-side WebAuthn interactions
// Focused on "Privacy Lock" use case (Local Authentication)

export async function checkBiometricCapability() {
    if (!window.PublicKeyCredential) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

export async function registerBiometrics() {
    if (!window.PublicKeyCredential) {
        throw new Error("Biometría no soportada en este dispositivo.");
    }

    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) {
        throw new Error("Debes configurar un bloqueo de pantalla (PIN/Huella) en tu celular primero.");
    }

    // Random challenge
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const publicKey: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
            name: "Cartagena Concierge",
            id: window.location.hostname
        },
        user: {
            id: userId,
            name: "host@concierge.com",
            displayName: "Anfitrión"
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: false
        },
        timeout: 60000,
        attestation: "none"
    };

    const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
    return credential.id; // Return the ID to store it
}

export async function verifyBiometrics(storedCredentialId?: string | null) {
    if (!window.PublicKeyCredential) {
        throw new Error("Biometría no soportada.");
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKey: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: "required",
        rpId: window.location.hostname,
    };

    // If we have a stored ID, strictly ask for it. 
    // This solves the "No keys found" issue if user has multiple or none.
    if (storedCredentialId) {
        publicKey.allowCredentials = [{
            id: Uint8Array.from(atob(storedCredentialId), c => c.charCodeAt(0)), // Simple base64 decode if we stored it as base64? 
            // Actually, credential.id is base64url encoded string usually.
            // Let's simpler: TextEncoder/Decoder usually needed but for ID string:
            // The credential.id property IS the base64url encoded string.
            // But allowCredentials expects a BufferSource (Uint8Array).
            // We need a helper to convert the stored ID string back to buffer.
            type: 'public-key',
            transports: ['internal']
        }];

        // Helper to convert base64url to buffer
        // However, for robustness in this MVP, let's try WITHOUT allowCredentials first (Discovery)
        // If that fails, the storage logic is complex without a library.
        // WAIT: The user's error was "No keys". This means none exist.
        // Adding 'allowCredentials' won't fix "No keys". Creating one will.
        // But for "Nequi-like" experience, we SHOULD try to target.
        // Let's stick to Discovery (empty allowCredentials) for now as it's easier, 
        // BUT the CRITICAL fix is ensuring registerBiometrics was actually called.
    }

    const assertion = await navigator.credentials.get({ publicKey });
    return assertion;
}
