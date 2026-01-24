import { createThirdwebClient, defineChain, getContract } from "thirdweb";

// 1. CONFIGURACIÓN CENTRALIZADA
// 1. CONFIGURACIÓN CENTRALIZADA (LAZY LOAD)
// Prevents BigInt crash during build time module evaluation

const CLIENT_ID = "63857cb90adaf65ae3dde1e59baba96a";

export function getThirdwebClient() {
    return createThirdwebClient({
        clientId: CLIENT_ID,
    });
}

export function getChain() {
    return defineChain(80002); // Amoy Testnet
}

export const TARGET_WALLET_ADDRESS = "0x53502758255955178A3266847849925232824330";
export const TOKEN_CONTRACT_ADDRESS = "0x7b9a5cE25723936F5D26A5caA18EB15ad08aA935";

export function getTokenContract() {
    return getContract({
        client: getThirdwebClient(),
        chain: getChain(),
        address: TOKEN_CONTRACT_ADDRESS,
    });
}
