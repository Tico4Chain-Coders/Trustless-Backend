import * as StellarSDK from "stellar-sdk";

export function buildTransaction(
  account: StellarSDK.Account,
  operations: StellarSDK.xdr.Operation[],
  fee: string = StellarSDK.BASE_FEE,
  networkPassphrase: string = StellarSDK.Networks.TESTNET,
  timeout: number = 300,
): StellarSDK.Transaction {
  const transactionBuilder = new StellarSDK.TransactionBuilder(account, { fee })
    .setNetworkPassphrase(networkPassphrase)
    .setTimeout(timeout);

  operations.forEach((operation) => {
    transactionBuilder.addOperation(operation);
  });

  return transactionBuilder.build();
}

export async function signAndSendTransaction(
  transaction: StellarSDK.Transaction,
  keypair: StellarSDK.Keypair,
  server: StellarSDK.SorobanRpc.Server,
  prepareTransaction: boolean,
  processResultCallback?: (
    response: StellarSDK.rpc.Api.GetTransactionResponse,
  ) => any,
): Promise<StellarSDK.rpc.Api.GetTransactionResponse | StellarSDK.rpc.Api.GetSuccessfulTransactionResponse> {
  let response: any;

  if (prepareTransaction) {
    const preparedTransaction = await server.prepareTransaction(transaction);
    preparedTransaction.sign(keypair);
    response = await server.sendTransaction(preparedTransaction);
  } else {
    transaction.sign(keypair);
    response = await server.sendTransaction(transaction);
  }

  if (response.status === "PENDING") {
    let getResponse: StellarSDK.rpc.Api.GetTransactionResponse;

    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      getResponse = await server.getTransaction(response.hash);
    } while (getResponse.status === "NOT_FOUND");

    if (getResponse.status === "SUCCESS") {
      if (processResultCallback) {
        return processResultCallback(getResponse);
      } else {
        return getResponse;
      }
    } else {
      throw new Error(
        `Transaction failed: ${JSON.stringify(getResponse.resultXdr)}`,
      );
    }
  } else {
    throw new Error(`Transaction submission failed: ${response.errorResult}`);
  }
}
