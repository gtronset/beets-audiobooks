FROM lscr.io/linuxserver/beets:1.6.0-ls149

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy default config
COPY defaults/ defaults
