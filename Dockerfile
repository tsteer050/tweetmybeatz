
FROM node:carbon
    ARG NODE_ENV='production'
    ENV NODE_ENV=$NODE_ENV

        ARG CONSUMER_KEY='6cyqAYryuNVrzDqj3kuJVZKo8'
    ENV CONSUMER_KEY=$CONSUMER_KEY

        ARG CONSUMER_SECRET='RoBVScAziZEFLrF6duDaI6Hmo4O2MqfYXZ89FZ6KEHe3yciuZm'
    ENV CONSUMER_SECRET=$CONSUMER_SECRET

ARG CALLBACK_URL='https://www.tweetmybeatz.com/twitter/callback'
        # ARG CALLBACK_URL='https://tweetmybeatz.herokuapp.com/twitter/callback'
    ENV CALLBACK_URL=$CALLBACK_URL
ADD setup-ffmpeg.sh /
RUN /setup-ffmpeg.sh
# Create app directory
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
# If you are building your code for production
# RUN npm install --only=production
# Bundle app source
COPY . .
EXPOSE 5000
CMD [ "npm", "start" ]








#     FROM ubuntu:latest
#     USER root
#     WORKDIR /home/app


    # ARG NODE_ENV='production'
    # ENV NODE_ENV=$NODE_ENV

    #     ARG CONSUMER_KEY='6cyqAYryuNVrzDqj3kuJVZKo8'
    # ENV CONSUMER_KEY=$CONSUMER_KEY

    #     ARG CONSUMER_SECRET='RoBVScAziZEFLrF6duDaI6Hmo4O2MqfYXZ89FZ6KEHe3yciuZm'
    # ENV CONSUMER_SECRET=$CONSUMER_SECRET

    #     ARG CALLBACK_URL='https://tweetmybeatz.herokuapp.com/twitter/callback'
    # ENV CALLBACK_URL=$CALLBACK_URL

#     COPY ./package.json /home/app/package.json
#     RUN apt-get update
#     RUN apt-get -y install curl gnupg
#     RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -


#     RUN apt-get update
#     RUN apt-get install -y software-properties-common

#     RUN apt-get install -y subversion yasm build-essential autoconf libtool \
# zlib1g-dev libbz2-dev libogg-dev libtheora-dev libvorbis-dev \
# libsamplerate-dev libxml2-dev libfribidi-dev \
# libass-dev libmp3lame-dev intltool libglib2.0-dev \
# libdbus-glib-1-dev libgtk-3-dev libgudev-1.0-dev libwebkitgtk-3.0-dev \
# libnotify-dev libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev \
# libappindicator-dev

#     RUN apt install -y vpx-tools libdvdnav4 libdvdread4 gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly 
#     RUN apt install -y ubuntu-restricted-extras

#     RUN add-apt-repository --yes ppa:stebbins/handbrake-releases \
#       && apt-get update -qq \
#       && apt-get install -qq handbrake-cli

#     RUN apt-get -y install nodejs
#     RUN npm install

#     COPY package.json .

#     RUN npm install

#     COPY . .

#     EXPOSE 5000

#     CMD [ "npm", "start" ]