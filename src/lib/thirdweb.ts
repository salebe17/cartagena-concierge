import { createThirdwebClient, defineChain, getContract } from "thirdweb";

// 1. CONFIGURACIÓN CENTRALIZADA
export const client = createThirdwebClient({
    clientId: "63857cb90adaf65ae3dde1e59baba96a", // Public Client ID (Safe to expose if domain restricted)
});

export const chain = defineChain(80002); // Amoy Testnet

export const TARGET_WALLET_ADDRESS = "0x53502758255955178A3266847849925232824330"; // Main Recipient

// Contract for Token (Configured in Terminal)
export const TOKEN_CONTRACT_ADDRESS = "0x7b9a5cE25723936F5D26A5caA18EB15ad08aA935";

export function getTokenContract() {
    return getContract({
        client,
        chain,
        address: TOKEN_CONTRACT_ADDRESS,
    });
}
