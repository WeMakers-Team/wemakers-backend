#!/bin/bash
cd /home/ubuntu
sudo chown -R ubuntu:ubuntu wemakers

cd /home/ubuntu/wemakers
yarn install
yarn generate:prisma

