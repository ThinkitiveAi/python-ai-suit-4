FROM docker.io/postgres:17-alpine

# Or specify a specific minor version that matches your ICU library
# FROM docker.io/postgres:17.1

COPY ./compose/production/postgres/maintenance /usr/local/bin/maintenance
RUN chmod +x /usr/local/bin/maintenance/*
RUN mv /usr/local/bin/maintenance/* /usr/local/bin \
    && rmdir /usr/local/bin/maintenance
