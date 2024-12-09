# How to mint gold coin NFTs

1. Buy gold coin
2. Create picture, add it to img folder
3. modify src/bin/createToken.ts and loop through new coins
4. modify src/createArc3Files.ts add the description of new coins
5. `ts-node src/bin/createToken.ts`
6. modify test/deploy.test.ts
7. add to .env correct config, read env.md
8. `npm run deploynft`
