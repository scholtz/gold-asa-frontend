kubectl apply -f deployment-sandbox.yaml -n asagold
kubectl delete configmap asagold-sandbox-conf -n asagold
kubectl create configmap asagold-sandbox-conf --from-file=conf -n asagold
kubectl rollout restart deployment/asagold-web-sandbox-deployment -n asagold
kubectl rollout status deployment/asagold-web-sandbox-deployment -n asagold -w 