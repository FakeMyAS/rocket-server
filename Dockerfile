FROM debian:stretch-slim

ENV ROCKET_ADDRESS=0.0.0.0
ENV ROCKET_PORT=8000
ENV RUSTUP_HOME=/usr/local/rustup \
CARGO_HOME=/usr/local/cargo \
PATH=/usr/local/cargo/bin:$PATH

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        gcc \
        libc6-dev \
        wget \
        ; \
    \
    url="https://static.rust-lang.org/rustup/dist/armv7-unknown-linux-gnueabihf/rustup-init"; \
    wget "$url"; \
    chmod +x rustup-init; \
    ./rustup-init -y --no-modify-path --default-toolchain nightly; \
    rm rustup-init; \
    chmod -R a+w $RUSTUP_HOME $CARGO_HOME; \
    rustup --version; \
    cargo --version; \
    rustc --version; \
    \
    apt-get remove -y --auto-remove \
        wget \
        ; \
    rm -rf /var/lib/apt/lists/*;

RUN mkdir /home/rocket
RUN cd /home/rocket
COPY . /home/rocket/

WORKDIR /home/rocket/examples/server
RUN rustup default nightly
RUN cargo build
CMD ./copy.sh