npx tealscript contracts/asa-gold-smartcontract.algo.ts contracts/artifacts/  || error_code=$?
error_code_int=$(($error_code + 0))
if [ $error_code_int -ne 0 ]; then
  echo "failed to create artifacts";
  exit 1;
else
  echo "artifacts created successfully";
fi

algokit generate client --language typescript --output contracts/clients/AsaGoldSmartcontractClient.ts contracts/artifacts/AsaGoldSmartcontractClient.json   || error_code=$?
error_code_int=$(($error_code + 0))
if [ $error_code_int -ne 0 ]; then
  echo "failed to generate client";
  exit 1;
else
  echo "typescript client created successfully";
fi

npm run test  || error_code=$?
error_code_int=$(($error_code + 0))
if [ $error_code_int -ne 0 ]; then
  echo "test failed";
  exit 1;
else
  echo "app was tested successfully";
fi