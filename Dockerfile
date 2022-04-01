FROM docker.io/hazmi35/node:16-dev-alpine as build-stage

LABEL name "pak-ustadz (build stage)"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Project files
COPY . .

# Build TypeScript Project
RUN npm run build

# Prune devDependencies
RUN npm prune --production

# Get ready for production
FROM docker.io/hazmi35/node:16-alpine

LABEL name "pak-ustadz"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

# Copy needed files
COPY --from=build-stage /tmp/build/package.json .
COPY --from=build-stage /tmp/build/package-lock.json .
COPY --from=build-stage /tmp/build/node_modules ./node_modules
COPY --from=build-stage /tmp/build/dist ./dist
COPY --from=build-stage /tmp/build/prisma ./prisma
COPY --from=build-stage /tmp/build/data ./data
COPY --from=build-stage /tmp/build/LICENSE .

# Mark logs folder and data folder as Docker volume
VOLUME [ "/app/logs", "/app/data" ]

# Start the app with node
CMD ["node", "--experimental-specifier-resolution=node", "dist/index.js"]
