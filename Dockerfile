FROM --platform=$BUILDPLATFORM node:22-alpine AS build

WORKDIR /src
COPY spa ./
RUN npm install
RUN npm run build

FROM python:3.13-alpine

WORKDIR /home/reqdb
RUN mkdir spa
COPY --from=build /src/dist ./spa/dist

COPY app.py ./
COPY requirements.txt ./
COPY api/ ./api
COPY auth/ ./auth

RUN apk update && \
    apk add --no-cache g++ unixodbc-dev curl && \
    pip install --no-cache-dir --upgrade --no-deps -r requirements.txt && rm requirements.txt && \
    apk del -r g++

RUN addgroup --gid 1000 reqdb && adduser --disabled-password --home /reqdb --ingroup reqdb --no-create-home --uid 1000 reqdb
RUN chown -R reqdb:reqdb /home/reqdb
USER reqdb

EXPOSE 8000
HEALTHCHECK CMD curl --fail http://localhost:8000/api/health || exit 1

CMD ["python", "app.py"]
