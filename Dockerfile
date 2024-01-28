FROM docker.io/hazmi35/node:20-dev-alpine as build-stage

LABEL name "pak-ustadz (build stage)"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Project files
COPY . .

# Build TypeScript Project
RUN pnpm run build

# Prune devDependencies
RUN pnpm prune --production

# Get ready for production
FROM docker.io/hazmi35/node:20-alpine

LABEL name "pak-ustadz"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

# Copy needed files
COPY --from=build-stage /tmp/build/package.json .
COPY --from=build-stage /tmp/build/pnpm-lock.yaml .
COPY --from=build-stage /tmp/build/node_modules ./node_modules
COPY --from=build-stage /tmp/build/dist ./dist
COPY --from=build-stage /tmp/build/drizzle ./drizzle
COPY --from=build-stage /tmp/build/LICENSE .

# Mark data folder as Docker volume
VOLUME [ "/app/data" ]

# Start the app with node
CMD ["node", "dist/index.js"]
