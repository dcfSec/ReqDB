FROM --platform=$BUILDPLATFORM node:22-alpine AS spa-build

WORKDIR /src
COPY spa ./
RUN npm install
RUN npm run build

FROM python:3.13-alpine AS api-build

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
ENV POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

RUN apk add build-base
RUN pip install poetry

WORKDIR /src
COPY poetry.lock .
COPY pyproject.toml .

RUN poetry install --only main

FROM python:3.13-alpine

WORKDIR /reqdb

COPY --from=spa-build /src/dist ./spa/dist
COPY --from=api-build /src/.venv ./.venv

COPY app.py ./
COPY api/ ./api
COPY auth/ ./auth
COPY helper/ ./helper

RUN adduser app -DHh /reqdb -u 1000
USER 1000

EXPOSE 8000
HEALTHCHECK CMD curl --fail http://localhost:8000/api/health || exit 1

CMD ["./.venv/bin/python", "app.py"]
