ts-node src/bin/createToken.ts || error_code=$?
error_code_int=$(($error_code + 0))
if [ $error_code_int -ne 0 ]; then
  echo "run failed";
	exit 1;
fi
