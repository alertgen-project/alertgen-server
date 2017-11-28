#!/usr/bin/env bash
cd ..
docker build -t alertgen -f docker/Dockerfile .
