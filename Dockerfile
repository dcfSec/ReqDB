FROM --platform=$BUILDPLATFORM node:22-alpine AS build

WORKDIR /src
COPY spa ./
RUN npm install
RUN npm run build

FROM python:3.13-alpine
RUN mkdir spa
COPY --from=build /src/dist ./spa/dist

COPY app.py ./
COPY requirements.txt ./
COPY api/ ./api
COPY auth/ ./auth

RUN apk update && \
    apk add --no-cache g++ unixodbc-dev curl && \
    pip install --no-cache-dir --upgrade -r requirements.txt && rm requirements.txt && \
    apk del -r g++
# RUN chown -R nobody:nobody app.py api auth spa

# USER nobody
EXPOSE 8000
HEALTHCHECK CMD curl --fail --head http://localhost:8000/api/ || exit 1

CMD ["python", "app.py"]
