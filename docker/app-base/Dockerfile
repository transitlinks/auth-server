FROM ubuntu:20.04
RUN apt update
RUN apt install -y build-essential python curl git vim
RUN apt install -y libpq-dev g++ make
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
RUN ls -al
RUN bash n lts
RUN bash n 14.16.0
RUN npm install --global yarn
RUN bash echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
