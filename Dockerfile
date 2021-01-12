FROM liuchong/rustup

ENV ROCKET_ADDRESS=0.0.0.0
ENV ROCKET_PORT=8000

RUN mkdir /home/rocket
RUN cd /home/rocket
COPY . /home/rocket/

WORKDIR /home/rocket/examples/server
RUN rustup default nightly
RUN cargo build

CMD ["cargo", "run"]