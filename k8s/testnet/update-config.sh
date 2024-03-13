kubectl apply -f deployment-testnet.yaml -n asagold
kubectl delete configmap asagold-testnet-conf -n asagold
kubectl create configmap asagold-testnet-conf --from-file=conf -n asagold
kubectl rollout restart deployment/asagold-web-testnet-deployment -n asagold
kubectl rollout status deployment/asagold-web-testnet-deployment -n asagold -w 