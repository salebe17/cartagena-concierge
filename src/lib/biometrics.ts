
// Utility for client-side WebAuthn interactions
// Focused on "Privacy Lock" use case (Local Authentication)

export async function registerBiometrics() {
    if (!window.PublicKeyCredential) {
        throw new Error("Biometría no soportada en este dispositivo.");
    }

    // Random challenge (In a real auth flow, this comes from server)
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const publicKey: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
            name: "Cartagena Concierge",
            id: window.location.hostname // Must match current domain
        },
        user: {
            id: userId,
            name: "host@concierge.com", // Display name
            displayName: "Anfitrión"
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
        authenticatorSelection: {
            authenticatorAttachment: "platform", // Forces TouchID/FaceID
            userVerification: "required"
        },
        timeout: 60000,
        attestation: "none"
    };

    const credential = await navigator.credentials.create({ publicKey });
    return credential;
}

export async function verifyBiometrics() {
    if (!window.PublicKeyCredential) {
        throw new Error("Biometría no soportada.");
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKey: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: "required", // Forces the biometric check
        // We don't specify allowCredentials to allow any passkey created for this RP
        // or we could store the credentialId from registration and use it here.
        // For simplicity in this logic, we try to discover.
    };

    const assertion = await navigator.credentials.get({ publicKey });
    return assertion;
}
