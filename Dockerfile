FROM lscr.io/linuxserver/beets:1.6.0-ls172

# Install dependencies
COPY requirements.txt .
RUN pip3 install -U --no-cache-dir --find-links https://wheel-index.linuxserver.io/alpine/ \
    -r requirements.txt

# Copy default config
COPY defaults/ defaults
