# Metadata Service

This service serves two purposes:
1. Hosting the base metadata for all external MNA NFTs
2. Allowing dynamic metadata to override the base metadata

## Running the service

1. Install dependencies: `npm install`
2. Run the service: `npm run start:dev`

## Running the service with Docker

1. Build the docker images: `docker compose build`
2. Start the docker containers: `docker compose up -d`

## Updating the base metadata

The base metadata is stored in the `metadata` directory. To update the base metadata, add the new metadata to the `metadata` directory.

There are also migration scripts to update the base metadata for each collection, see `scripts/migrate-metadata`.
