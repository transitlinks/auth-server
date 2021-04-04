FROM vhalme/txlinks-auth-base
RUN mkdir /transitlinks
RUN mkdir /transitlinks/images
RUN cd /transitlinks && \
  git clone https://github.com/transitlinks/auth-server.git && \
  cd auth-server && \
  yarn install
ADD assets/start.sh /
RUN chmod a+x /start.sh
CMD /start.sh
