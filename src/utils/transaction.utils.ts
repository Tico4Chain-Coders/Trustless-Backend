import * as StellarSDK from "stellar-sdk";

// Función para construir la transacción
export function buildTransaction(
  account: StellarSDK.Account,
  operations: StellarSDK.xdr.Operation[],
  fee: string = "100",
  networkPassphrase: string = StellarSDK.Networks.TESTNET,
  timeout: number = 30,
): StellarSDK.Transaction {
  const transactionBuilder = new StellarSDK.TransactionBuilder(account, { fee })
    .setNetworkPassphrase(networkPassphrase)
    .setTimeout(timeout);

  operations.forEach((operation) => {
    transactionBuilder.addOperation(operation);
  });

  return transactionBuilder.build();
}

// Función para firmar y enviar la transacción
export async function signAndSendTransaction(
  transaction: StellarSDK.Transaction,
  keypair: StellarSDK.Keypair,
  server: StellarSDK.SorobanRpc.Server,
  prepareTransaction: boolean,
  processResultCallback?: (
    response: StellarSDK.rpc.Api.GetTransactionResponse,
  ) => any,
): Promise<any> {
  let response: any;
  transaction.sign(keypair);

  if (prepareTransaction) {
    const preparedTransaction = await server.prepareTransaction(transaction);
    preparedTransaction.sign(keypair);
    response = await server.sendTransaction(preparedTransaction);
  } else {
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
        return processResultCallback(getResponse); // Se ejecuta el callback si está definido
      } else {
        return getResponse; // Devuelve el resultado sin procesar si no hay callback
      }
    } else {
      throw new Error(`Transaction failed: ${JSON.stringify(getResponse.resultXdr)}`);
    }
  } else {
    throw new Error(`Transaction submission failed: ${response.errorResult}`);
  }
}
