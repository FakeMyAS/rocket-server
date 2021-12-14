FROM debian:stretch-slim

ENV ROCKET_ADDRESS=0.0.0.0
ENV ROCKET_PORT=8000
#ENV RUSTUP_HOME=/rust \
#CARGO_HOME=/cargo \
#PATH=/usr/local/cargo/bin:$PATH
ENV PATH="/root/.cargo/bin:${PATH}"

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        curl \
        git \
        ssh \
        libssl-dev \
        pkg-config && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN echo "(curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain nightly --no-modify-path) && rustup default nightly" > /install-rust.sh && chmod 755 /install-rust.sh
RUN /install-rust.sh
RUN cargo --version

RUN mkdir /home/rocket
RUN cd /home/rocket
COPY . /home/rocket/

WORKDIR /home/rocket/examples/server
#RUN rustup default nightly
RUN cargo build
CMD ./copy.sh
