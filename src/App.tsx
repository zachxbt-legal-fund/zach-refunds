import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { refundABI } from "./refundABI";
import "./App.css";
import "@rainbow-me/rainbowkit/styles.css";
import { arbitrum, mainnet } from "wagmi/chains";
import { useEffect, useState } from "react";

const LIB: {
  [chainId: number]: {
    claimContract: `0x${string}`;
    usdcContract: `0x${string}`;
    proofsFilename: string;
  };
} = {
  [mainnet.id]: {
    claimContract: "0xBDF31bd6aC19C964043801186b12BDa46A2e0430",
    usdcContract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    proofsFilename: "ethereum-proofs.json",
  },
  [arbitrum.id]: {
    claimContract: "0xaF41b062c416d727C3721412eA0FA5AA623C3187",
    usdcContract: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    proofsFilename: "arbitrum-proofs.json",
  },
};

// TODO check balance of usdc in contract
function App() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const [refundProofs, setRefundProofs] = useState<any>({});
  const [isFetching, setIsFetching] = useState(false);
  const [errorFetchingProofs, setErrorFetchingProofs] = useState(null);

  useEffect(() => {
    let ignore = false;
    setRefundProofs({});

    if (chain && LIB[chain.id] && address) {
      setIsFetching(true);
      fetch(`/zach-refunds/${LIB[chain.id].proofsFilename}`)
        .then(async (res) => {
          if (res.status !== 200) {
            throw new Error(
              res.statusText !== "" ? res.statusText : "Failed to fetch proofs"
            );
          }

          const data = await res.json();
          return data;
        })
        .then((result) => {
          if (!ignore) {
            setRefundProofs(result[address] ?? {});
          }
        })
        .catch((err) => {
          setErrorFetchingProofs(
            (err as any)?.message ?? "Failed to fetch proofs"
          );
        })
        .finally(() => {
          setIsFetching(false);
        });
    }

    return () => {
      ignore = true;
    };
  }, [address, chain]);

  const { config, error } = usePrepareContractWrite({
    address: chain && LIB[chain.id]?.claimContract,
    abi: refundABI,
    functionName: "claim",
    args: [refundProofs.proof, refundProofs.amount],
    enabled:
      address && chain && LIB[chain.id] && refundProofs.amount ? true : false,
  });
  const { data, isLoading, error: error2, write } = useContractWrite(config);
  const {
    isLoading: isLoading2,
    error: error3,
    data: txStatus,
  } = useWaitForTransaction({
    hash: data?.hash,
    enabled: data ? true : false,
  });

  return (
    <>
      <h1 className="heading1">
        Refund from ZachXBT for legal funds donations
      </h1>
      <ConnectButton />

      {errorFetchingProofs ? (
        <h2 className="tx-failed heading2">{errorFetchingProofs}</h2>
      ) : (
        <h2 className="heading2">
          {isFetching
            ? `Loading...`
            : ` You Receive: ${
                isConnected
                  ? refundProofs.amount
                    ? (Number(refundProofs.amount)/1e6).toFixed(2) + " USDC"
                    : "0 USDC"
                  : ""
              }`}
        </h2>
      )}

      <button
        className="submit-btn"
        disabled={isLoading || !isLoading2 || !write || !isConnected}
      >
        {isLoading || isLoading2 ? "Confirming..." : "Claim"}
      </button>
      {data && (
        <a
          target="_blank"
          href={`https://etherscan.io/tx/${data.hash}`}
          rel="noreferrer"
          className="link-to-tx"
        >
          Transaction submitted
        </a>
      )}

      {txStatus ? (
        txStatus.status === "success" ? (
          <p className="tx-success">Transaction Succcess</p>
        ) : (
          <p className="tx-failed">Transaction Failed</p>
        )
      ) : null}

      {error || error2 || error3 ? (
        <p className="error-msg">
          {(error as any)?.shortmessage ??
            error?.message ??
            (error2 as any)?.shortMessage ??
            error2?.message ??
            (error3 as any)?.shortMessage ??
            error3?.message ??
            ""}
        </p>
      ) : null}
    </>
  );
}

export default App;
