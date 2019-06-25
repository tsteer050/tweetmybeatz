#!/usr/bin/env bash


apt-get remove -y debian-keyring debian-archive-keyring
apt-get clean
apt-get update
apt-get install -y --force-yes debian-keyring debian-archive-keyring

echo 'deb http://www.deb-multimedia.org jessie main non-free' >> /etc/apt/sources.list
echo 'deb-src http://www.deb-multimedia.org jessie main non-free' >> /etc/apt/sources.list

apt-get remove -y --force-yes ffmpeg
apt-get install -y --force-yes build-essential libmp3lame-dev libvorbis-dev libtheora-dev libspeex-dev yasm pkg-config libx264-dev libav-tools ffmpeg