kubectl apply -f deployment-main.yaml -n asagold
kubectl delete configmap asagold-main-conf -n asagold
kubectl create configmap asagold-main-conf --from-file=conf -n asagold
kubectl rollout restart deployment/asagold-web-main-deployment -n asagold
kubectl rollout status deployment/asagold-web-main-deployment -n asagold -w 