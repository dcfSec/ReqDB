FROM node:22-alpine AS build

WORKDIR /src
COPY front-end ./
RUN npm run build

FROM python:3.13-alpine
RUN mkdir front-end
COPY --from=build /src/dist ./front-end/dist

COPY app.py ./
COPY requirements.txt ./
COPY api/ ./api
COPY migrations/ ./migrations/

RUN apk add --no-cache g++ unixodbc-dev
RUN pip install -r requirements.txt

CMD ["gunicorn"  , "-b", "0.0.0.0:8080", "app:app"]