
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
            name: "FairBid",
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

// Helper for Base64URL to Uint8Array
function base64UrlToUint8Array(base64Url: string): Uint8Array {
    const padding = '='.repeat((4 - base64Url.length % 4) % 4);
    const base64 = (base64Url + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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

    if (storedCredentialId) {
        try {
            publicKey.allowCredentials = [{
                id: base64UrlToUint8Array(storedCredentialId) as any,
                type: 'public-key',
                transports: ['internal', 'hybrid'] // 'internal' usually targets built-in sensors
            }];
        } catch (e) {
            console.warn("Invalid stored credential ID, falling back to discovery", e);
        }
    }

    const assertion = await navigator.credentials.get({ publicKey });
    return assertion;
}
