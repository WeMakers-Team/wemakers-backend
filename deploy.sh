#!/bin/bash
cd /home/ubuntu
sudo chown -R ubuntu:ubuntu wemakers

cd /home/ubuntu/wemakers
yarn install
yarn generate:prisma
yarn build NODE_OPTIONS=--max-old-space-size=8192
yarn pm2 kill
yarn start:pm2:dev
