import { useEffect, useState } from "react";
import { mnemonicToSeed } from "bip39";
import { Wallet, HDNodeWallet } from "ethers";
import Web3 from "web3";

export const EthWallet = ({ mnemonic }: { mnemonic: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [balances, setBalances] = useState<number[]>([]);
  const [web3, setWeb3] = useState<Web3 | null>(null);

  useEffect(() => {
    const provider = new Web3.providers.HttpProvider(
      "https://mainnet.infura.io/v3/5ca745e6b95b4d9cbf33beb4173ba71d"
    );
    const newWeb3 = new Web3(provider);
    setWeb3(newWeb3);
  }, []);

  return (
    <div>
      <button
        onClick={async function () {
          const seed = await mnemonicToSeed(mnemonic);
          const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
          const hdNode = HDNodeWallet.fromSeed(seed);
          const child = hdNode.derivePath(derivationPath);
          const privateKey = child.privateKey;
          const wallet = new Wallet(privateKey);
          setCurrentIndex(currentIndex + 1);
          setAddresses([...addresses, wallet.address]);
          const newBalance = (await web3?.eth.getBalance(
            wallet.address
          )) as unknown as number;
          const ether = web3?.utils.fromWei(newBalance, "ether");
          setBalances([...balances, Number(ether)]);
        }}
      >
        Add ETH wallet
      </button>

      {addresses.map((p, i) => (
        <div key={i}>
          <div>Eth - {p}</div>
          <div>Balance - {balances[i] ?? "Loading"} eth </div>
          <hr />
        </div>
      ))}
    </div>
  );
};
