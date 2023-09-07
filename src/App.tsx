import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { formatEther } from "viem";
import { refundABI } from "./refundABI";
import "./App.css";
import "@rainbow-me/rainbowkit/styles.css";

function App() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const refundProofs: any = {};

  const { config, error } = usePrepareContractWrite({
    address: "0xf33197CA64f66A36a2Ac9D02e3b954455F971761",
    abi: refundABI,
    functionName: "claim",
    args: [refundProofs.proof, refundProofs.amount],
    enabled:
      address && refundProofs.amount && chain && !chain.unsupported
        ? true
        : false,
  });
  const { data, isLoading, error: error2, write } = useContractWrite(config);
  const {
    isLoading: isLoading2,
    error: error3,
    data: txStatus,
  } = useWaitForTransaction({
    hash: data?.hash,
    enabled: data && chain && chain.testnet ? true : false,
  });

  return (
    <>
      <h1 className="heading1">
        Refund from ZachXBT for legal funds donations
      </h1>
      <ConnectButton />
      <h2 className="heading2">
        {` You Receive: ${
          isConnected
            ? refundProofs.amount
              ? formatEther(refundProofs.amount) + "ETH"
              : "0 ETH"
            : ""
        }`}
      </h2>
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
