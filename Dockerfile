FROM dockerdist.bdmd.com/openweb-server:latest
LABEL description="Medical Bigdata Platform Web"

# Copy DOCKERIMAGE to /DOCKERIMAGE, this is used to avoid docker build cache for the following build commands
# The DOCKERIMAGE file is generated by openlight builder automatically
ADD DOCKERIMAGE /DOCKERIMAGE
# Add web static files
ADD web /var/lib/iyoudoctor.com/bigdata-web/web
# Add config
ADD config /etc/iyoudoctor.com/bigdata-web

