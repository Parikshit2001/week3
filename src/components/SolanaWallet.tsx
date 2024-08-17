import { useEffect, useState } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import nacl from "tweetnacl";

export function SolanaWallet({ mnemonic }: { mnemonic: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [publicKeys, setPublicKeys] = useState<PublicKey[]>([]);
  const [balances, setBalances] = useState<number[]>([]);
  const [connection, setConection] = useState<Connection | null>(null);
  useEffect(() => {
    const newConnection = new Connection(
      "https://solana-mainnet.g.alchemy.com/v2/EspGgEsKtp6xdG1-P32lj9raEFUlgXNc"
    );
    setConection(newConnection);
  }, []);
  const privateKeyUint8Array = new Uint8Array([
    192, 121, 45, 32, 88, 41, 117, 12, 237, 130, 76, 64, 137, 42, 21, 14, 212,
    188, 248, 193, 251, 161, 102, 147, 46, 137, 107, 108, 16, 6, 158, 150,
  ]);
  console.log(privateKeyUint8Array);

  return (
    <div>
      <button
        onClick={async function () {
          console.log(mnemonic);
          const seed = await mnemonicToSeed(mnemonic);
          const path = `m/44'/501'/${currentIndex}'/0'`;
          const derivedSeed = derivePath(path, seed.toString("hex")).key;
          const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
          const keypair = Keypair.fromSecretKey(secret);
          console.log({ seed, path, derivedSeed, secret, keypair });
          setCurrentIndex(currentIndex + 1);
          setPublicKeys([...publicKeys, keypair.publicKey]);
          const newBalance =
            (await connection?.getBalance(keypair.publicKey)) ?? 0;
          // newBalance = newBalance / LAMPORTS_PER_SOL;
          setBalances([...balances, newBalance/LAMPORTS_PER_SOL]);
        }}
      >
        Add wallet
      </button>
      {publicKeys.map((p, i) => (
        <div key={i}>
          <div>PublicKey - {p.toBase58()}</div>
          <div>Balance - {balances[i] ?? "Loading"} SOL</div>
          <hr />
        </div>
      ))}
    </div>
  );
}
