FROM node:22-alpine AS build

WORKDIR /src
COPY front-end ./
RUN npm run build

FROM python:3.13-alpine
RUN mkdir front-end
COPY --from=build /src/dist ./front-end/dist

COPY app.py ./
COPY gunicorn.conf.py ./
COPY requirements.txt ./
COPY api/ ./api

RUN apk update && \
    apk add --no-cache g++ unixodbc-dev gnupg curl && \
    curl -O https://download.microsoft.com/download/7/6/d/76de322a-d860-4894-9945-f0cc5d6a45f8/msodbcsql18_18.4.1.1-1_amd64.apk && \
    curl -O https://download.microsoft.com/download/7/6/d/76de322a-d860-4894-9945-f0cc5d6a45f8/mssql-tools18_18.4.1.1-1_amd64.apk && \
    curl -O https://download.microsoft.com/download/7/6/d/76de322a-d860-4894-9945-f0cc5d6a45f8/msodbcsql18_18.4.1.1-1_amd64.sig && \
    curl -O https://download.microsoft.com/download/7/6/d/76de322a-d860-4894-9945-f0cc5d6a45f8/mssql-tools18_18.4.1.1-1_amd64.sig && \ 
    curl https://packages.microsoft.com/keys/microsoft.asc  | gpg --import - && \
    gpg --verify msodbcsql18_18.4.1.1-1_amd64.sig msodbcsql18_18.4.1.1-1_amd64.apk && \
    gpg --verify mssql-tools18_18.4.1.1-1_amd64.sig mssql-tools18_18.4.1.1-1_amd64.apk && \
    apk add --allow-untrusted msodbcsql18_18.4.1.1-1_amd64.apk && \
    apk add --allow-untrusted mssql-tools18_18.4.1.1-1_amd64.apk && \
    rm -rf msodbcsql18_18.4.1.1-1_amd64.sig msodbcsql18_18.4.1.1-1_amd64.apk && \
    rm -rf mssql-tools18_18.4.1.1-1_amd64.sig mssql-tools18_18.4.1.1-1_amd64.apk && \
    pip install --no-cache-dir --upgrade -r requirements.txt && \
    apk del -r g++ gnupg curl

EXPOSE 8000

CMD ["python", "app.py"]